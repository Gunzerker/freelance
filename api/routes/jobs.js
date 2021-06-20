const express = require('express');
const router = express.Router();
const mysql = require('mysql');
router.use(express.static('./public'))
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: false}))
const passport = require("passport")
const config = require("../../config/config.json")
const axios = require('axios')
require("../../middleware/passport")(passport);


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
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());

router.get('/fetch_job_messages',passport.authenticate("jwt", { session: false }),async (req,res)=>{
    try{
        const {to_user_id,from_user_id} = req.query;
        const queryString = "select * from message_logs where (from_user_id = ? and to_user_id = ?) or (from_user_id = ? and to_user_id = ?)";
        getConnection().query(queryString,[to_user_id,from_user_id,from_user_id,to_user_id],(err,rows,fields)=>{
            if(err){
                console.log("[ERROR]"+err)
                res.sendStatus(500)
                res.send("fail")
                return
            }
            return res.status(200).json({
                success:true,
                message:"API.MESSAGES-FETCHED",
                data:rows
            })
        })

    }catch(err){
        res.status(500).json({
            success:false,
            message:"API.INTERNAL-SERVER-ERROR",
            data:null
        })
    }
})

router.post('/create_job',passport.authenticate("jwt", { session: false }),async (req,res)=>{
    try{
    const user = req.user;
    const {job_name,job_description,location_lat,location_lng} = req.body;
    const reverse_geocode = await axios.get(`https://api.openrouteservice.org/geocode/reverse?api_key=${config.openrouteservice_key}&point.lon=${location_lng}&point.lat=${location_lat}`);
    const queryString = "INSERT INTO `jobs`(`job_name`, `job_description`, `owner_user_id`,`location_lat`,`location_lng`,`date_creation`,`adress`) VALUES (?,?,?,?,?,?,?)";
    //return res.send(reverse_geocode.data.features[0].properties)
    getConnection().query(queryString,[job_name,job_description,user.user_id,location_lat,location_lng,new Date().toISOString(),reverse_geocode.data.features[0].properties.label],(err,results,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("Erreur")
            return
        }
        console.log("Successfully applied");
        return res.status(200).json({
            success:true,
            message:"API.JOB-CREATED",
            data:null
        })

    });
}catch(err){
    console.log(err)
    return res.status(500).json({
        success:false,
        message:"API.INTERNAL-SERVER-ERROR",
        data:null
    })
}
})

router.get('/fetch_jobs',passport.authenticate("jwt", { session: false }),(req,res)=>{

    const  queryString = "SELECT  j.* , u.user_name,u.user_last_name,u.image_url FROM jobs j join users u on j.owner_user_id = u.user_id order by job_id";
    getConnection().query(queryString,[],(err,rows,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("fail")
            return
        }
        return res.status(200).json({
            success:true,
            message:"API.JOB-FETCHED",
            data:rows
        })
    })

})

router.post('/apply_job',passport.authenticate("jwt", { session: false }),(req,res)=>{
    try{
    const user = req.user;
    const {job_id} = req.body;
    const queryString = "INSERT INTO `job_signs`(`job_id`, `user_id` , `date_of_sign`) VALUES (?,?,?)";
    getConnection().query(queryString,[job_id,user.user_id,new Date().toISOString()],(err,results,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("Erreur")
            return
        }
        console.log("Successfully applied");
        return res.status(200).json({
            success:true,
            message:"API.JOB-APPLIED",
            data:null
        });

    });
}catch(err){
    res.status(500).json({
        success:false,
        message:"API.INTERNAL-SERVER-ERROR",
        data:null
    })
}

})

router.get('/fetch_my_jobs',passport.authenticate("jwt", { session: false }),(req,res)=>{
    const  queryString = "SELECT  j.* , (select count (*) from job_signs js where js.job_id = j.job_id) as application_count FROM jobs j where owner_user_id = ?";    getConnection().query(queryString,[req.user.user_id],(err,rows,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("fail")
            return
        }
        return res.status(200).json({
            success:true,
            message:"API.JOB-FETCHED",
            data:rows
        })
    })
})

