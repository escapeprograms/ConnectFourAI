//convolution
//NOTE: kernels is an array of all kernels used in the layer, each kernel is rectangular
function convolve(arr, kernels) {
  var output = [];
  kernels.forEach((k) => {
    var out = [];
    //apparently loops are much faster than .forEach()
    for (var y = 0; y < arr.length-k.length+1; y++) {
      var row = [];
      for (var x = 0; x < arr[0].length-k[0].length+1; x++) {
        var section = getSection(arr, x, y, k[0].length, k.length);
        row.push(applyKernel(section, k))
      }
      out.push(row);
    }
    output.push(out);
  });
  return output;
}
//no longer exponential, its cubic
function convolveExp(arr, kernels) {
  var a = convolve(arr, kernels);
  for (var i = 0; i < a.length; i++) {
    for (var y = 0; y < a[i].length; y++) {
      for (var x = 0; x < a[i][y].length; x++) {
        a[i][y][x] = Math.pow(a[i][y][x], 3)
      }
    }
  }
  return a;
}

//get the piece of array to apply kernel too (indexed by top left)
function getSection(arr, x, y, w, h) {
  var out = [];
  for (var i = y; i < y + h; i++) {
    var row = [];
    for (var j = x; j < x + w; j++) {
      row.push(arr[i][j]);
    }
  out.push(row);
  }
  return out;
}
//apply kernel onto a section of array
function applyKernel(arr, kernel) {
  var sum = 0;
  for (var i = 0; i < arr.length; i++) {
    for (var j = 0; j < arr[0].length; j++) {
      sum += arr[i][j] * kernel[i][j];
    }
  }
  return sum;
}

module.exports = {convolve, convolveExp}