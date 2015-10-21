module.exports.parse = function (message) {
    message = JSON.parse(message.substr(4));
    args = JSON.parse(message.args[0]);
    return { method: args.method, params: args.params };
};