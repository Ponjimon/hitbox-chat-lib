var WebSocket = require("ws");
var request = require("request");
var util = require("util");
var events = require("events");
var Auth = require("./lib/auth.js");
var HitboxChannel = require("./lib/channel.js");
var Message = require("./lib/message.js");

var HitboxClient = function (opts) {
    opts = opts || {};
    if (!opts.username && !opts.password) {
        throw "No credentials given. Aborting.";
    }

    events.EventEmitter.call(this);
    var self = this;

    this.channels = {};
    this.connected = false;
    this.username = opts.username;

    Auth.getToken(opts, function (token) {
        self.token = token;
        
        self.getServers(function (response) {
            self.servers = response.servers;
            self.serversOnline = response.serversOnline;
            if (self.serversOnline > 0) {
                self.open();
            } else {
                throw "No servers were available.";
            }
        });
    });
}
util.inherits(HitboxClient, events.EventEmitter);

HitboxClient.prototype.onconnect = function (socket) {
    var self = this;
    self.connected = true;
    self.socket = socket;
    socket.on("message", function (data) {
        var flag = parseInt(data.split(":")[0]);
        switch (flag) {
            case 0:
                throw "Server not available.";
                return;
            case 1:
                break;
            case 2:
                self.socket.send("2::", function ack(error) {
                    if (error) console.error(error);
                });
                break;
            case 5:
                var message = Message.parse(data);
                self.onmessage(message);
                break;
        }
    });
    socket.on("close", function () {
        self.emit("disconnect");
    });
    self.emit("connect");
};
HitboxClient.prototype.onmessage = function (message) {
    var channel = message.params.channel;
    if (channel in this.channels) {
        this.channels[channel].onmessage(message);
    } else {
        throw "Could not find channel " + channel;
    }
};
HitboxClient.prototype.send = function (method, params, auth) {
    var self = this;
    params.name = self.username;
    if (auth) params.token = self.token;
    var args = [{ method: method, params: params }];
    args = JSON.stringify(args);
    self.socket.send('5:::{"name":"message","args":' + args + '}');
}
HitboxClient.prototype.getServers = function (cb) {
    request({
        uri: "https://api.hitbox.tv/chat/servers?redis=true",
        method: "GET",
        gzip: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var servers = JSON.parse(body);
        } else {
            var servers = {};
        }
        if (servers.length > 0) {
            var serversOnline = servers.length;
        } else {
            var serversOnline = 0;
        }
        return cb({ servers: servers, serversOnline: serversOnline });
    });
};
HitboxClient.prototype.open = function () {
    var i = -1;
    var self = this;
    (function next() {
        i = (i + 1) % self.servers.length;
        request({
            uri: "http://" + self.servers[i].server_ip + "/socket.io/1",
            method: "GET"
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var sock = new WebSocket("ws://" + self.servers[i].server_ip + "/socket.io/1/websocket/" + body.split(":")[0]);
                sock.on("open", self.onconnect.bind(self, sock));
                sock.on("error", next);
            }
        });
    })();
};
HitboxClient.prototype.joinChannel = function (channel) {
    if (!this.connected) throw "NotConnected";

    var c = this.channels[c];

    if (!c) {
        c = this.channels[channel] = new HitboxChannel(this, channel);
    }

    c.join();
    return c
}

module.exports = HitboxClient;