router.get('/fetch_my_applications',passport.authenticate("jwt", { session: false }),(req,res)=>{
    const  queryString = "SELECT  * , (select user_name from users where user_id = j.owner_user_id) as owner_name , (select user_last_name from users where user_id = j.owner_user_id) as owner_last_name FROM job_signs js join jobs j on js.job_id = j.job_id where user_id = ?";
    getConnection().query(queryString,[req.user.user_id],(err,rows,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("fail")
            return
        }
        return res.status(200).json({
            success:true,
            message:"API.JOB-APPLICATION-FETCHED",
            data:rows
        })
    })
})

router.post('/check_application',passport.authenticate("jwt", { session: false }),async (req,res)=>{
    const {job_id,user_id} = req.body;
    const  queryString = "SELECT * FROM job_signs WHERE job_id = ? and user_id = ? "
    getConnection().query(queryString,[job_id, user_id],(err,rows,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("fail")
            return
        }
                console.log("Successfully fetched.")
        return res.json({success:true,message:"API.USER-FETCHED",data:rows})
    })
})

router.post('/accept_application',passport.authenticate("jwt", { session: false }),async (req,res)=>{
    try{
    const {job_id,job_signs_id,status} = req.body;
    let queryString = "UPDATE `jobs` SET `taken`=1 WHERE `job_id`=?";
    let promise_array = [];
    promise_array.push ( getConnection().query(queryString,[job_id]));
    queryString = "UPDATE `job_signs` SET `accepted`=? WHERE `job_signs_id`=?"
    promise_array.push ( getConnection().query(queryString,[status,job_signs_id]));
    await Promise.all(promise_array);
    return res.status(200).json({
        success:true,
        message:'API.APPLICATION-UPDATED',
        data:null
    })
}catch(err){
    res.status(500).json({
        success:true,
        message:'API.INTERNAL-SERVER-ERROR',
        data:null
    })
}
})

router.post('/fetch_job_application',passport.authenticate("jwt", { session: false }),async (req,res)=>{
    try{
    const {job_id} = req.body;
    const  queryString = "SELECT  js.* ,u.user_name,u.user_last_name,u.image_url,(select AVG (rate) from job_signs where user_id = u.user_id ) as rating FROM job_signs js join users u on js.user_id = u.user_id where job_id = ?";
    getConnection().query(queryString,[job_id],(err,rows,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("fail")
            return
        }
        return res.status(200).json({
            success:true,
            message:"API.JOB-APPLICATION-FETCHED",
            data:rows
        })
    })
}catch(err){
    res.status(500).json({
        success:true,
        message:'API.INTERNAL-SERVER-ERROR',
        data:null
    })
}
})

router.get('/fetch_my_message',passport.authenticate("jwt", { session: false }),async (req,res)=>{
    try{
        const  queryString = "SELECT distinct(ml.to_user_id), ml.from_user_id ,ml.to_user_name,ml.from_user_name,u.image_url as to_user_image, (select image_url from users where user_id = from_user_id) as from_user_image  FROM message_logs ml join users u on (ml.to_user_id = u.user_id) where (from_user_id = ? OR to_user_id = ?)";
    //const queryString = "select distinct  from message_logs where from_user_id = ?"
    //const  queryString = "SELECT  ml.* ,u.image_url as to_user_image, (select image_url from users where user_id = from_user_id) as from_user_image  FROM message_logs ml join users u on (ml.to_user_id = u.user_id) where (from_user_id = ? OR to_user_id = ?)";
    getConnection().query(queryString,[req.user.user_id,req.user.user_id],(err,rows,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("fail")
            return
        }
        return res.status(200).json({
            success:true,
            message:"API.MESSAGE-LOGS-FETCHED",
            data:rows
        })
    })
}catch(err){
    res.status(500).json({
        success:true,
        message:'API.INTERNAL-SERVER-ERROR',
        data:null
    })
}
})

module.exports = router;