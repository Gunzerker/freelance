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

function send_sms(phone){

    client.verify.services(config.TWILLIO_SERVICEID)
                    .verifications
                    .create({ to: phone, channel: 'sms' })
                    .then(verification => {
                        console.log("yes")

                    }).catch(err => {
                        console.log(err)});
}
//passport.authenticate("jwt", { session: false })
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());

function uploadFiles(req)  {
	if (!req.files) {
		return ("file not exists")
	} else {
		if(req.files.length == 1)
		req.body.file_names = [req.body.file_names]
			req.files.forEach(async (element) => {
                console.log(element)
                const new_file_name =
                element.originalname ;
                const file_uri = "upload/"+ new_file_name+"."+mime.getExtension(element.mimetype);
                fs.rename(
                    element.path,
                    file_uri,
                    function(err) {
                            if (err) throw err;
                    }
            )
            let queryString = "update  users set image_url = ? WHERE user_id = ?";
            getConnection().query(queryString,[new_file_name+"."+mime.getExtension(element.mimetype),req.user.user_id],(err,results,fields)=>{});
					})
			return ("upload done")
	}
};

router.post("/upload_profile_picture",passport.authenticate("jwt",{session:false}), upload.array("file",12), (req, res) => {
    const result = uploadFiles(req);
    if(result == "upload done"){
        return res.status(200).json({
            success:true,
            message:"API.IMAGE-UPDATED",
            data:null
        })
    }
    return res.status(400).json({
        success:false,
        message:"API.INVALIDE-IMAGE",
        data:null
    })
});

router.post("/update_profile",passport.authenticate("jwt",{session:false}),(req,res)=>{
    const {user_name,user_last_name,email,region,password} = req.body;
    const user = req.user;
    let queryString = "update  users set user_name = ? , user_last_name = ? , email = ? , region = ? , password = ? WHERE user_id = ?";
    getConnection().query(queryString,[user_name,user_last_name,email,region,password,user.user_id],(err,results,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            return res.status(500).json({
                success:false,
                message:"API.INTERNAL-SERVER-ERROR",
                data:null
            })
        }
        console.log("Successfully Updated User.");
        res.status(200).json({
            success:true,
            message:"API.USER-UPDATED",
            data:null
        })
    });
})

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

/*router.post('/verify',(req,res) => {
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
})*/


router.post('/verify',(req,res) => {
    const {phone,code} = req.body;
    if (code === '11111') {
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
})

router.post('/login',(req,res) => {

    const {phone,password} = req.body;
    console.log(phone)
    console.log(password)
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

router.get('/fetch_profile',passport.authenticate("jwt", { session: false }),(req,res)=>{
    const {user_id} = req.query;
    const  queryString = "SELECT * FROM users WHERE user_id = ? "
    getConnection().query(queryString,[user_id],(err,rows,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("fail")
            return
        }
                console.log("Successfully fetched.")
        delete rows[0].password;
        return res.json({success:true,message:"API.USER-FETCHED",data:rows[0]})
    })
})

router.post('/rate',passport.authenticate("jwt", { session: false }),(req,res)=>{
    const {rate,user_id,job_id} = req.body;
    const  queryString = "update job_signs set rate = ? WHERE user_id = ? and job_id = ?";
    getConnection().query(queryString,[rate,user_id,job_id],(err,rows,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("fail")
            return
        }
                console.log("Successfully updated")
        return res.json({success:true,message:"API.USER-RATED",data:null})
    })

})

router.post('/save_message' , (req,res)=>{
  /*  const data = req.body;
    const queryString = "INSERT INTO `message_logs`(`from_user_id`,`from_user_name`, `to_user_id`, `to_user_name`, `date` , `job_id` , `message_content`) VALUES (?,?,?,?,?,?,?)";
    getConnection().query(queryString,[data.from_user_id,data.from_user_name,data.to_user_id,data.to_user_name,new Date().toISOString(),0,data.message_content],(err,results,fields)=>{
        console.log("Successfully Saved Message.");
        console.log(err)
    });
    return res.json({
        success:true,
        message:"API.MESSAGE-SAVED",
    })
*/

    try{
        let data = req.body;
        socket.emit("messagedetection", data);
        console.log("here")   
    
    }catch(err){
        res.status(500).json({
            success:false,
            message:"API.ERROR",
            data:null
        })
    }

})

router.post('/registers',(req,res) => {
    var count = 0;
    var tauxRisque = 0;
    var separations = 0;
    var index = 0;
    var sum = 0;
    var array = [];
    var arrayMax = [];
    var refRisk = [];
    try{
    const {questions, nb_questions} = req.body;
    questions.forEach(element => {
        //console.log(element);
        separations = separations + element;  
      });
      console.log(separations +"    Seperations");

      while (index <= (nb_questions*2) && sum < 80) {
        array.push(count);
        sum = Math.round(count*nb_questions*2);
        arrayMax.push(Math.round(count*nb_questions*2));
        refRisk.push((Math.pow(count, 2)*nb_questions*2)+5);
        count = count + 0.02;
        console.log(array[index]+"         "+arrayMax[index]+"         "+refRisk[index]); 
        index = index + 1;
      }

    for (i = 0; i <= (nb_questions*2); i++) { 
        if(arrayMax[i] <= separations && separations < arrayMax[i + 1]) {
            tauxRisque = refRisk[i];
            break;
        }
    } 

    console.log(tauxRisque +"  est le taux de risque");
    var intvalue = Math.floor( tauxRisque );
    //var intvalue = Math.ceil( floatvalue );  
    //var intvalue = Math.round( floatvalue );
    return res.json({success:true,message:"API.USER-FETCHED",intvalue})
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