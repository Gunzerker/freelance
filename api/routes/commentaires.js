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
    
    const description = req.body.description
    const id_pub = req.body.id_pub
    const id_account = req.body.id_account
    const TimePost = req.body.TimePost
    const queryString = "INSERT INTO commentaire(description,id_pub,id_account,TimePost) VALUES (?,?,?,?)"
    getConnection().query(queryString,[description,id_pub,id_account,TimePost],(err,results,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            return
        }
        console.log("Successfully added."+results.insertId);
        res.json({"ID":results.insertId})
        res.end()

    });
   
});


router.get('/getcomms/:id', (req, res) => {
    
    const id = req.params.id
    const queryString = "Select * FROM accounts a, commentaire c  Where a.ID=c.id_account AND c.id_pub=? ORDER BY c.likes DESC"
    getConnection().query(queryString,[id],(err,rows,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            return
        }
        res.json(rows)
        res.end()

    });
   
});

router.get('/countcomms/:id', (req, res) => {
    
    const id = req.params.id
    const queryString = "Select count(*) FROM  commentaire   Where id_pub=? "
    getConnection().query(queryString,[id],(err,rows,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            return
        }
       res.send(rows[0])
        console.log(rows[0])

    });
   
});

/*router.get('/project/:id',(req,res)=>{
    const ID = req.params.id
    const  queryString = "SELECT * FROM projects WHERE ID = ?"
    getConnection().query(queryString,[ID],(err,rows,fields)=>{
        if(err){
           console.log("[ERROR]"+err)
            res.sendStatus(500)
            return
        }
        console.log("Successfully fetched.");
        res.json(rows)
    })    
})*/
router.get('/upvote/:ID', (req, res) => {

     const ID = req.params.ID
    const queryString = "UPDATE `commentaire` SET `likes`= likes+1 WHERE `id`=?"
    getConnection().query(queryString,[ID],(err,rows,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            return
        }
        console.log("c bon ya jon");
        res.end()

    });


})

router.get('/downvote/:ID', (req, res) => {

     const ID = req.params.ID
    const queryString = "UPDATE `commentaire` SET `likes`= likes-1 WHERE `id`=?"
    getConnection().query(queryString,[ID],(err,rows,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            return
        }
        console.log("c bon ya jon");
        res.end()

    });


})



router.get('/like/:id/:ida', (req, res) => {

     const id = req.params.id
     const ida = req.params.ida
    const queryString = "UPDATE accounts a, commentaire c SET c.likes = c.likes+1, a.reputation = a.reputation+1 WHERE c.id =? AND a.ID = ?"
    getConnection().query(queryString,[id,ida],(err,rows,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            return
        }
        console.log("c bon ya jon hamdoulah ");
        res.end()

    });


})

router.get('/dislike/:id/:ida', (req, res) => {

     const id = req.params.id
     const ida = req.params.ida
    const queryString = "UPDATE accounts a, commentaire c SET c.likes = c.likes-1, a.reputation = a.reputation-1 WHERE c.id =? AND a.ID = ?"
    getConnection().query(queryString,[id,ida],(err,rows,fields)=>{
        if(err){
            console.log("[ERROR]"+err)
            res.sendStatus(500)
            return
        }
        console.log("c bon ya jon hamdoulah ");
        res.end()

    });


})





module.exports = router;