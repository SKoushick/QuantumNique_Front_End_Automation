let score=0;

let questionNo=0;

let answer=0;

let timer=30;

let interval;

let difficulty="easy";

function startQuiz(level){

difficulty=level;

score=0;

questionNo=0;

document.getElementById("score").innerHTML=0;

nextQuestion();

startTimer();

}

function random(min,max){

return Math.floor(Math.random()*(max-min+1))+min;

}

function nextQuestion(){

questionNo++;

document.getElementById("current").innerHTML=questionNo;

document.getElementById("answer").value="";

document.getElementById("result").innerHTML="";

document.getElementById("progressBar").style.width=(questionNo*10)+"%";

if(questionNo>10){

finishQuiz();

return;

}

let a,b;

if(difficulty=="easy"){

a=random(1,20);

b=random(1,20);

}

else if(difficulty=="medium"){

a=random(20,80);

b=random(10,50);

}

else{

a=random(100,300);

b=random(50,150);

}

let op=random(1,4);

switch(op){

case 1:

answer=a+b;

document.getElementById("question").innerHTML=a+" + "+b;

break;

case 2:

answer=a-b;

document.getElementById("question").innerHTML=a+" - "+b;

break;

case 3:

answer=a*b;

document.getElementById("question").innerHTML=a+" × "+b;

break;

case 4:

answer=Math.floor(a/b);

document.getElementById("question").innerHTML=(answer*b)+" ÷ "+b;

break;

}

}

function checkAnswer(){

let user=parseInt(document.getElementById("answer").value);

if(user==answer){

score++;

document.getElementById("score").innerHTML=score;

document.getElementById("result").innerHTML="✅ Correct";

}

else{

document.getElementById("result").innerHTML="❌ Wrong";

}

setTimeout(nextQuestion,700);

}

function startTimer(){

clearInterval(interval);

timer=30;

document.getElementById("timer").innerHTML=timer;

interval=setInterval(function(){

timer--;

document.getElementById("timer").innerHTML=timer;

if(timer==0){

finishQuiz();

}

},1000);

}

function finishQuiz(){

clearInterval(interval);

document.getElementById("question").innerHTML="Quiz Finished";

document.getElementById("result").innerHTML="Final Score : "+score+"/10";

}

function restartQuiz(){

startQuiz(difficulty);

}