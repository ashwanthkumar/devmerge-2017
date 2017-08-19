'use strict';
var mongoose = require('./mongo');
var User = require('./models').User;

module.exports = (function() {
    return {
        get: function(collection, userId, callback) {
            if(!collection) {
                callback('Mongo Collection name is not set.', null);
            }

            User.findOne({userId: userId}, (err, user) => {
                if(err) {
                    console.log('get error: ' + JSON.stringify(err, null, 4));
                    callback(err, null);
                } else {
                    if(isEmptyObject(user)) {
                        callback(null, {});
                    } else {
                        callback(null, user.attributes);
                    }
                }
            });
        },

        set: function(collection, userId, attributes, callback) {
            if(!collection) {
                callback('Mongo Collection name is not set.', null);
            }

            User.findOneAndUpdate(
                {userId: userId},
                {userId: userId, attributes: attributes},
                {upsert: true, setDefaultsOnInsert: true, fields: "userId"},
                (err) => {
                  if(err) {
                    console.log("Error while doing Upsert - " + err);
                  }
                  callback(err, attributes);
                }
            );
        }
    };
})();

function isEmptyObject(obj) {
    return !obj || !Object.keys(obj).length;
}
