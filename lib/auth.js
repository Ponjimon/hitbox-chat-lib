var request = require("request");


module.exports.getToken = function(opts, cb) {
    var self = this;
    if(opts.token) {
      request({
          uri: "https://api.hitbox.tv/userfromtoken/" + opts.token,
          method: "GET"
      }, function (error, response, body) {
          if (!error && response.statusCode === 200) {
              data = JSON.parse(body);
              return cb(data);
          } else if (response.statusCode !== 200) {
              throw "Authentication failed! Received statuscode: " + response.statusCode;
          }
          if (error) throw error;
      });
    }else{
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
              return cb(data);
          } else if (response.statusCode !== 200) {
              throw "Authentication failed! Received statuscode: " + response.statusCode;
          }
          if (error) throw error;
      });
    }
};
