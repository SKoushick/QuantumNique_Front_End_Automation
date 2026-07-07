import {useParams,useNavigate} from "react-route-dom";
import StudentInfo from "../data/Students";

function StudDynamic(){

    const {id}=useParams();  //Read URL as Parameters - id
    const navigate = useNavigate(); // Data StudentInfo --> StudDynamic

    //{Students/2} Find the matching student

    const stud = StudentInfo.find(stu=>stu.id===Number(id));


    return(
        <>
        
        <h3>Student Info</h3>
        <h4>ID:{stud.id}</h4>
        <h4>Name:{stud.name}</h4>
        <h4>Department:{stud.dept}</h4>
        <h4>Year Of Study:{stud.yos}</h4>
        <button onClick={()=>navigate("/")}>Back</button>
        
        </>
    )

}