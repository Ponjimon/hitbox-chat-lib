var events = require("events");
var util = require("util");
var Moderation = require("./Moderation.js");

/**
 * Creates and returns the channel object for the client
 * 
 * @param {object} client
 * @param {string} channel
 * 
 * @return {object}
 */
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

/**
 * Instantiates the moderation stuff and makes it available for usage
 * 
 * @return {object}
 */
HitboxChannel.prototype.moderation = function () {
    return new Moderation(this.client, this);
};

/**
 * Filters all the incoming messages by their various types
 * And emits something to the eventListener
 */
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

/**
 * Sends stuff
 */
HitboxChannel.prototype.send = function (method, params) {
    params.channel = this.channel;
    this.client.send(method, params);
};

/**
 * Joins the channel
 * Don't be surprised, a channel parameter is not needed here
 * as it is already assigned in the client's .send() method
 */
HitboxChannel.prototype.join = function () {
    if (this.joined) return;
    this.joined = true;
    this.send("joinChannel", { isAdmin: false }, true);
};

/**
 * Leaves the channel (obviously)
 * Client will get disconnected as a result
 */
HitboxChannel.prototype.leave = function () {
    if (!this.joined) return;
    this.client.send("partChannel", { name: this.name });
    this.joined = false;
    this.loggedIn = false;
    this.role = null;
    this.name = null;
};

/**
 * This is the actual send text message
 * It uses the chatMsg method for actually communicating with other people in the chat
 * 
 * @param {string} text
 * @param {string} nameColor - Usually a hexcode color like 0F0F0F
 */
HitboxChannel.prototype.sendMessage = function (text, nameColor) {
    var color = nameColor || this.defaultColor;
    this.send("chatMsg", { nameColor: color, text: text });
};


/**
 * Requests the userList of the current channel
 * The userList is not returned here. To get it, have a look at .onmessage()
 */
HitboxChannel.prototype.getUserList = function () {
    this.send("getChannelUserList");
};

/**
 * Whispers a message to the given user
 * 
 * @param {string} text
 * @param {string} username - The user you want to send a whisper message
 * @param {nameColor}
 */
HitboxChannel.prototype.whisper = function (text, username, nameColor) {
    nameColor = nameColor || this.defaultColor;
    this.send("directMsg", { from: this.name, to: username, nameColor: nameColor, text: text });
};
module.exports = HitboxChannel;