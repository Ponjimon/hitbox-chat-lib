﻿ var request = require("request");
var _ = require("underscore");

module.exports.getToken = function (opts, cb) {
    var self = this;
    if (_.has(opts, "username") && _.has(opts, "password")) {
        request({
            uri: "https://api.hitbox.tv/auth/token",
            method: "POST",
            form: {
                login: opts.username,
                pass: opts.password,
                app: "desktop"
            }
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                data = JSON.parse(body);
                return cb(data.authToken);
            } else if (response.statusCode !== 200) {
                throw "Authentication failed! Received statuscode: " + response.statusCode;
            }
            if (error) throw error;
        });
    } else if (_.has(opts, "token")) {
        request({
            uri: "https://api.hitbox.tv/auth/login",
            method: "POST",
            form: {
                authToken: opts.token,
                app: "desktop"
            }
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                data = JSON.parse(body);
                return cb(data);
            } else if (response.statusCode !== 200) {
                throw "Authentication failed! Received statuscode: " + response.statusCode;
            }
            if (error) throw error;
        });
    }
};
