//TRAINING SCRIPT
const fs = require("fs");//for testing purposes
const ai = require("./ai.js");
const game = require("./game.js");
const _ = require("lodash");

//settings for simulation
var numSims = 60;
var numSelected = 10;

//get weights
//var data = fs.readFileSync(__dirname+"/log.txt")
//var botNetwork = JSON.parse(data);


//run training over a period of time
var results = [];
setInterval(()=>{
  console.log("new generation")
  var sims = startSims(results);
  results = [];//reset results
  sims.forEach((s) =>{
    s.runMoves();
    results.push(s.results)
  });
  console.log(results)
  console.log("generation done")
},3000);

function startSims(results) {
  var sims = [];
  //empty array or no input  
  if (!results || results.length == 0) {
    for (var i = 0; i < numSims; i++) {
      sims.push(_.cloneDeep(new ai.Simulation()))
    }
    return sims;
  }
  //sort results by best
  var best = sortArr(results).slice(0,numSelected);
  //console.log(best.length)
  //save the best scorer to the log
  fs.writeFileSync("log.txt",JSON.stringify(best[0]))
  //the control simulation is the second best scorer
  var controlSim = {weights:best[1].weights, bias:best[1].bias};
  
  for (var i = 0; i < numSims; i++) {
    var n = Math.floor(Math.random()*best.length);
    sims.push(_.cloneDeep(new ai.Simulation({
      weights:best[n].weights,
      bias:best[n].bias}, controlSim)));
    sims[i].mutate();
  }
  return sims;
}

//generic sort
function sortArr(arr){
    //Start from the second element.
    for(let i = 1; i < arr.length;i++){
        //Go through the elements behind it.
        for(let j = i - 1; j > -1; j--){
            //value comparison using ascending order (fitness).
            if(arr[j + 1].fit > arr[j].fit){
                //swap
                [arr[j+1],arr[j]] = [arr[j],arr[j + 1]];
            }
        }
    }
  return arr;
}