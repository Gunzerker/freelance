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

const storage = multer.diskStorage({ 
    destination: function(req, file, cb){
        cb(null,'./uploads/');
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
    user: 'digit',
    password: 'root',
    database: 'weHelp'
})
function getConnection(){
    return pool
}

function send_sms(phone){

    client.verify.services(config.TWILLIO_SERVICEID)
                    .verifications
                    .create({ to: phone, channel: 'sms' })
                    .then(verification => {
                                    res.status(200).json({
                                        success:true,
                                        message:"API.code_sent",
                                        data:null
                                    })

                    }).catch(err => {
                        res.status(500).json({
                            success:false,
                            message:"API.INTERNEL-SERVER-ERROR",
                            data:err
                        })
                        console.log(err)});
}
//passport.authenticate("jwt", { session: false })
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());

router.post('/register',(req,res) => {
    try{
    const {user_name,user_last_name,email,phone,region,password} = req.body;
    let queryString = "SELECT * FROM users WHERE phone = ?";
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

}catch(err){
    console.log(err)
}
})

router.post('/verify',(req,res) => {
    const {phone,code} = req.body;
    client.verify.services(config.TWILLIO_SERVICEID)
    .verificationChecks
    .create({ to: phone, code: code })
    .then(async verification_check => {
                    if (verification_check.status === 'approved') {
                        const queryString = "UPDATE `users` SET verified = 1 WHERE phone = ?";
                        getConnection().query(queryString,[phone],(err,results,fields)=>{
                            if(err){
                                console.log("[ERROR]"+err)
                                res.sendStatus(500)
                                res.send("Erreur")
                                return
                            }
                            res.status(200).json({
                                success:true,
                                message:"API.CODE-VALIDATED",
                                data:null
                            })
                        });
                    }
                    else {
                                    res.status(400).json({
                                                    success: false,
                                                    message: 'API.invalide_code',
                                                    data: null
                                    })
                    }
    }).catch(err => {
                    res.status(400).json({
                                    success: false,
                                    message: 'API.invalide_code',
                                    data: null
                    })
    });
})



router.post('/login',(req,res) => {

    const {phone,password} = req.body;
    const  queryString = "SELECT * FROM users WHERE phone = ? AND password = ?"
    getConnection().query(queryString,[phone,password],(err,rows,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("fail")
            return
        }
                console.log("Successfully fetched.")
        if(rows.length == 0)
            return res.json({
                success:false,
                message:"API.USER-NOT-EXIST",
                data:null
            })
        if(rows[0].verified == 0)
            return res.json({
                success:false,
                message:"API.USER-NOT-VERIFIED",
                data:null
            })
        delete rows[0].password;
        let obj = JSON.stringify(rows[0]);
        rows[0].token = generateToken(JSON.parse(obj));
        return res.json({success:true,message:"API.USER-FETCHED",data:rows[0]})
    })
})


router.delete('/delete/:id',(req,res)=>{
    const ID = req.params.ID
    const queryString = "DELETE FROM  accounts WHERE ID = ?"
    getConnection().query(queryString,[ID],(err,rows,fields)=>{
        if(err){
            res.sendStatus(500)
            return
        }
        console.log("Successfully deleted.")
        res.end()
    }) 
 })
 

  
router.post('/uploadimage/:ID',upload.single('UserAccount'),(req,res)=>{

    const imageName =  Date.now() + "-" + req.file.originalname;
    console.log(imageName);
    const ID = req.params.ID;
     const queryString = "UPDATE `accounts` SET ProfilPicture=? WHERE ID=?"
     getConnection().query(queryString,[imageName,ID],(err,rows,fields)=>{
         if(err){
             console.log("[ERROR]",err)
             res.sendStatus(500)
             return
         }
         console.log("Successfully updated.")
         res.end()
 
     })
 })
 

module.exports = router;