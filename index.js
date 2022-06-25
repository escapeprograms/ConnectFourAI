const express = require('express');
const fs = require("fs");//for testing purposes
const ai = require("./ai.js");
const game = require("./game.js");
const bp = require("body-parser");


//get weights
var data = fs.readFileSync(__dirname+"/log.txt")
var botNetwork = JSON.parse(data);


const app = express();
app.use(bp.json({extended: true}))
app.use(bp.urlencoded({extended: true }))
app.use(express.static(__dirname + "/public"));

var game1 = new game.Game();

var bot = new ai.Bot("test",botNetwork);
bot.respond(game1.board)

//connect to frontend
app.get('/getboard', (req, res) => {
  console.log("request recieved")
  res.send(game1.board)
  

});
app.post("/postmove", (req, res) => {
  console.log("Connected to Frontend");
  var move = req.body;
  game1.move(0,move.col);//user controls p0
  game1.move(1,bot.respond(game1.showPlayer(1)));
  console.log(game1.totalMoves)
  res.send(game1.board);
});


app.listen(3000, () => {
  console.log('server started');
});
