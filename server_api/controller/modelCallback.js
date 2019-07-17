var app = require('express');
var commonfn = require('../../common');
var Notification = require('../schemas/notification');
//var socket = require('../../socket/socketNotification')
var socket = require('../../socket/socketConnection.js');

module.exports = {
    NotiAdd: function (arrobj, callback) {
        try {
            Notification.insertMany(arrobj, function (err, data) {
                if (!err) {
                    //console.log(data);
                    data.forEach(ele => {
                        if(ele.type ==='Notification'){
                            Notification.findById (ele._id).populate('profileidby').populate('profileidfor').exec().then(data => {
                                //console.log("data notification",data);
                                socket.socketEmit(ele.profileidfor, data);
                               //socket.in(ele.profileidfor).emit('getCaseNotification', data);
                            });
                        }
                    }); 
                    return callback({stt:true}) ;
                } else {
                    return callback({stt:false});
                }
            });
        } catch (error) {
            return callback({stt:false});
        }
    }
};