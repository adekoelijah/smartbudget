import { memo } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

import {
  User,
  ShieldCheck,
  Bell,
  CreditCard,
  SlidersHorizontal,
  BadgeCheck,
  Activity,
  Wifi,
  LockKeyhole,
} from "lucide-react";

// import { useUser } from "../hooks/useUser";
import { useUser } from "../../../context/useUser";



const SECTION_CONFIG = {

  profile:{
    title:"Profile Settings",
    description:
      "Manage your identity, personal information and account details.",
    icon:User,
  },


  security:{
    title:"Security Center",
    description:
      "Protect your account with authentication and session controls.",
    icon:ShieldCheck,
  },


  notifications:{
    title:"Notification Settings",
    description:
      "Control alerts, financial updates and account communication.",
    icon:Bell,
  },


  preferences:{
    title:"Preferences",
    description:
      "Customize your SmartBudget experience.",
    icon:SlidersHorizontal,
  },


  billing:{
    title:"Billing & Subscription",
    description:
      "Manage plans, payments and subscription settings.",
    icon:CreditCard,
  },


};




const SettingsHeader = () => {


const location = useLocation();


const {
 user,
 loading,
} = useUser();




const key = location.pathname.split("/").pop();

const section =
  SECTION_CONFIG[key] ??
  SECTION_CONFIG.profile;



const SectionIcon =
section.icon;



const initials = user?.name
  ? user.name
      .split(" ")
      .map((item) => item[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  : "SB";





let securityStatus = 40;

if (user?.emailVerified) securityStatus += 20;
if (user?.phoneVerified) securityStatus += 15;
if (user?.twoFactorEnabled) securityStatus += 25;

securityStatus = Math.min(securityStatus, 100);





return (


<motion
  .section

initial={{
opacity:0,
y:-10,
}}

animate={{
opacity:1,
y:0,
}}

transition={{
duration:.3
}}
  className="
    relative overflow-hidden
    bg-white
    border border-slate-200 rounded-[28px]
    shadow-sm
  "
>


<div
  className="
    top-0 right-0 left-0 absolute
    h-1
    bg-gradient-to-r from-blue-700 via-indigo-600 to-emerald-500
  "
  /
>



<div
  className="
    relative
    space-y-6 p-6
  "
>


{/* USER HEADER */}


<div
  className="
    flex flex-col lg:flex-row lg:justify-between lg:items-center
    gap-6
  "
>


<div
  className="
    flex items-center
    gap-4
  "
>


<div
  className="
    flex justify-center items-center overflow-hidden
    w-16 h-16
    font-bold text-white text-xl
    bg-slate-900
    rounded-2xl
  "
>

{
user?.avatar
?

<img
  src={user.avatar}
alt={user?.name}
  className="
    object-cover
    w-full h-full
  "
  /
>

:

initials

}

</div>




<div>


<div
  className="
    flex flex-wrap items-center
    gap-2
  "
>


<h2
  className="
    font-semibold text-slate-950 text-xl
  "
>

{
loading
?
"Loading..."
:
user?.name || "SmartBudget User"
}

</h2>



<span
  className="
    inline-flex items-center
    px-2 py-1
    font-semibold text-emerald-700 text-xs
    bg-emerald-50
    border border-emerald-200 rounded-full
    gap-1
  "
>

<BadgeCheck size={13}/>

Verified

</span>



</div>




<p
  className="
    mt-1
    text-slate-500 text-sm
  "
>

{
user?.email ||
"No email connected"
}

</p>




<div
  className="
    flex flex-wrap
    mt-3
    gap-3
  "
>


<StatusPill
icon={Wifi}
text="Live Sync"
/>


<StatusPill
icon={Activity}
text="System Healthy"
/>



</div>


</div>



</div>







{/* SECURITY SCORE */}



<div
  className="
    w-full lg:w-72
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


<div>

<p
  className="
    font-medium text-slate-500 text-xs uppercase tracking-wide
  "
>
Security Score
</p>


<h3
  className="
    mt-1
    font-bold text-slate-900 text-3xl
  "
>

{securityStatus}%

</h3>


</div>



<ShieldCheck
  size={32}
  className="
    text-blue-600
  "
  /
>


</div>



<div
  className="
    overflow-hidden
    h-2
    mt-4
    bg-slate-200
    rounded-full
  "
>


<div
  className="
    h-full
    bg-blue-600
    rounded-full
    transition-all
  "
  style={{
width:`${securityStatus}%`
}}

/
>


</div>


</div>



</div>







{/* ACTIVE SECTION */}



<div
  className="
    flex flex-col md:flex-row justify-between md:items-center
    p-5
    bg-slate-50
    border border-slate-200 rounded-3xl
    gap-5
  "
>


<div
  className="
    flex items-center
    gap-4
  "
>


<div
  className="
    flex justify-center items-center
    w-12 h-12
    text-white
    bg-slate-950
    rounded-xl
  "
>

<SectionIcon size={22}/>

</div>




<div>


<p
  className="
    font-semibold text-slate-400 text-xs uppercase tracking-widest
  "
>

Settings Module

</p>



<h1
  className="
    mt-1
    font-bold text-slate-950 text-2xl
  "
>

{section.title}

</h1>



<p
  className="
    mt-2
    text-slate-500 text-sm
  "
>

{section.description}

</p>



</div>


</div>







<div
  className="
    flex items-center
    px-4 py-3
    bg-white
    border border-emerald-200 rounded-2xl
    gap-3
  "
>


<div
  className="
    flex justify-center items-center
    w-10 h-10
    bg-emerald-50
    rounded-xl
  "
>

<LockKeyhole
  size={18}
  className="
    text-emerald-600
  "
  /
>


</div>



<div>

<p
  className="
    font-semibold text-slate-900 text-sm
  "
>

Protection Active

</p>


<p
  className="
    text-slate-500 text-xs
  "
>

Encrypted financial workspace

</p>


</div>


</div>



</div>



</div>


</motion.section>


);

};







const StatusPill = ({
icon:Icon,
text,
})=>(

<div
  className="
    flex items-center
    px-3 py-1.5
    font-medium text-slate-600 text-xs
    bg-white
    border border-slate-200 rounded-full
    gap-2
  "
>

<Icon
  size={13}
  className="
    text-emerald-600
  "
  /
>
{text}

</div>

);



export default memo(SettingsHeader);