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
    const sujet = req.body.sujet
    const description = req.body.description
    const id_account = req.body.id_account
    const TimePost = req.body.TimePost
    const queryString = "INSERT INTO publication(sujet, description, id_account, TimePost) VALUES (?,?,?,?)"
    getConnection().query(queryString,[sujet, description, id_account,TimePost],(err,results,fields)=>{
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

router.get('/all',(req,res)=>{
    const queryString = "SELECT * FROM publication p, accounts a  WHERE  p.id_account = a.ID"
    getConnection().query(queryString,(err,rows,fields)=>{
        if(err){
            res.sendStatus(500)
            return
        }
        res.json(rows)
        console.log("Successfullynnnnnn fetched.")

    })
})

router.delete('/delete/:id',(req,res)=>{
    const ID = req.params.ID
    const queryString = "DELETE FROM  publication WHERE ID = ?"
    getConnection().query(queryString,[ID],(err,rows,fields)=>{
        if(err){
            res.sendStatus(500)
            return
        }
        console.log("Successfully deleted.")
        res.end()
    }) 
 })
 
 /*router.put('/update/:id/:title/:category/:desc/:skills/:paymentmethod',(req,res)=>{
    const ID = req.params.ID
    const ProjectTitle = req.params.ProjectTitle
    const ProjectCategory = req.params.ProjectCategory
    const ProjectDesc = req.params.ProjectDesc
    const SkillsRequired = req.params.SkillsRequired
    const ProjectDuration = req.params.ProjectDuration
    const PaymentMethod = req.params.PaymentMethod
     const queryString = "UPDATE projects SET ProjectTitle=?,ProjectCategory=?,ProjectDesc=?,SkillsRequired=?,ProjectDuration=?,PaymentMethod=? WHERE ID=?"                 
     getConnection().query(queryString,[ProjectTitle,ProjectCategory,ProjectDesc,SkillsRequired,ProjectDuration,PaymentMethod,ID],(err,rows,fields)=>{
         if(err){
             console.log("[ERROR]",err)
             res.sendStatus(500)
             return
         }
         console.log("Successfully updated.")
         res.end()
 
     })
 })*/


module.exports = router;