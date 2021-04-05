const express = require('express'),
http = require('http').Server(express),
io = require('socket.io')(http);
const mysql = require('mysql');
const pool = mysql.createPool({
    connectionLimit: 10 ,
    host: '127.0.0.1',
    user: 'digit',
    password: 'root',
    database: 'weHelp'
})
function getConnection(){
    return pool
}
function saveMessage(data){
    const queryString = "INSERT INTO `message_logs`(`from_user_id`,`from_user_name`, `to_user_id`, `to_user_name`, `date` , `job_id`) VALUES (?,?,?,?,?,?)";
    getConnection().query(queryString,[data.from_user_id,data.from_user_name,data.to_user_id,data.to_user_name,new Date().toISOString(),data.job_id],(err,results,fields)=>{
        console.log("Successfully Saved Message.");
        console.log(err)
    });
}
io.on('connection', (socket) => {

console.log('user connected')

socket.on('messagedetection', (data) => {
        saveMessage(data);
        io.emit('message', data )
    })
    socket.on('disconnect', function() {
    })
})

http.listen(8000, () => {
    console.log('Server is started at port 8000')
})

