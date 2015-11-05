var WebSocket = require("ws");
var request = require("request");
var util = require("util");
var events = require("events");
var Auth = require("./lib/auth.js");
var HitboxChannel = require("./lib/channel.js");
var Message = require("./lib/message.js");


/**
 * Creates the Hitbox.tv client. You need to call require("hitbox-chat-lib")
 * 
 * @param {object} opts
 * @return {object}
 */
var HitboxClient = function (opts) {
    opts = opts || {};
    if (!(opts.username && opts.password) && !(opts.token)) {
        throw "No credentials given. Aborting.";
    }
    
    opts.ignoreBan = opts.ignoreBan || false;
    opts.ignoreBuffer = opts.ignoreBuffer || true;
    this.opts = opts;
    events.EventEmitter.call(this);
    var self = this;
    
    this.channels = {};
    this.connected = false;
    this.username = opts.username;
    
    if (opts.token) {
        self.token = opts.token;
        self.getServers(function (response) {
            self.servers = response.servers;
            self.serversOnline = response.serversOnline;
            if (self.serversOnline > 0) {
                self.open();
            } else {
                throw "No servers were available.";
            }
        });
    } else {
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
};
util.inherits(HitboxClient, events.EventEmitter);

/**
 * Actually handles stuff
 * Parses incoming socket messages and makes them actually human readable
 */
HitboxClient.prototype.onconnect = function (socket) {
    var self = this;
    self.connected = true;
    self.socket = socket;
    socket.on("message", function (data) {
        var flag = parseInt(data.split(":")[0]);
        switch (flag) {
            case 0:
                self.close();
                console.error("Client has been disconnected.");
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

/**
 * Redirects an incoming message to the channel object
 */
HitboxClient.prototype.onmessage = function (message) {
    var channel = message.params.channel;
    if (channel in this.channels) {
        this.channels[channel].onmessage(message);
    } else {
        throw "Could not find channel " + channel;
    }
};

/**
 * The actual send method
 * Sends a message through the socket with the given method and parameters
 * 
 * @param {string} method - Must be a valid method for messages
 * @param {object} params - An object of params that should be sent along with the method
 */ 
HitboxClient.prototype.send = function (method, params) {
    var self = this;
    params.name = params.name || self.username;
    params.token = params.token || self.token;
    var args = [{ method: method, params: params }];
    args = JSON.stringify(args);
    self.socket.send('5:::{"name":"message","args":' + args + '}');
};

/**
 * Gets a list of available servers from Hitbox.tv
 * This is for internal usage only
 */
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

/**
 * Opens the socket by connecting to the Hitbox.tv servers
 */
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

/**
 * Closes the connected socket aka the client
 */
HitboxClient.prototype.close = function () {
    this.socket.close();
};

/**
 * Joins the given channel and returns a channel object
 * 
 * @param {string} channel - The channel name to join
 * @return {object}
 */
HitboxClient.prototype.joinChannel = function (channel) {
    if (!this.connected) throw "Client not connected.";
    
    var c = this.channels[c];
    
    if (!c) {
        c = this.channels[channel] = new HitboxChannel(this, channel);
    }
    
    c.join();
    return c
};

module.exports = HitboxClient;