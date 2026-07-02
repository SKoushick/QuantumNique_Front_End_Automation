// class Employee{
//     constructor(id,name){
//         this.id=id;
//         this.name=name;
//     }
//     // income(sal,bon){
//     //     this.salary=sal;
//     //     this.bonus=bon;
//     // }

//     // income=(salary,bonus)=>{
//     //     this.sal=salary;
//     //     this.bon=bonus;
//     // }

//     income=(salary,bonus)=>salary+bonus;

//     ShowInfo(){
//         console.log(`Employee Id ${this.id} and Name is ${this.name}`);
//         // console.log(`Employee Salary With Bonus ${this.salary+this.bonus}`);
//     }
// }
// const emp =new Employee(101,"Sameul");
// console.log(emp.income(50000,10000));
// emp.ShowInfo();



let bikes= ["Yamaha","TVS","Bajaj","Suzuki","BMW","Hero"];
// let bikes2 =[...bikes];
let bikes2=["Ducati","Honda"];
bikes2.push("XL");
let bikes3=[...bikes,...bikes2];
bikes2.concat(bikes);
// const fir = bikes[0];
// const sec =bikes[1];
// console.log(`${fir} ${sec}`);

// Giving the values in an array is possible and it takes the value and store them in order of index
// const[fir,sec,thi]=bikes;
// console.log(`${fir} ${sec} ${thi}`);

//Visual Basics always indexing starts from 1


// const[fir,,thi]=bikes;
// console.log(`${fir} ${thi}`);
// console.log(bikes2);
console.log(bikes3);

//In java we can create multiple objects but we cannot create the one object the twice but in JS we can create multiple Same objects 


const employee={
    id:101,
    name:"Jey"
}

const Sal={
    Salary:30000,
    Dept:"AI&DS"
}

const copyEmp={
    ...employee,...Sal
}


console.log(copyEmp);
