const display = document.getElementById("display");

function append(value){
    display.value += value;
}

function clearDisplay(){
    display.value = "";
}

function backspace(){
    display.value = display.value.slice(0,-1);
}

function calculate(){

    try{

        display.value = eval(display.value);

    }

    catch{

        display.value = "Error";

    }

}

function toggleSign(){

    if(display.value==="") return;

    display.value = parseFloat(display.value) * -1;

}

// Keyboard Support

document.addEventListener("keydown",function(e){

    const key=e.key;

    if(!isNaN(key) || "+-*/.%".includes(key)){
        append(key);
    }

    if(key==="Enter"){
        calculate();
    }

    if(key==="Backspace"){
        backspace();
    }

    if(key==="Escape"){
        clearDisplay();
    }

});