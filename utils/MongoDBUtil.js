const mongoose = require('mongoose');
const DB_URL='mongodb://127.0.0.1:27017/novel';
mongoose.connect(DB_URL,{
    useMongoClient: true,
    socketTimeoutMS: 0,
    keepAlive: true,
    reconnectTries: 30
});


var db = mongoose.connection;

/**
  * 连接成功
  */
  db.on('connected', function () {    
    console.log('Mongoose connection open to ' + DB_URL);  
});    

/**
 * 连接异常
 */
db.on('error',function (err) {    
    console.log('Mongoose connection error: ' + err);  
});    
 
/**
 * 连接断开
 */
db.on('disconnected', function () {    
    console.log('Mongoose connection disconnected');  
}); 


module.exports = mongoose;