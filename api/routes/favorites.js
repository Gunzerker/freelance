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
    const ID = req.body.AccountID
    const PID = req.body.ProjectID
    const queryString = "INSERT INTO `favorite`(`AccountID`, `ProjectID`) VALUES (?,?)"
    getConnection().query(queryString,[ID, PID],(err,results,fields)=>{
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


router.delete('/delete/:ID/:PID', (req, res) => {
    const ID = req.params.ID
    const ProjectID = req.params.PID
    const queryString = "DELETE FROM favorite WHERE AccountID=? and ProjectID=?"
    getConnection().query(queryString,[ID,ProjectID],(err,results,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("Erreur")
            return
        }
        console.log("Successfully removed from fav");
        res.end()

    });
   
});



router.get('/checkIfExists/:accountID/:projectID',(req,res)=>{
    const ID = req.params.accountID
    const PID = req.params.projectID
    const  queryString = "SELECT  * FROM Favorite Where AccountID=? AND ProjectID=?"
    getConnection().query(queryString,[ID,PID],(err,rows,fields)=>{
        if(err){
           console.log("[ERROR]"+err)
            res.sendStatus(500)
            res.send("fail")    
            return
        }
        if(rows[0]!= null)
        {
            res.json({"Status": true})
        }
        else
        {
            res.json({"Status": false})
        }
        //res.json(rows)
                
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


module.exports = router;