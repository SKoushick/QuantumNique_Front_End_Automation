import axios from "axios";

//API URL

const API_URL="https://6a4b3684f5eab0bb6b62570b.mockapi.io/Adimai";

//GET EMPLOYEES
 
export const getEmployees=()=>{

    return axios.get(API_URL);
};
//POST 

export const addEmployee=(employee)=>{
    return axios.post(API_URL,employee);
};

//PUT-->https://6a48e677a033dcb98d65067b.mockapi.io/employees/id
export const updateEmployee=(id,employee)=>{
    return axios.put(`${API_URL}/${id}`,employee);
};

//DELETE->https://6a48e677a033dcb98d65067b.mockapi.io/employees/id

export const deleteEmployee=(id)=>{
    return axios.delete(`${API_URL}/${id}`);
};