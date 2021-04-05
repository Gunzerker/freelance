const socket = require('socket.io-client');
//const envConfig = require("./helpers/helpers").getEnvConfig;

class AppSocket {
    constructor(options = {}) {
        this.socket = socket("http://localhost:8000/");
        this.socket.on('connect', () => { });
        this.socket.on('disconnect', (err) => {
            console.error('disconnect socket', err);
        });
    }

    emit(event, data) {
        return this.socket.emit(event, data);
    }

        listen(event, callback) {
        return this.socket.on(event, callback);
    }
}
const appsocketinst = new AppSocket();
appsocketinst.emit("messagedetection",{from_user_id:1,from_user_name:"test",to_user_id:2,to_user_name:"test2",job_id:5,message_content:"abcd"});
appsocketinst.listen("message",(data)=>{
 console.log(data)
})
module.exports = AppSocket;
