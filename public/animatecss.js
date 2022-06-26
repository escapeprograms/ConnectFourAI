//fades all selected elements out, then in
function fadeIn() {
  var elements = document.querySelectorAll(".fade");
  elements.forEach((e,i) => {
    console.log("an element with fade")
    e.classList.remove("fade","hidden");
    e.classList.add("fade-out");
    setTimeout(()=>{
      e.classList.add("fade");
      e.classList.remove("fade-out");
    },300*i);
  });
}
function fadeOut() {
  var elements = document.querySelectorAll(".fade");
  elements.forEach((e,i) => {
    console.log("an element with fade out")
    e.classList.remove("fade","hidden");
    setTimeout(()=>{
      e.classList.add("fade-out");
    },150*i);
  });
}
fadeIn()