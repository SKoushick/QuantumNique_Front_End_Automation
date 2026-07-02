function calculateStats(){

let arr=document.getElementById("numbers").value
.split(",")
.map(Number)
.sort((a,b)=>a-b);

let sum=arr.reduce((a,b)=>a+b);

let mean=sum/arr.length;

let median;

if(arr.length%2==0){

median=(arr[arr.length/2]+arr[arr.length/2-1])/2;

}

else{

median=arr[Math.floor(arr.length/2)];

}

let frequency={};

arr.forEach(x=>{

frequency[x]=(frequency[x]||0)+1;

});

let mode=arr[0];

let max=0;

for(let key in frequency){

if(frequency[key]>max){

max=frequency[key];

mode=key;

}

}

let range=arr[arr.length-1]-arr[0];

let variance=arr.reduce((a,b)=>a+(b-mean)**2,0)/arr.length;

let sd=Math.sqrt(variance);

document.getElementById("mean").innerHTML=mean.toFixed(2);

document.getElementById("median").innerHTML=median;

document.getElementById("mode").innerHTML=mode;

document.getElementById("range").innerHTML=range;

document.getElementById("variance").innerHTML=variance.toFixed(2);

document.getElementById("sd").innerHTML=sd.toFixed(2);

}