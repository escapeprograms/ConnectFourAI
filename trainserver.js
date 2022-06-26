//TRAINING SCRIPT
const fs = require("fs");//for testing purposes
const ai = require("./ai.js");
const game = require("./game.js");
const _ = require("lodash");
const math = require("mathjs")

//settings for simulation
var numSims = 60;
var numSelected = 10;
var useCrossover = true;
var genCounter = 0;//generation counter

//get weights
var data = fs.readFileSync(__dirname+"/log.txt")
var botNetwork = JSON.parse(data);


//run training over a period of time
var results = [];
setInterval(()=>{
  console.log("new generation: "+genCounter)
  var sims = startSims(results);
  results = [];//reset results
  sims.forEach((s) =>{
    s.runMoves();
    results.push(s.results)
  });
  console.log(results)
  console.log("generation done")
  genCounter++;
},3000);


//geneitic crossover
function crossOver(w1, w2){
  //get shape of weights in a template
  var fw1 = w1;
  var fw2 = w2;
  //flatten
  var flat1 = math.flatten(w1);
  var flat2 = math.flatten(w2);
  //crossover
  var cross = Math.floor(Math.random()*flat1.length);
  var temp = flat1;
  flat1 = flat1.slice(0,cross).concat(flat2.slice(cross));
  flat2 = flat2.slice(0,cross).concat(temp.slice(cross));
  //unflatten weights
  var nw1 = unflatten(flat1,fw1);
  var nw2 = unflatten(flat2,fw2);
  return [nw1,nw2];
}

function unflatten(w,template) {
  var i = 0;
  for (var a = 0; a < template.length; a++){//layer
  for (var b = 0; b < template[a].length; b++){//node
  for (var c = 0; c < template[a][b].length; c++){//weight
    template[a][b][c] = w[i];
    i++;
  }
  }
  }
  return template;
}

//start simulations
function startSims(results) {
  var sims = [];
  //empty array or no input  
  if (!results || results.length == 0) {
    for (var i = 0; i < numSims; i++) {
      sims.push(_.cloneDeep(new ai.Simulation(botNetwork,botNetwork)))
    }
    return sims;
  }
  //sort results by best
  var best = sortArr(results).slice(0,numSelected);
  //console.log(best.length)
  //save the best scorer to the log
  fs.writeFileSync("log.txt",JSON.stringify(best[0]))
  
  //the control simulation is the best scorer
  var controlSim = {weights:best[0].weights, bias:best[0].bias};
  //populate bots with crossover
  if (useCrossover) {
    for (var i = 0; i < numSims; i+=2) {
      var n = Math.floor(Math.random()*best.length);
      var n2 = Math.floor(Math.random()*best.length);
      var weightPair = crossOver(best[n].weights, best[n2].weights);
      var biasPair = crossOver(best[n].bias,best[n2].bias);
      sims.push(_.cloneDeep(new ai.Simulation({
        weights:weightPair[0],
        bias:biasPair[0]}, controlSim)));
      sims.push(_.cloneDeep(new ai.Simulation({
        weights:weightPair[1],
        bias:biasPair[1]}, controlSim)));
      sims[i].mutate();
      sims[i + 1].mutate();
    }
    return sims;
  } else {
    //populate bots normally
    for (var i = 0; i < numSims/2; i++) {
      var n = Math.floor(Math.random()*best.length);
      sims.push(_.cloneDeep(new ai.Simulation({
        weights:best[n].weights,
        bias:best[n].bias}, controlSim)));
      sims[i].mutate();
    }
    return sims;
  }
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