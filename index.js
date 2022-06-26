const express = require('express');
const fs = require("fs");//for testing purposes
const ai = require("./ai.js");
const game = require("./game.js");
const bp = require("body-parser");
const _ = require("lodash")

//get weights
var data = fs.readFileSync(__dirname+"/log.txt")
var botNetwork = JSON.parse(data);


const app = express();
app.use(bp.json({extended: true}))
app.use(bp.urlencoded({extended: true }))
app.use(express.static(__dirname + "/public"));

var games = [];

var bot = new ai.Bot("test",botNetwork);

//connect to frontend
app.get('/getboard', (req, res) => {
  console.log("request recieved")
  games.push(_.cloneDeep(new game.Game(id)));
  res.send(games[games.length-1].board);
});
app.post('/postgame', (req, res) => {
  console.log("request recieved")
  games.push(_.cloneDeep(new game.Game(req.body.id)));
  res.send(games[games.length-1].board);
});
app.post("/postmove", (req, res) => {
  console.log("Player moved");
  var data = req.body;
  var game = getGame(data.id);
  game.move(0,data.col);//user controls p0
  game.move(1,bot.respond(game.showPlayer(1),game.showPlayer(0)));
  //console.log(game1.totalMoves);
  res.send({board:game.board, winner:game.winner});
});


app.listen(3000, () => {
  console.log('server started');
});


function getGame(id) {
  for (var i = 0; i < games.length; i++) {
    var g = games[i];
    if (g.id == id) return g;
  }

  
}