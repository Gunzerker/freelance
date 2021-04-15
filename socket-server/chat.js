let app = require('express')();
​
let http = require('http').Server(app);
​
let io = require('socket.io')(http);
​
const mysql = require('mysql');
​
const pool = mysql.createPool({
    connectionLimit: 10 ,
    host: '127.0.0.1',
    user: 'digit',
    password: 'root',
    database: 'weHelp'
})
​
​
function getConnection(){
    return pool
}
function saveMessage(data){
    const queryString = "INSERT INTO `message_logs`(`from_user_id`,`from_user_name`, `to_user_id`, `to_user_name`, `date` , `job_id` , `message_content`) VALUES (?,?,?,?,?,?,?)";
    getConnection().query(queryString,[data.from_user_id,data.from_user_name,data.to_user_id,data.to_user_name,new Date().toISOString(),data.job_id,data.message_content],(err,results,fields)=>{
        console.log("Successfully Saved Message.");
        console.log(err)
    });
}
​
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})
​
io.on('connect', (socket) => {
    io.emit('noOfConnections', Object.keys(io.sockets.connected).length)
    console.log("user connected")
​
    socket.on('disconnect', () => {
        console.log('disconnected')
        io.emit('noOfConnections', Object.keys(io.sockets.connected).length)
    })
​
    socket.on('messagedetection', (data) => {
        saveMessage(data);
        io.emit('message', data )
    })
​
​
​
    socket.on('new message', (msg) => {
        console.log(msg)
        socket.broadcast.emit('new message', msg)
    })
    socket.on('new transaction', (msg) => {
        console.log(msg)
        socket.broadcast.emit('new transaction', msg)
    })
    socket.on('joined', (name) => {
        console.log('joined '.name)
        socket.broadcast.emit('joined', name)
    })
    socket.on('leaved', (name) => {
        console.log('leaved '.name)
        socket.broadcast.emit('leaved', name)
    })
​
    socket.on('typing', (data) => {
        console.log('typing '.data)
        socket.broadcast.emit('typing', data)
    })
    socket.on('stoptyping', () => {
        console.log('stoptyping '.data)
        socket.broadcast.emit('stoptyping')
    })
​
​
})
​
http.listen(8000, () => {
    console.log('Server is started at http://localhost:8000')
})