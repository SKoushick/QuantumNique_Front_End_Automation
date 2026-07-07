function EmployeeList({ 
    employees, onDelete,onEdit

}){

return(

<div>
    <h2>Employee Lists</h2>
    <table border="1" cellPadding="10">
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Email</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>{
        //Get--->While open the browser all data will be displayed by default
        
        employees.map((employee)=>(
            <tr key={employee.id}>
            <td>{employee.id}</td>  
            <td>{employee.name}</td>
            <td>{employee.department}</td>
            <td>{employee.email}</td>
            <td>
                <button onClick={()=>onEdit(employee)}>Edit</button>
                <button onClick={()=>onDelete(employee.id)}>Delete</button>
            </td>
            </tr>

        )
        )
}
        </tbody>
    </table>
</div>
);
}
export default EmployeeList;