var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500;

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
setTimeout(()=>{
  console.log("REQUESTING")
  fetch('/getboard')
            .then((res)=>res.json())
            .then((board)=>{
              // express response
              ctx.fillStyle = "rgb(255,255,255)";
              ctx.fillRect(0,0,500,500)
              drawBoard(board);
              
            })
},2000)

function move(col){
  fetch('/postmove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({player:0, col:col})
      })
        .then((res)=>res.json())
        .then((board)=>{
          //send the data up!
          ctx.fillStyle = "rgb(255,255,255)";
              ctx.fillRect(0,0,500,500)
              drawBoard(board);
        })

}
