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
    user: 'root',
    password: '',
    database: 'weHelp'
})
​
​
function getConnection(){
    return pool
}
function saveMessage(data){
    const queryString = "INSERT INTO `message_logs`(`from_user_id`,`from_user_name`, `to_user_id`, `to_user_name`, `date` , `job_id` , `message_content`) VALUES (?,?,?,?,?,?,?)";
    getConnection().query(queryString,[data.from_user_id,data.from_user_name,data.to_user_id,data.to_user_name,new Date().toISOString(),0,data.message_content],(err,results,fields)=>{
        console.log("Successfully Saved Message.");
        console.log(err)
    });
}
io.on('connection', (socket) => {

console.log('user connected')

socket.on('messagedetection', (data) => {
	console.log(data);
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

http.listen(3003, () => {
    console.log('Server is started at port 8000')
})

