const express = require('express');
const router = express.Router();
const mysql = require('mysql');
router.use(express.static('./public'))
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: false}))

const pool = mysql.createPool({
    connectionLimit: 10 ,
    host: '127.0.0.1',
    user: 'justask',
    password: 'justask',
    database: 'justask'
})
function getConnection(){
    return pool
}

router.post('/new', (req, res) => {
    const FromID = req.body.FromID
    const ToID= req.body.ToID
    const Body = req.body.Body
    const Time = req.body.Time

    const queryString = "INSERT INTO `messages`(`FromID`, `ToID`, `Body`, `Time`) VALUES(?,?,?,?)"
    getConnection().query(queryString,[FromID,ToID,Body,Time],(err,results,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("Erreur")
            return
        }
        console.log("Successfully Added Message.");
        res.end()

    });
   
});


router.get('/getmessages/:FromID/:ToID',(req,res)=>{
    const FromID = req.params.FromID
    const ToID= req.params.ToID
    const queryString = "SELECT * FROM `messages` WHERE FromID =? AND ToID=? OR FromID =? AND ToID=? "
    getConnection().query(queryString,[FromID,ToID,ToID,FromID],(err,rows,fields)=>{
      
        if(err){
            res.sendStatus(50)
            return
        }
        console.log("Successfully fetched messages")
        res.json(rows)
    })
})



router.get('/talkingto/:ID',(req,res)=>{
    const ID = req.params.ID
    const queryString = "SELECT DISTINCT a.ID, a.Firstname, a.Lastname, a.CompanyName, a.ProfilPicture FROM accounts a, messages m WHERE ((a.ID = m.ToID AND m.FromID=?) OR (a.ID = m.FromID AND m.ToID=?))"
    getConnection().query(queryString,[ID,ID],(err,rows,fields)=>{
      
        if(err){
            res.sendStatus(500)
            return
        }
        console.log("Successfully fetched users you're talking to!")
        res.json(rows)
    })
})




module.exports = router;