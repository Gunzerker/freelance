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
    user: 'digit',
    password: 'root',
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
        const {job_id} = req.query;
        const queryString = "select * from message_logs where job_id = ?";
        getConnection().query(queryString,[job_id],(err,rows,fields)=>{
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

    const  queryString = "SELECT  * FROM jobs order by job_id";
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
    const  queryString = "SELECT  * FROM jobs where owner_user_id = ?";
    getConnection().query(queryString,[req.user.user_id],(err,rows,fields)=>{
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
    const  queryString = "SELECT  * , (select user_name from users where user_id = j.owner_user_id) as owner_name FROM job_signs js join jobs j on js.job_id = j.job_id where owner_user_id = ?";
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

router.post('/accept_application',passport.authenticate("jwt", { session: false }),async (req,res)=>{
    try{
    const {job_id,job_signs_id} = req.body;
    let queryString = "UPDATE `jobs` SET `taken`=1 WHERE `job_id`=?";
    let promise_array = [];
    promise_array.push ( getConnection().query(queryString,[job_id]));
    queryString = "UPDATE `job_signs` SET `accepted`=1 WHERE `job_signs_id`=?"
    promise_array.push ( getConnection().query(queryString,[job_signs_id]));
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


router.post('/new', (req, res) => {
    const AccountID = req.body.AccountID
    const ProjectID = req.body.ProjectID
    const queryString = "INSERT INTO `applications`(`AccountID`, `ProjectID`, `Status`) VALUES (?,?,1)"
    getConnection().query(queryString,[AccountID, ProjectID],(err,results,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("Erreur")
            return
        }
        console.log("Successfully applied");
        res.end()

    });
});


router.delete('/delete/:ID', (req, res) => {
    const ProjectID = req.params.ID
    const queryString = "DELETE FROM applications WHERE ApplicationID=?"
    getConnection().query(queryString,[ProjectID],(err,results,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("Erreur")
            return
        }
        console.log("Successfully withdrawed application");
        res.end()

    });
   
});




router.get('/accept/:ApplicationID', (req, res) => {
    const ApplicationID = req.params.ApplicationID
    const queryString = "UPDATE `applications` SET `status`=2 WHERE `ApplicationID`=?"
    getConnection().query(queryString,[ApplicationID],(err,results,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("Erreur")
            return
        }
        console.log("Successfully accepted application");
        res.end()

    });
   
});


router.get('/reject/:ApplicationID', (req, res) => {
    const ApplicationID = req.params.ApplicationID
    const queryString = "UPDATE `applications` SET `status`=0 WHERE `ApplicationID`=?"
    getConnection().query(queryString,[ApplicationID],(err,results,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("Erreur")
            return
        }
        console.log("Successfully rejected application");
        res.end()

    });
   
});


router.get('/checkIfExists/:accountID/:projectID',(req,res)=>{
    const ID = req.params.accountID
    const PID = req.params.projectID
    const  queryString = "SELECT  * FROM Applications Where AccountID=? AND ProjectID=?"
    getConnection().query(queryString,[ID,PID],(err,rows,fields)=>{
        if(err){
           console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("fail")    
            return
        }
        if(rows[0]!= null)
        {
            res.json({"Status": true, "AccountID": 2})
            console.log(rows[0].status)
        }
        else
        {
            res.json({"Status": false, "AccountID":0})
        }
        //res.json(rows)
                
    })    
})


router.get('/search/:accountID',(req,res)=>{
    const ID = req.params.accountID
    const  queryString = "SELECT  * FROM accounts b,applications a, projects p WHERE b.ID = a.accountid and p.projectid=a.projectid and a.accountid =? "
    getConnection().query(queryString,[ID],(err,rows,fields)=>{
        if(err){
           console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("fail")    
            return
        }
        res.json(rows)
                
    })    
})






router.get('/getcount/:projectID',(req,res)=>{
    const ID = req.params.projectID
    const  queryString = "SELECT  COUNT(*) FROM applications where projectid=? "
    getConnection().query(queryString,[ID],(err,rows,fields)=>{
        if(err){
           console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("fail")    
            return
        }
        res.send(rows[0])
        console.log(rows[0])
                
    })    
})



router.get('/getapplicants/:projectID',(req,res)=>{
    const ID = req.params.projectID
    const  queryString = "SELECT  * FROM applications a, accounts ac where a.accountID = ac.ID and a.status=1 and a.projectid=? "
    getConnection().query(queryString,[ID],(err,rows,fields)=>{
        if(err){
           console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("fail")    
            return
        }
        res.json(rows)
        console.log("kharajet les applicants")       
    })    
})


module.exports = router;