﻿function Moderation(client, channel) {
    this.channel = channel;
    this.client = client;
    this.role = channel.role;
    this.slow = null;
}

Moderation.prototype.kick = function (username, timeout) {
    timeout = timeout || 600; //default timeout time is 10 minutes
    if (this.role === "user" || this.role === "admin") {
        this.channel.send("kickUser", { name: username, timeout: timeout });
    }
};
Moderation.prototype.timeout = function (username, timeout) {
    this.kick(username, timeout);
};

Moderation.prototype.ban = function (username) {
    if (this.role === "user" || this.role === "admin") {
        this.channel.send("banUser", { name: username });
    }
};


Moderation.prototype.ipban = function (username) {
    if (this.role === "admin") {
        this.channel.send("banUser", { name: username, banIP: true });
    }
};

Moderation.prototype.unban = function (username) {
    if (this.role === "user" || this.role === "admin") {
        this.channel.send("unbanUser", { name: username });
    }
};

Moderation.prototype.mod = function (username) {
    if (this.role === "admin" && this.channel.channel === this.client.username) {
        this.channel.send("makeMod", { name: username });
    }
};

Moderation.prototype.unmod = function (username) {
    if (this.role === "admin" && this.channel.channel === this.client.username) {
        this.channel.send("removeMod", { name: username });
    }
};

Moderation.prototype.slow = function (time, subscriber) {
    if (this.role === "user" || this.role === "admin") {
        subscriber = subscriber || false;
        if (subscriber) {
            this.channel.send("slowMode", { subscriber: subscriber, rate: 0 });
            this.slow = subscriber;
        } else {
            this.channel.send("slowMode", { time: time });
            this.slow = slow;
        }
    }
};

Moderation.prototype.unslow = function () {
    if (this.role === "user" || this.role === "admin") {
        if (this.slow === "subscriber") {
            this.channel.send("slowMode", { subscriber: false });
        } else if(this.slow === "slow"){
            this.channel.send("slowMode", { time: 0 });
        }
    }}
module.exports = Moderation;