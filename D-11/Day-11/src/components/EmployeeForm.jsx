import { useState,useEffect } from "react";


function EmployeeForm({
    addEmployee,editEmployee,updateEmployee
}){

const [employee,setEmployee] =useState({
    name:"",
    department:"",
    email:""
});

useEffect(()=>{
    if(editEmployee){
        setEmployee(editEmployee);
    }
},[editEmployee]);

//Handles the typing
const handleChange=(event)=>{
    setEmployee({
        ...employee,//existing will remain same
        [event.target.name]:event.target.value// change only the updated field
    });
};

const handleSubmit=(event)=>{
  event.preventDefault();
        if(editEmployee){
            updateEmployee(employee);
        }
        else{
            addEmployee(employee);
        }
setEmployee({
    name:"",
    department:"",
    email:""
});
    
};
return(
    <div>
        <h2>{editEmployee ? "Update Employee":"Add Employee"}</h2>

        <form onSubmit={handleSubmit}>
            <input type="text" name="name" plaeholder="Enter your name"
            value={employee.name} onChange={handleChange}/><br></br>
            <input type="text" name="department" plaeholder="Enter your Department"
            value={employee.department} onChange={handleChange}/><br></br>
            <input type="text" name="email" plaeholder="Enter your Email"
            value={employee.email} onChange={handleChange}/><br></br>
            <button>{editEmployee ? "Update":"Add"}</button>
        </form>
    </div>


);
}

export default EmployeeForm;