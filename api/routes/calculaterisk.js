let socket = require('socket.io-client');
socket = socket('http://localhost:3003');
socket.on('connect', () => { });
socket.on('disconnect', (err) => {
    console.error('disconnect socket', err);
});

const express = require('express');
const router = express.Router();
const mysql = require('mysql');
router.use(express.static('./public'))
const bodyParser = require('body-parser');
const multer = require('multer');
const jwt = require("jsonwebtoken");
const config = require("../../config/config.json")
const generateToken = require("../../functions/generateTokens")
const accountSid = config.TWILLIO_ACCOUNTSID;
const authToken = config.TWILLIO_AUTHTOKEN;
const client = require('twilio')(accountSid, authToken);
const mime = require("mime");
const passport = require("passport");
const fs = require("fs");
require("../../middleware/passport")(passport);


const storage = multer.diskStorage({ 
    destination: function(req, file, cb){
        cb(null,'./upload');
    },
    filename: function(req, file, cb) {
        cb(null,  Date.now() + "-" + file.originalname);
    },

});

const upload = multer({storage: storage,
limits:{
    fieldSize: 1024 * 1024 * 5
}});

const pool = mysql.createPool({
    connectionLimit: 10 ,
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'weHelp'
})
function getConnection(){
    return pool
}

router.post('/register',(req,res) => {
    var separationsZero = 0;
    var separationsOne = 0;
    var separationsTwo = 0;
    try{
    const {user_name} = req.body;
    user_name.forEach(element => {
        console.log(element);
        if (element == 0) separationsZero = separationsZero + element;    
        else if (element == 1) separationsOne = separationsOne + element;  
        else separationsTwo = separationsTwo + element;  
      });
      console.log(separationsZero + "    " + separationsOne + "    " + separationsTwo);


      /**
       * let queryString = "SELECT * FROM users WHERE phone = ?";
    getConnection().query(queryString,[phone],(err,results,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("Erreur")
            return
        }
        if(results.length !==0)
        return res.status(200).json({
            success:false,
            message:"API.USER-ALREADY-EXIST",
            data:null
        })
        queryString = "INSERT INTO `users`(`user_name`, `user_last_name`,`email`, `phone`, `region`, `password`) VALUES (?,?,?,?,?,?)";
        getConnection().query(queryString,[user_name,user_last_name,email,phone,region,password],(err,results,fields)=>{
            if(err){
                console.log("[ERROR]"+err)
                res.sendStatus(500)
                res.send("Erreur")
                return
            }
            send_sms(phone);
            res.status(200).json({
                success:true,
                message:"API.USER-CREATED",
                data:null
            })
            console.log("Successfully Added User.");
        });
        console.log("Successfully Added User.");
    });
       */

}catch(err){
    console.log(err)
}
})

module.exports = router;