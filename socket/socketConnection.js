

module.exports =  {
    start : function() {
        io.on('connection', function(socket) {
            console.log('socketIO connected.');
        
                    socket.on('join', function(data){
                      //console.log('socketIO Join.', data.room);
                      socket.join(data.room);
                    });
                
                    socket.on('leave', function(data){   
                       // console.log({shiv : data});
                      console.log('socketIO leave.');
                      socket.leave(data.room);
                    });
                    
        });
    },
    socketEmit : function(room, data) {
       // console.log("dataemit" , data);
        //console.log("room emit" , room);
        io.in(room).emit('getCaseNotification', data);
    }

    // io.on('connection', function(socket) {
    //         console.log('socketIO connected.');
        
    //         socket.on('join', function(data){
    //           console.log('socketIO Join.', data.room);
    //           socket.join(data.room);
    //         });
        
    //         socket.on('leave', function(data){   
    //             console.log({shiv : data});
    //           console.log('socketIO leave.');
    //           socket.leave(data.room);
    //         });
            
    //         socket.on('setCaseNotification',function(data){
    //             console.log({shiv : data});
    //             socket.broadcast.to(data.room).emit('getCaseNotification', data);
    //             // io.in(data.room).emit(' newCaseNotification', { user:data.user , message:data.message });
    //         })
    //         socket.on('registerArbitration',function(data){
    //              //console.log({shiv : data});
    //             socket.broadcast.to(data.room).emit('getCaseNotification', data);
    //             // io.in(data.room).emit(' newCaseNotification', { user:data.user , message:data.message });
    //         })
    //             // const taskCollection = db.collection('notifications');
    //             // const changeStream = taskCollection.watch();
    //             // changeStream.on('change', (change) => {
    //             // console.log('Changes>>>', change);
    //             // socket.broadcast.to(data.room).emit('getCaseNotification', data);
    //             // });
    //     });
    // function socketEmit(room, data){
    //     socket.in(room).emit('getCaseNotification', data);
    // }

        
};
