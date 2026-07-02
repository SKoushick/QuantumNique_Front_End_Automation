function findPercentage(){

let value=parseFloat(document.getElementById("value").value);

let percent=parseFloat(document.getElementById("percent").value);

let result=(value*percent)/100;

document.getElementById("answer").innerHTML=

percent+"% of "+value+" = "+result;

}