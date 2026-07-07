import StudentInfo from "../data/Students";
import {Link} from "react-route-dom";


function StudentDetails(){
    
    return(
        <div>
            <h2>Student Details</h2>
        {
        StudentInfo.map((Student)=>{
            <div key={(student.id)}>
                <Link to={`/student/${Student.id}`}>
                {student.name}
                
                </Link>
            </div>
        })
    }
    
        </div>
    )


}

export default StudentDetails