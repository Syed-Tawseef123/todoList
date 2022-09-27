const express = require("express");

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const _ = require("lodash");

mongoose.connect("mongodb+srv://Syed_Tawseef:Syedstk143@cluster0.ufvlx5k.mongodb.net/todoList");

// const date = require(__dirname+"/date.js");

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static("public"));

const itemSchema = mongoose.Schema({
  name : String
});

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item ({
  name : "Welcome !!!"
});

const item2 = new Item({
  name : "Enter any new item !"
});

const item3 = new Item({
  name : "U can delete any item also"
});


const customSchema = mongoose.Schema({
  name : String,
  item : [itemSchema]
});

const Custom = mongoose.model("Custom",customSchema);




app.get("/",function(req,res){
// let CurrentDate = date.getDay();
Item.find(function(err,items){
  if(items.length === 0){
    Item.insertMany([item1,item2,item3],function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Default items added Successfully");
      }
    });
    res.redirect("/");
  }
  else{
    res.render("list",{listTitle :"Today",item :items} );
  }
});
});

app.get("/:customName",function(req,res){
const customListName =   req.params.customName;
const capitalizedCustomListName = _.capitalize(customListName);
Custom.findOne({name : capitalizedCustomListName},function(err,customs){
if(!err){
  if(!customs){
    const custom = new Custom({
      name : capitalizedCustomListName,
      item : [item1,item2,item3]
    });
    custom.save();
    res.redirect("/"+capitalizedCustomListName);
  }
  else{
    res.render("list",{listTitle :capitalizedCustomListName,item :customs.item})
  }
}
else{
  console.log(err);
}
});
});
app.post("/",function(req,res){
const listName = req.body.list;
const currentNewItem =  new Item({
      name : req.body.newItem
    });
    if(listName === "Today"){
    currentNewItem.save();
    res.redirect("/");
  }
  else{
    Custom.findOne({name:listName},function(err,foundDoc){
      if(err){
        console.log(err);
      }
      else{
        foundDoc.item.push(currentNewItem);
        foundDoc.save();
       res.redirect("/"+listName);
      }
    });
  }

});

app.post("/delete",function(req,res){
const checkedItem = req.body.checkbox;
const listName = req.body.list;
if(listName === "Today"){
  Item.deleteOne({_id : checkedItem},function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("Item deleted");
      res.redirect("/");
    }
  });
}
else{
  Custom.findOneAndUpdate({name : listName},{$pull:{item:{_id :checkedItem }}},function(err,foundList){
    if(err){
      console.log(err);
    }
    else{
      // console.log(foundList);
      res.redirect("/"+listName);
    }
  });
}

//we can also remove items like this :

// Item.findByIdAndRemove(checkedItem, function(err){
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log("Item Removed Successfully !");
//   }
//   res.redirect("/");
// });
});


app.get("/about",function(req,res){
  res.render("about");
});
app.listen(4000 || process.env.PORT,function(req,res){
  console.log("Server Up at port 4000");
});
