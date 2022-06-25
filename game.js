const c = require("./convolution.js");

var boardWidth = 7;
var boardHeight = 6;

function Game() {
  this.board = [];
  this.turn = 0;
  this.gameOver = false;
  this.winner = -1;
  this.totalMoves = 0;
  //create board
  //NOTE: array is in [row][col] format
  for (var i = 0; i < boardWidth; i++) {
    var col = [];
    for (var j = 0; j < boardHeight; j++) {
      col.push(-1)
    }
    this.board.push(col)
  }
  //board states: -1 = empty, 0 = player 1, 1 = player 2
}

Game.prototype.move = function(player, col) {
  if (player != this.turn) return;
  if (this.gameOver) return;
  var column = this.board[col];
  for (var i = 0; i < column.length; i++) {
    //place chip in the first empty space
    if (column[i] != -1) {
      if (i == 0) return; //stop if invalid move
      column[i-1] = player;
      break;
    }
    if (i == column.length-1) column[i] = player;
  }
  this.totalMoves++;
  this.turn = 1 - this.turn;//switch turn between 0 and 1
  this.checkWin();
}

Game.prototype.checkWin = function() {
  var winPatterns = [
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
  //use convolutions to check if a 4-in-a-row pattern exists
  var p1 = c.convolve(this.showPlayer(0), winPatterns)
  var p2 = c.convolve(this.showPlayer(1), winPatterns)
  for (var w = 0; w < p1.length; w++) {
    for (var i = 0; i < p1[w].length; i++) {
      for (var j = 0; j < p1[w][i].length; j++) {
        //check if any win pattern is matched perfectly
        if (p1[w][i][j] == 4) {
          this.gameOver = true;
          this.winner = 0;
          console.log("P1 WINS")
          return;
        }
        if (p2[w][i][j] == 4) {
          this.gameOver = true;
          this.winner = 1;
          console.log("P2 WINS")
          return;
        }
      }
    }
  }
}

//write the array in [col][row]
Game.prototype.getBoard = function() {
  var arr = [];
  for (var i = 0; i < this.board[0].length; i++) {
    var row = [];
    for (var j = 0; j < this.board.length; j++) {
      row.push(this.board[j][i])
    }
    arr.push(row);
  }
  //console.log(arr);
  return arr;
}

//show player's persepective (for AI input)
Game.prototype.showPlayer = function(player) {
  var arr = this.getBoard();
  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < arr[0].length; j++) {
      if (arr[i][j] == -1) arr[i][j] = 0;
      else if (arr[i][j] != player) arr[i][j] = -1;
      else arr[i][j] = 1;
    }
  }
  //board states: 0 = empty, 1 = player, -1 = other player
  return arr;
}

module.exports = {Game}