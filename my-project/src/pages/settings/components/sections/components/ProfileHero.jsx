import {
  memo,
} from "react";


import {
  motion,
} from "framer-motion";


import {
  Camera,
  BadgeCheck,
  ShieldCheck,
  CalendarDays,
  User,
  LockKeyhole,
} from "lucide-react";





const ProfileHero = ({
  profile,
  preview,
  loading,
  onAvatarChange,
}) => {



const initials =
profile?.name
?
profile.name
.trim()
.split(" ")
.map(word => word[0])
.join("")
.slice(0,2)
.toUpperCase()
:
"SB";


const joinedDate =
profile?.createdAt
?
new Date(profile.createdAt)
.toLocaleDateString(
"en-US",
{
year:"numeric",
month:"long",
}
)
:
"Recently joined";

const completion =
useMemo(()=>{


let score = 0;


if(profile?.name)
score +=20;


if(profile?.email)
score +=20;


if(profile?.emailVerified)
score +=20;


if(profile?.phoneVerified)
score +=15;


if(profile?.avatar)
score +=10;


if(profile?.twoFactorEnabled)
score +=15;



return score;


},[
profile
]);










return (

<motion
  .section

initial={{
opacity:0,
y:10,
}}

animate={{
opacity:1,
y:0,
}}

transition={{
duration:0.3,
}}
  className="
    p-6 md:p-8
    bg-white
    border border-slate-200 rounded-3xl
    shadow-sm
  "
>


<div
  className="
    flex flex-col xl:flex-row xl:justify-between xl:items-center
    gap-8
  "
>






{/* PROFILE IDENTITY */}


<div
  className="
    flex flex-col sm:flex-row items-center sm:items-start
    gap-6
  "
>





{/* AVATAR */}


<div
  className="
    relative
  "
>


<div
  className="
    flex justify-center items-center overflow-hidden
    w-28 h-28
    bg-slate-100
    border border-slate-200 rounded-3xl
  "
>


{
preview || profile?.avatar

?

<img
  src={
preview ||
profile.avatar
}

alt={
profile?.name
}
  className="
    object-cover
    w-full h-full
  "
  /
>

:

<span
  className="
    font-bold text-slate-700 text-3xl
  "
>

{initials}

</span>

}



</div>






<label
  className="
    right-0 bottom-0 absolute flex justify-center items-center
    w-10 h-10
    text-white
    bg-blue-600 hover:bg-blue-700
    rounded-xl
    shadow-md transition
    cursor-pointer
  "
>


<Camera size={18}/>


<input

hidden

type="file"

accept="image/png,image/jpeg"

disabled={loading}

onChange={(e)=>{


const file =
e.target.files?.[0];


if(file){

onAvatarChange(file);

}


}}


/>


</label>



</div>









{/* USER INFO */}


<div
  className="
    space-y-3
    text-center sm:text-left
  "
>


<div>


<h1
  className="
    font-bold text-slate-900 text-2xl md:text-3xl
  "
>

{
profile?.name ||
"SmartBudget User"
}

</h1>



<p
  className="
    mt-1
    text-slate-500
  "
>

{
profile?.email
}

</p>



</div>







<div
  className="
    flex flex-wrap justify-center sm:justify-start
    gap-2
  "
>


{
profile?.emailVerified && (

<Badge

icon={BadgeCheck}

text="Verified"

/>

)

}




{
profile?.twoFactorEnabled && (

<Badge

icon={ShieldCheck}

text="2FA Protected"

/>

)

}





<Badge

icon={CalendarDays}

text={`Member since ${joinedDate}`}

/>



</div>


</div>



</div>









{/* COMPLETION CARD */}



<div
  className="
    w-full xl:w-96
    p-5
    bg-slate-50
    border border-slate-200 rounded-2xl
  "
>


<div
  className="
    flex justify-between items-center
  "
>


<div
  className="
    flex items-center
    gap-2
  "
>


<User
  size={18}
  className="
    text-blue-600
  "
  /
>


<h3
  className="
    font-semibold text-slate-900
  "
>

Profile Strength

</h3>


</div>



<span
  className="
    font-bold text-blue-600
  "
>

{completion}%

</span>


</div>







<div
  className="
    overflow-hidden
    h-2
    mt-5
    bg-slate-200
    rounded-full
  "
>


<motion
  .div

initial={{
width:0
}}

animate={{

width:`${completion}%`

}}

transition={{
duration:0.6
}}
  className="
    h-full
    bg-blue-600
    rounded-full
  "
  /
>


</div>






<p
  className="
    mt-4
    text-slate-500 text-sm leading-6
  "
>

Complete your profile information and security settings
to unlock a more personalized SmartBudget experience.

</p>



</div>





</div>


</motion.section>


);

};







function Badge({
icon:Icon,
text,
}){


return (

<div
  className="
    flex items-center
    px-3 py-1.5
    font-medium text-slate-600 text-sm
    bg-slate-100
    border border-slate-200 rounded-full
    gap-2
  "
>


<Icon size={14}/>

{text}


</div>

);


}


export default memo(ProfileHero);