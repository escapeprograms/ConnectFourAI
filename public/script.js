var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500;
var gameBoard = [];

//unique client ID
var clientId = Math.floor(Math.random()*10000);

function generateBoard() {
  var table = document.createElement("TABLE");
  table.setAttribute("id","game-table"); 
  document.getElementById("game-container").appendChild(table);
  
  for (var j = 0; j < 6; j++) {
    var row = table.insertRow();
    row.classList.add("game-row");
    for (var i = 0; i < 7; i++) {
      var circle = row.insertCell();
      circle.classList.add("dot","gray","col"+i);
      circle.setAttribute("onclick",`move(${i})`)
    }
  }

}
generateBoard();

function updateBoard() {
  for (var y = 0; y < 6; y++) {
    for (var x = 0; x < 7; x++) {
      var ele = document.getElementsByClassName("dot")[y*7+x];
      ele.classList.remove("gray","red","yellow");
      if (gameBoard[x][y] == -1) ele.classList.add("gray");
      if (gameBoard[x][y] == 0) ele.classList.add("red");
      if (gameBoard[x][y] == 1) ele.classList.add("yellow");
    }
  }
}

function drawBoard(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      ctx.fillStyle = "rgb(255,255,255)"
      if (board[i][j] == 0) {
        ctx.fillStyle = "rgb(0,0,0)"
      }
      if (board[i][j] == 1) {
        ctx.fillStyle = "rgb(255,0,0)"
      }
      ctx.fillRect(i*25,j*25,20,20);
      ctx.strokeRect(i*25,j*25,20,20);
    }
  }
}

//get initial board
function getNewGame() {
  /*console.log("REQUESTING")
  fetch('/getboard')
            .then((res)=>res.json())
            .then((data)=>{
            
              gameBoard = data;
              updateBoard();
            })*/
  fetch('/postgame', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({id:clientId})
      })
        .then((res)=>res.json())
        .then((data)=>{
          //send the data up!
          /*ctx.fillStyle = "rgb(255,255,255)";
              ctx.fillRect(0,0,500,500)
              drawBoard(board);*/
          gameBoard = data.board;
          updateBoard();
        });
}
getNewGame();


function move(col){
  fetch('/postmove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({player:0, col:col, id:clientId})
      })
        .then((res)=>res.json())
        .then((data)=>{
          //send the data up!
          /*ctx.fillStyle = "rgb(255,255,255)";
              ctx.fillRect(0,0,500,500)
              drawBoard(board);*/
          gameBoard = data.board;
          updateBoard();
          //check winner
          if (data.winner != -1) {
            console.log("Game Over");
            if (data.winner == 0) document.getElementById("winner").innerText = "You Won!";
            else document.getElementById("winner").innerText = "You Lost!";
            document.getElementById("win-loss").style.display = "block";
          }
        });
}

//click handler
document.getElementById("game-btn").addEventListener("click", (e)=>{
  fadeOut();
  setTimeout(()=>{
    document.getElementById("game-container").style.display = "block";
  },1000);
});