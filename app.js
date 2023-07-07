const { name } = require("ejs");
const express=require("express");
const app=express();
const date=require(__dirname+"/date.js");
const mongoose=require("mongoose");
const _=require("lodash");


app.use(express.urlencoded({extended: true}));
app.use(express.static("public")); 
mongoose.connect('mongodb+srv://admin_nikita:Nikita123@cluster0.19jeqwe.mongodb.net/todolistDB');
const taskSchema =new mongoose.Schema({
    name:String
});
const listSchema =new mongoose.Schema({
    name:String,
    items:[taskSchema]
});
const Task=mongoose.model("Task",taskSchema);
const List=mongoose.model("List",listSchema);
const task1=new Task({
    name:"Welcome to your todo lost!"
});
const task2=new Task({
    name:"Hit + button to save"
});
const task3=new Task({
    name:"<-- press this to delete a task"
});
const defaultItems=[task1,task2,task3];
// Task.insertMany(defaultItems).then(()=>{
//     console.log("successfully saved default items");
// }).catch((err)=>{
//     console.log(err);
// });


app.set('view engine','ejs');
let day =date();
app.get("/",function(req,res){
    
    
    Task.find({}).then(function(t){
        if(t.length===0){
            Task.insertMany(defaultItems).then(()=>{
                    console.log("successfully saved default items");
                }).catch((err)=>{
                    console.log(err);
                });
                res.redirect("/");
        }else{
            
            res.render("lists",{listTitle:day,addItem:t});
        }
        console.log(t);
        
    }).catch((err)=>{
        console.log(err);
    });
    
    
});
app.post("/",function(req,res){
    
    let item=req.body.newItem;
    const list=req.body.list;
    const newItem=new Task({
        name:item
    });
    if(list===day){
        newItem.save();
        res.redirect("/");
    }else{
        List.findOne({name:list}).then((foundList)=>{
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/"+list);
        }).catch((err)=>{
            console.log(err);
        })
    }
    
   
})
app.post("/delete",function(req,res){
    const checkedItemID=req.body.checkbox;
    const listName=req.body.listName;
    if(listName===day){
        Task.deleteOne({_id:checkedItemID}).then(()=>{
            console.log("deleted");
        }).catch((err)=>{
            console.log(err);
        });
        res.redirect("/");
    }else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemID}}}).then(()=>{}).catch((err)=>{
            console.log(err);
            
        });
        res.redirect("/"+listName);
        
    }
    
});
app.get("/:customListName",function(req,res){
    const customList =_.capitalize(req.params.customListName);
    List.findOne({name : customList}).then((found)=>{
        if(!found){
            
            const list =new List({
                name:customList,
                items:defaultItems
            });
            list.save();
            res.redirect("/"+customList);
        }else{
            res.render("lists",{listTitle:found.name,addItem:found.items});
            console.log(found.name);
        }   
    
    }).catch((err)=>{
        console.log(err);
    });
    
    
});

app.get("/about",function(req,res){
    res.render("about");
})
app.listen(3000,function(){
    console.log("server running on port 3000");
});