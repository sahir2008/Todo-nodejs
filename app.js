const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sahir:v3UbsddsuHudTXdk@cluster0.nsuaq.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to your todolist!"
});
const item2 = new Item ({
  name: "Hit the + button to add a new item."
});
const item3 = new Item ({
  name: "<-- Hit this box to delete an item."
});

const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({},function(err, foundItem){
    if(foundItem.length === 0){
      Item.insertMany(defaultItems, function(err){});
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Todo Application", newListItems: foundItem});
    }
  });  
});

app.get("/:customListName", function(req, res){
  const customListName = _.startCase(req.params.customListName);
  List.findOne({name:customListName},function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List ({
        name: customListName,
        items: defaultItems
    });
        list.save();
        res.redirect("/"+ customListName);
    }else{
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
    }
  }   
  });
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item ({
    name: itemName
  });
  if(listName === "Todo Application"){
  newItem.save();
  res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err,foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.check;
  const listName = req.body.listName;
  if(listName === "Todo Application"){
  Item.deleteOne({_id:checkedItemId},function(err){});
  res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, function(err,foundList){
    });
    mongoose.set('useFindAndModify', false);
    res.redirect("/"+listName);
  }
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});