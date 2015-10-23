var events = require("events");
var util = require("util");
var Moderation = require("./Moderation.js");
function HitboxChannel(client, channel) {
    
    events.EventEmitter.call(this);
    this.channel = channel;
    this.client = client;
    this.joined = false;
    this.loggedIn = false;
    this.role = null;
    this.name = null;
    this.defaultColor = "31FF00";

    this.poll = null; //for the future
    this.raffle = null; //for the future

}

util.inherits(HitboxChannel, events.EventEmitter);

HitboxChannel.prototype.moderation = function () {
    return new Moderation(this.client, this);
};

HitboxChannel.prototype.onmessage = function (message) {
    switch (message.method) {
        case "loginMsg":
            this.loggedIn = true;
            this.name = message.params.name;
            this.role = message.params.role;
            this.emit("login", message.params.name, message.params.role);
            break;
        case "chatMsg":
            if (this.client.opts.ignoreBuffer && message.params.buffer) return;
            this.emit("chat", message.params.name, message.params.text, message.params.role, message.params);
            break;
        case "directMsg":
            this.emit("whisper", message.params.text, message.params.from, message.params.nameColor, message.params);
        case "motdMsg":
            this.emit("motd", message.params.text);
            break;
        case "slowMsg":
            this.emit("slow", message.params.slowTime);
            break;
        case "infoMsg":
            if (message.params.text === "You are banned from this channel." && this.client.opts.ignoreBan === false) this.leave();
            this.emit("info", message.params.text, message.params.action, message.params);
            break;
        case "chatLog":
            if (this.client.opts.ignoreBuffer && message.params.buffer) return;
            this.emit("log", message.params);
            break;
        case "userList":
            this.emit("userList", message.params.data, message.params.channel);
            break;
        case "userInfo":
            this.emit("userInfo", message.params);
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
    this.client.send("partChannel", { name: this.name });
    this.joined = false;
    this.loggedIn = false;
    this.role = null;
    this.name = null;
};
HitboxChannel.prototype.sendMessage = function (text, nameColor) {
    var color = nameColor || this.defaultColor;
    this.send("chatMsg", { nameColor: color, text: text });
};

HitboxChannel.prototype.getUserList = function () {
    this.send("getChannelUserList");
};

HitboxChannel.prototype.whisper = function (text, username, nameColor) {
    nameColor = nameColor || this.defaultColor;
    this.send("directMsg", { from: this.name, to: username, nameColor: nameColor, text: text });
};
module.exports = HitboxChannel;