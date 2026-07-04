import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

  // const[count,setCount]=useState(0);

  // // useEffect(()=>{
  // //   setTimeout(()=>{
  // //     setCount((count)=>count+1);
  // //   },1000);
  // // });

  // useEffect(()=>{
  //   setCount(()=>count*3);
  // },[count]);

  // return(<><h2>Page Loading{count}</h2>
  // <button onClick={()=>setCount((c)=>c+3)}>Increase</button>
  // <p>Calculation: {count * 2}</p></>)


// const Fetching=()=>{
//     const[inp,setInt]=useState(null);

//     useEffect(()=>{
//       fetch('https://jsonplaceholder.typicode.com/todos')
//       .then((res)=>res.json())
//       .then((inp)=>setInp(inp));
//     });

//     return (
//       <>
//       {
//         inp&&inp.map((item)=>{
//           return <p key={item.id}>{item.title}</p>
//         })
//       }
//       </>
//     )
// }

const Fetching=()=>{
  const[inp,setInp]=useState(null);

  useEffect(()=>{
    fetch('https://jsonplaceholder.typicode.com/todos')
    .then((res)=>res.json())
    .then((inp)=>setInp(inp));
  }, []);

return(
  <>
  {inp&&inp.map((item)=>{
    return<p key={item.id}>{item.title}</p>
  })}
  </>
)


}


createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    {/* <Effect /> */}
    <Fetching />
  </StrictMode>,
);
