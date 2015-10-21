var events = require("events");
var util = require("util");

function HitboxChannel(client, channel) {
    
    events.EventEmitter.call(this);
    this.channel = channel;
    this.client = client;
    this.joined = false;
    this.loggedIn = false;
    this.role = null;
    this.name = null;
    this.defaultColor = "0000FF";

    this.poll = null; //for the future
    this.raffle = null; //for the future

}

util.inherits(HitboxChannel, events.EventEmitter);

HitboxChannel.prototype.onmessage = function (message) {
    switch (message.method) {
        case "loginMsg":
            this.loggedIn = true;
            this.name = message.params.name;
            this.role = message.params.role;
            this.emit("login", message.params.name, message.params.role);
            break;
        case "chatMsg":
            this.emit("chat", message.params.name, message.params.text, message.params.role);
            break;
        case "motdMsg":
            this.emit("motd", message.params.text);
            break;
        case "slowMsg":
            this.emit("slow", message.params.slowTime);
            break;
        case "infoMsg":
            this.emit("info", message.params.text);
            break;
        default:
            this.emit("other", message.method, message.params);
            break;
    }
};

HitboxChannel.prototype.send = function (method, params, auth) {
    params.channel = this.channel;
    this.client.send(method, params, auth);
};

HitboxChannel.prototype.join = function () {
    if (this.joined) return;
    this.joined = true;
    this.send("joinChannel", { isAdmin: false }, true);
};
HitboxChannel.prototype.leave = function () {
    if (!this.joined) return;
    this.client.send("partChannel", { channel: this.channel, name: this.name });
    this.joined = false;
    this.loggedIn = false;
    this.role = null;
    this.name = null;
};
HitboxChannel.prototype.sendMessage = function (text, nameColor) {
    var color = nameColor || this.defaultColor;
    this.send("chatMsg", {
        nameColor: color,
        text: text
    });
};
module.exports = HitboxChannel;