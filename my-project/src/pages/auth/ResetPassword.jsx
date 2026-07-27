import { useState } from "react";
import { motion } from "framer-motion";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  RefreshCcw,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { resetPassword } from "../../services/authService";



const ResetPassword = () => {


  const navigate = useNavigate();

  const { token } = useParams();



  const [password,setPassword] =
    useState("");

  const [confirmPassword,setConfirmPassword] =
    useState("");


  const [showPassword,setShowPassword] =
    useState(false);


  const [showConfirm,setShowConfirm] =
    useState(false);


  const [loading,setLoading] =
    useState(false);


  const [message,setMessage] =
    useState("");

  const [error,setError] =
    useState("");




  const handleSubmit = async(e)=>{

    e.preventDefault();


    setError("");
    setMessage("");



    if(!password || !confirmPassword){

      setError(
        "Please complete all fields."
      );

      return;

    }



    if(password !== confirmPassword){

      setError(
        "Passwords do not match."
      );

      return;

    }



    try{


      setLoading(true);



      const res =
      await resetPassword(
        token,
        password
      );



      setMessage(
        res.message ||
        "Password updated successfully."
      );



      setTimeout(()=>{

        navigate("/login");

      },2500);



    }catch(err){

      setError(
        err?.response?.data?.message ||
        "Unable to reset password."
      );


    }finally{

      setLoading(false);

    }


  };





return (

<div
  className="
    relative flex justify-center items-center overflow-hidden
    min-h-screen
    px-4
    bg-[#050B18]
  "
>



{/* BACKGROUND */}

<div
  className="
    absolute inset-0
  "
>


<div
  className="
    top-[-150px] left-[-100px] absolute
    w-[400px] h-[400px]
    bg-blue-500/20
    rounded-full
    blur-[140px]
  "
  /
>



<div
  className="
    right-[-100px] bottom-[-150px] absolute
    w-[400px] h-[400px]
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
y:25
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
    p-8 sm:p-10
    bg-white/[0.06]
    border border-white/10 rounded-[30px]
    shadow-[0_40px_120px_rgba(0,0,0,.6)] backdrop-blur-2xl
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

<RefreshCcw
  size={38}
  className="
    text-white
  "
  /
>


</div>


</div>





<h1
  className="
    mt-7
    font-bold text-white text-2xl text-center
  "
>

Create a new password

</h1>




<p
  className="
    mt-3
    text-slate-400 text-sm text-center leading-6
  "
>

Choose a strong password to protect your SmartBudget account.

</p>






<form
  onSubmit={handleSubmit}
  className="
    space-y-5 mt-8
  "
>





{/* PASSWORD */}

<div>


<label
  className="
    text-slate-400 text-xs
  "
>

New password

</label>


<div
  className="
    relative
    mt-2
  "
>


<LockKeyhole
  size={18}
  className="
    top-1/2 left-4 absolute
    text-slate-400
    -translate-y-1/2
  "
  /
>



<input

type={
showPassword
?
"text"
:
"password"
}

value={password}

onChange={
(e)=>setPassword(e.target.value)
}

placeholder="Enter new password"

className="
w-full
h-14
rounded-2xl
bg-white/5
border
border-white/10
pl-12
pr-12
text-white
placeholder:text-slate-500
outline-none
focus:border-cyan-400/50
"
/>



<button

type="button"

onClick={()=>
setShowPassword(!showPassword)
}

className="
absolute
right-4
top-1/2
-translate-y-1/2
text-slate-400
"

>

{
showPassword
?
<EyeOff size={18}/>
:
<Eye size={18}/>
}

</button>


</div>

</div>







{/* CONFIRM PASSWORD */}

<div>


<label
  className="
    text-slate-400 text-xs
  "
>

Confirm password

</label>


<div
  className="
    relative
    mt-2
  "
>


<LockKeyhole
  size={18}
  className="
    top-1/2 left-4 absolute
    text-slate-400
    -translate-y-1/2
  "
  /
>



<input

type={
showConfirm
?
"text"
:
"password"
}

value={confirmPassword}

onChange={
(e)=>setConfirmPassword(e.target.value)
}

placeholder="Confirm password"

className="
w-full
h-14
rounded-2xl
bg-white/5
border
border-white/10
pl-12
pr-12
text-white
placeholder:text-slate-500
outline-none
focus:border-cyan-400/50
"

/>



<button

type="button"

onClick={()=>
setShowConfirm(!showConfirm)
}

className="
absolute
right-4
top-1/2
-translate-y-1/2
text-slate-400
"

>

{
showConfirm
?
<EyeOff size={18}/>
:
<Eye size={18}/>
}

</button>


</div>


</div>








{
error &&

<div
  className="
    p-3
    text-red-300 text-sm
    bg-red-500/10
    border border-red-500/20 rounded-xl
  "
>

{error}

</div>

}





{
message &&

<div
  className="
    flex items-center
    p-4
    text-emerald-200 text-sm
    bg-emerald-400/10
    border border-emerald-400/20 rounded-xl
    gap-2
  "
>


<CheckCircle2
  size={18}
  className="
    text-emerald-400
  "
  /
>


{message}


</div>


}





<button
  disabled={loading}
  className="
    w-full h-14
    font-semibold text-white
    bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400
    rounded-2xl
    disabled:opacity-50 shadow-lg
  "
>

{
loading
?
"Updating password..."
:
"Reset password"
}


</button>




</form>







<button

onClick={()=>navigate("/login")}

className="
mt-7
w-full
flex
items-center
justify-center
gap-2
text-sm
text-slate-400
hover:text-white
"

>

<ArrowLeft size={16}/>

Back to login

</button>






<div
  className="
    space-y-3 mt-8 pt-6
    border-white/10 border-t
  "
>


<div
  className="
    flex items-center
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

Your password is encrypted securely

</div>



<div
  className="
    text-slate-500 text-xs
  "
>

Use uppercase, lowercase, number and special character.

</div>


</div>



</div>


</motion.div>




</div>

);


};


export default ResetPassword;