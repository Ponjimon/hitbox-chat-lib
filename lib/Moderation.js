/**
 * Creates the moderation object and makes moderation methods available
 * 
 * @param {object} client
 * @param {object} channel
 * 
 * @return {object}
 */
function Moderation(client, channel) {
    this.channel = channel;
    this.client = client;
    this.role = channel.role;
    this.slow = null;
}

/**
 * Kicks the given user for the given seconds
 * This is the same as .timeout()
 * 
 * @param {string} username
 * @param {integer} timeout - The time in seconds that the kicked user will be unable to send something
 */
Moderation.prototype.kick = function (username, timeout) {
    timeout = timeout || 600; //default timeout time is 10 minutes
    if (this.role === "user" || this.role === "admin") {
        this.channel.send("kickUser", { name: username, timeout: timeout });
    }
};
Moderation.prototype.timeout = function (username, timeout) {
    this.kick(username, timeout);
};

/**
 * Bans the given user
 * 
 * @param {string} username
 */
Moderation.prototype.ban = function (username) {
    if (this.role === "user" || this.role === "admin") {
        this.channel.send("banUser", { name: username });
    }
};

/**
 * IP-ban the given user
 * 
 * @param {string} username
 */
Moderation.prototype.ipban = function (username) {
    if (this.role === "admin") {
        this.channel.send("banUser", { name: username, banIP: true });
    }
};

/**
 * Unbans the given user
 * 
 * @param {string} username
 */
Moderation.prototype.unban = function (username) {
    if (this.role === "user" || this.role === "admin") {
        this.channel.send("unbanUser", { name: username });
    }
};

/**
 * Makes the given user a moderator
 * 
 * @param {string} username
 */
Moderation.prototype.mod = function (username) {
    if (this.role === "admin" && this.channel.channel === this.client.username) {
        this.channel.send("makeMod", { name: username });
    }
};

/**
 * Revokes moderator rights of the given user
 * 
 * @param {string} username
 */
Moderation.prototype.unmod = function (username) {
    if (this.role === "admin" && this.channel.channel === this.client.username) {
        this.channel.send("removeMod", { name: username });
    }
};

/**
 * Enables slow mode or subscriber only mode for the chat
 * 
 * @param {integer} time - The time in seconds that have to pass before another message can be sent (0 for disabling slowMode)
 * @param {boolean} subscriber - If set to true subscriber only mode will be activated
 */
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

/**
 * Disabled slow mode or subscriber mode
 */
Moderation.prototype.unslow = function () {
    if (this.role === "user" || this.role === "admin") {
        if (this.slow === "subscriber") {
            this.channel.send("slowMode", { subscriber: false });
        } else if(this.slow === "slow"){
            this.channel.send("slowMode", { time: 0 });
        }
    }}
module.exports = Moderation;