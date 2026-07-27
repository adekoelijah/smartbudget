import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../services/authService";


const AuthSuccess = () => {


  const navigate = useNavigate();


  const [status, setStatus] =
    useState("Verifying your account...");


  const [error, setError] =
    useState("");



  useEffect(() => {


    const completeAuthentication = async()=>{


      try {


        const params =
        new URLSearchParams(
          window.location.search
        );


        const token =
        params.get("token");



        if(!token){

          throw new Error(
            "Authentication token missing."
          );

        }



        /*
          Save JWT
        */

        localStorage.setItem(
          "token",
          token
        );



        setStatus(
          "Loading your SmartBudget account..."
        );



        /*
          Fetch current user
        */

        const response =
        await getCurrentUser();



        const user =
        response?.user || response;



        if(!user){

          throw new Error(
            "Unable to retrieve user information."
          );

        }



        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );



        setStatus(
          "Authentication successful."
        );



        /*
          Redirect dashboard
        */

        setTimeout(()=>{

          navigate("/dashboard",{
            replace:true,
          });

        },1000);



      }catch(err){


        console.error(
          "AUTH_SUCCESS_ERROR:",
          err
        );


        setError(
          err.message ||
          "Authentication failed."
        );


        localStorage.removeItem(
          "token"
        );


        localStorage.removeItem(
          "user"
        );


      }


    };


    completeAuthentication();


  },[navigate]);







return (

<div
  className="
    relative flex justify-center items-center overflow-hidden
    min-h-screen
    px-4
    bg-[#050B18]
  "
>


{/* Background */}

<div
  className="
    absolute inset-0
  "
>

<div
  className="
    top-[-120px] left-[-120px] absolute
    w-[420px] h-[420px]
    bg-blue-500/20
    rounded-full
    blur-[140px]
  "
  /
>


<div
  className="
    right-[-120px] bottom-[-120px] absolute
    w-[420px] h-[420px]
    bg-emerald-400/10
    rounded-full
    blur-[140px]
  "
  /
>


</div>







<motion
  .div

initial={{
opacity:0,
y:20
}}

animate={{
opacity:1,
y:0
}}
  className="
    relative
    w-full max-w-md
  "
>


<div
  className="
    p-10
    text-center
    bg-white/[0.06]
    border border-white/10 rounded-[30px]
    shadow-[0_40px_120px_rgba(0,0,0,.5)] backdrop-blur-2xl
  "
>



<div
  className="
    flex justify-center
  "
>


<div
  className="
    flex justify-center items-center
    w-20 h-20
    bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400
    rounded-3xl
  "
>


{
error ?

<AlertCircle
  size={40}
  className="
    text-white
  "
  /
>

:

status.includes("successful") ?

<CheckCircle2
  size={40}
  className="
    text-white
  "
  /
>

:

<Loader2
  size={40}
  className="
    text-white
    animate-spin
  "
  /
>

}


</div>


</div>






<h1
  className="
    mt-7
    font-bold text-white text-2xl
  "
>

{
error
?
"Authentication Failed"
:
"Welcome to SmartBudget"
}

</h1>







<p
  className="
    mt-4
    text-slate-400 text-sm leading-6
  "
>

{
error
?
error
:
status
}

</p>







{
!error &&

<div
  className="
    flex justify-center items-center
    mt-8
    text-slate-400 text-xs
    gap-2
  "
>

<ShieldCheck
  size={15}
  className="
    text-emerald-400
  "
  /
>

Secure authentication protected

</div>

}





{
error &&

<button

onClick={()=>
navigate("/login")
}

className="
mt-8
w-full
h-12
rounded-xl
bg-white/10
border
border-white/10
text-white
hover:bg-white/20
transition
"

>

Return to login

</button>

}



</div>


</motion.div>




</div>


);


};


export default AuthSuccess;