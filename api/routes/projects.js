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
    const ProjectTitle = req.body.ProjectTitle
    const ProjectCategory = req.body.ProjectCategory
    const ProjectDesc = req.body.ProjectDesc
    const SkillsRequired = req.body.SkillsRequired
    const ProjectDuration = req.body.ProjectDuration
    const PaymentMethod = req.body.PaymentMethod
    const ProjectLevel = req.body.ProjectLevel
    const ProjectBudget = req.body.ProjectBudget
    const AccountID = req.body.AccountID
    const TimeCreation = req.body.TimeCreation
    const queryString = "INSERT INTO projects(ProjectTitle, ProjectCategory, ProjectDesc, SkillsRequired, ProjectDuration, PaymentMethod, ProjectLevel, ProjectBudget, AccountID,TimeCreation) VALUES (?,?,?,?,?,?,?,?,?,?)"
    getConnection().query(queryString,[ProjectTitle,ProjectCategory,ProjectDesc,SkillsRequired,ProjectDuration,PaymentMethod,ProjectLevel,ProjectBudget,AccountID,TimeCreation],(err,results,fields)=>{
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

router.get('/project/:id',(req,res)=>{
    const ID = req.params.id
    const  queryString = "SELECT * FROM projects WHERE ProjectID = ?"
    getConnection().query(queryString,[ID],(err,rows,fields)=>{
        if(err){
           console.log("[ERROR]"+err)
            res.sendStatus(500)
            return
        }
        console.log("Successfully fetched.");
        res.json(rows)
    })    
})



router.get('/myprojects/:id',(req,res)=>{
    const ID = req.params.id
    const  queryString = "SELECT * FROM projects WHERE AccountID = ?"
    getConnection().query(queryString,[ID],(err,rows,fields)=>{
        if(err){
           console.log("[ERROR]"+err)
            res.sendStatus(500)
            return
        }
        console.log("Successfully fetched.");
        res.json(rows)
    })    
})

router.get('/all',(req,res)=>{
    const queryString = "SELECT * FROM projects p, accounts a where p.AccountID = a.ID"
    getConnection().query(queryString,(err,rows,fields)=>{
        if(err){
            res.sendStatus(50)
            return
        }
        console.log("Successfully fetched All Projects.")
        res.json(rows)
    })
})


router.get('/select/:ID',(req,res)=>{
    const ID = req.params.ID
    const queryString = "SELECT * FROM projects where AccountID = ?"
    getConnection().query(queryString,[ID],(err,rows,fields)=>{
        if(err){
            res.sendStatus(500)
            return
        }
        console.log("Successfully fetched by id .")
        res.json(rows)
    })
})

router.get('/selectt/:SkillsRequired',(req,res)=>{
    const SkillsRequired = req.params.SkillsRequired
    const queryString = "SELECT * FROM projects where SkillsRequired LIKE " +  getConnection().escape('%'+req.params.SkillsRequired+'%')
    getConnection().query(queryString,[SkillsRequired],(err,rows,fields)=>{
        if(err){
            res.sendStatus(500)
            return
        }
        console.log("Successfully SkillsRequired.")
        res.json(rows)
    })
})


router.delete('/delete/:id',(req,res)=>{
    const ID = req.params.ID
    const queryString = "DELETE FROM  projects WHERE ID = ?"
    getConnection().query(queryString,[ID],(err,rows,fields)=>{
        if(err){
            res.sendStatus(500)
            return
        }
        console.log("Successfully deleted.")
        res.end()
    }) 
 })
 
 router.put('/update/:id/:title/:category/:desc/:skills/:paymentmethod',(req,res)=>{
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
 })


module.exports = router;