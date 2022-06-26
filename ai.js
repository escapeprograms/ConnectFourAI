//neural network bot
var math = require('mathjs');
var game = require("./game.js");
var c = require("./convolution.js")
var _ = require("lodash");

var layerSize = [0,42,7];//layers for neurons
var mutRate = 0.06;//mutation chance
var mutAmount = 0.1;//mutation amount

//old kernels
/*var filterlist = [
  [[1,1]],
  [[1],[1]],
  [[0,1],[1,0]],
  [[1,0],[0,1]]
];*/
var filterlist = [
    [[1]],
    [[1,1,1,1]],//horizontal
    [[1],[1],[1],[1]],//vertical
    [[0,0,0,1],//diag
    [0,0,1,0],
    [0,1,0,0],
    [1,0,0,0]],
    [[1,0,0,0],//diag
    [0,1,0,0],
    [0,0,1,0],
    [0,0,0,1]],
  ];
//calculate input layer size
var testgame = new game.Game();
var testBoard = c.convolve(testgame.showPlayer(0),filterlist);
console.log(2*math.flatten(testBoard).length);
layerSize[0] = 2*math.flatten(testBoard).length

//fitness calculation
var calcFit = function(movesToWin,winner){
  var winnerScore = 0;
  var timeBonus = 0;
  if (movesToWin > 10) timeBonus = 50 - movesToWin;
  if (winner==0) winnerScore = 100;
  return winnerScore + timeBonus;
}

//create zeros matrix with size x,y
function zerosM(x,y) {
  if (!y) y = 1;
  var arr = [];
  for (var i = 0; i < x; i++){
    var row = [];
    for (var j = 0; j < y; j++){
      //row.push(Math.random()/4);
      row.push(0)
    }
    if (x == 1) return row;//return a single row if x = 1
    arr.push(row)
  }
  return arr;
}

var Bot = function(id, network) {
  this.id = id;
  //default weight setup
  this.weights = [];
  this.bias = [];
  var w, b;
  if (network) {
    w = network.weights;
    b = network.bias;
  }
  for (var i = 0; i < layerSize.length-1; i++){
    //weights
    if (!w){
      this.weights.push(zerosM(layerSize[i], layerSize[i+1]));
    }
    else {
      this.weights.push(w[i]);//transfer weights
    }
    //biases (shifted 1 layer)
    if (!b){
      this.bias.push(zerosM(1, layerSize[i+1]));
    }
    else {
      this.bias.push(b[i]);//transfer bias
    }
  }
  //transfered weights
  //if (weights) this.weights = [weights][0];
};

//mutate weights
Bot.prototype.mutateWeights = function() {
  for (var a = 0; a < this.weights.length; a++){//layer
  for (var b = 0; b < this.weights[a].length; b++){//node
  for (var c = 0; c < this.weights[a][b].length; c++){//weight
    if (Math.random() < mutRate) {
      this.weights[a][b][c] += -(Math.random()*mutAmount) + mutAmount/2;
      //mutate weight
      if (Math.random() < mutRate*2) {
        this.weights[a][b][c] = 0;//clear weight chance
      }
    }
  }
  }
  }
}
Bot.prototype.mutateBiases = function() {
  for (var a = 0; a < this.bias.length; a++){//layer
  for (var b = 0; b < this.bias[a].length; b++){//bias
    if (Math.random() < mutRate) {
      this.bias[a][b] += -(Math.random()*mutAmount) + mutAmount/2;
      //mutate weight
      if (Math.random() < mutRate*2) {
        this.bias[a][b] = 0;//clear bias chance
      }
    }
  }
  }
}

//activate sigmoid function
Bot.prototype.sigmoid = function(Z) {
  var A = [];
  for (var i = 0; i < Z.length; i++) {
    A.push(1/(1 + Math.pow(Math.E,-Z[i])));
  }
  return A;
}
//recursive forward propagation
Bot.prototype.forward = function(input,n) {
  if (!n) n = 0;
  if (n >= this.weights.length) return input
    //return this.sigmoid(input);
  var X = math.matrix(input);
  var W = math.matrix(this.weights[n]);
  var Z = math.add(math.multiply(X,W),this.bias[n]).valueOf();
  //relu
  /*for (var i = 0; i < Z.length; i++) {
    if (Z[i] < 0) Z[i] = 0;
  }*/
  return this.forward(Z,n+1);
}

//calculate the bot's move
Bot.prototype.respond = function(board,board2) {
  //convolutions
  var convBoard = c.convolveExp(board,filterlist);
  var convBoard2 = c.convolveExp(board2,filterlist);
  
  //console.log(math.flatten(convBoard).length);
  var f = this.forward(math.flatten(
    convBoard.concat(convBoard2)));
  //find legal moves
  var legalMoves = [];
  for (var i = 0; i < f.length; i++) {
    //check legality of move
    if (board[0][i] != 0 || board2[0][i] != 0) {
      continue;
    }
    legalMoves.push(i);
  }

  //find best decision
  var maxResponse = 0;
  var decision = legalMoves[0];//assumes at least 1 move is legal
  for (var i = 0; i < f.length; i++) {
    if (f[i] >= maxResponse) {
      //check legality of move
      //console.log(i+": "+board[0][i]);
      //console.log(i+": "+board2[0][i]);
      if (legalMoves.indexOf(i) == -1) {
        //console.log("bad move caught")
        continue;
      } 
      decision = i;
      maxResponse = f[i];
    }
  }
  return decision;
}

//Simulate a game of 2 bots
var maxMoves = 42;
var Simulation = function(network1,network2){
  this.fit = 0;//fitness score
  //bots must control players "1" and "2"
  this.results = [];//returns with winner's weights and score
  this.winner = -1;  
  this.bots = [new Bot("mutated",network1), new Bot("control",network2)];
  this.game = new game.Game();
}
//mutate first bots
Simulation.prototype.mutate = function() {
  this.bots[0].mutateWeights();
  this.bots[0].mutateBiases();
}

Simulation.prototype.runMoves = function() {
  //console.log("Sim started")
  while (!this.game.gameOver && this.game.totalMoves < maxMoves) {
    this.bots.forEach((b,i)=>{
      this.game.move(i,b.respond(this.game.showPlayer(i),this.game.showPlayer(1-i)))
    });
  }
  this.endSim();
  //console.log("sim finished")
}

//end sim
Simulation.prototype.endSim = function() {
  console.log("done sim")
  this.game.gameOver = true;//force end game
  var fit = calcFit(this.game.totalMoves, this.game.winner);
  this.results = {weights:this.bots[0].weights,bias:this.bots[0].bias,fit:fit};
  console.log("Complete: "+fit)
}

module.exports = {Bot, Simulation};