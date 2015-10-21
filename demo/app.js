/* 
 * This file is just for demonstration or test purposes
 * Please ignore this file when using this project in productive environment
 */
var HitboxClient = require("../index.js");
var config = require("./config.json");
var client = new HitboxClient({ username: config.username, password: config.password });
client.on("connect", function () {
    console.info("Connected.");
    var channel = client.joinChannel(config.channel);
    
    channel.on("login", function (name, role) {
        console.info("Logged in!");
    }).on("chat", function (name, text, role) {
        console.log(name + " : " + text);
    }).on("motd", function (text) {

    }).on("slow", function (slowTime) {

    }).on("info", function (text) {

    }).on("other", function (method, params) {

    });
}).on("disconnect", function () {
    console.error("Disconnected.");
});