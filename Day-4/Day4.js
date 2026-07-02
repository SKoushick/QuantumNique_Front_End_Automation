// let a=10;
// let b=20;
// let c =a+b;

// console.log(c);
// console.log(typeof c);
// console.log(typeof false);
// console.log(typeof "Welcome");
// console.log(10=="10");
// console.log(10==="10");
// console.log(a>5||15<a);
// console.log(!false);

function Checker(){
  var num =document.getElementById("num").value;
  if(num%2==0){
    document.getElementById("res").innerHTML="Even";
    }
  else{
    document.getElementById("res").innerHTML="Odd";
  }
}