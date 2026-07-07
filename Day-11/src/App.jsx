import { useEffect, useState } from "react";
import EmployeeForm from "./components/EmployeeForm";
import EmployeeList from "./components/EmployeeList";
import { getEmployees,addEmployee,updateEmployee,deleteEmployee } from "./services/employeeService";


function App(){

  const[employees,setEmployees]=useState([]);//Store the emp list
 //store selected emp
  const[editEmployee,setEditEmployee]=useState(null);
  //load the details of employee--GET
  
  const storedEmployee=()=>{
    getEmployees().then((response)=>{
      setEmployees(response.data);
    })
    .catch((error)=>{
        console.log(error);
    });
  };

  useEffect(()=>{
    storedEmployee();
  },[]);

  const insertEmployee=(employee)=>{
    addEmployee(employee).then(()=>{storedEmployee();
  });
};

return(
<div>
  <h1>Employee Management</h1>

  <EmployeeForm
  addEmployee={insertEmployee}
  editEmployee={editEmployee}
  updateEmployee={editEmployee}
  
  />
  <EmployeeList
  
  employees={employees}
   onDelete={editEmployee}
   onEdit={setEditEmployee}
  
  
  />
</div> 

)



};
export default App;