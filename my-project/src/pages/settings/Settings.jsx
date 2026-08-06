import {
useEffect,
useState,
} from "react";


import {
motion,
AnimatePresence,
} from "framer-motion";


import {
Menu,
X
} from "lucide-react";


import {
Outlet,
useLocation,
useNavigate,
} from "react-router-dom";


import SettingsHeader from "./components/SettingsHeader";
import SettingsNav from "./components/SettingsNav";




const Settings =()=>{


const [
mobileNav,
setMobileNav
]=useState(false);



const location =
useLocation();



const navigate =
useNavigate();





const activeTab =
location.pathname
.split("/")
.filter(Boolean)
.pop()
||
"profile";







useEffect(()=>{


if(
location.pathname === "/app/settings"
){

navigate(
"/app/settings/profile",
{
replace:true
}
);


}


},[
location.pathname,
navigate
]);








const handleNavigate=(tab)=>{


navigate(
`/app/settings/${tab}`
);


setMobileNav(false);


};









return (


<div
  className="
    min-h-screen
    px-4 md:px-6 py-6
    bg-slate-50
  "
>


<div
  className="
    max-w-[1400px]
    space-y-6 mx-auto
  "
>



{/* HEADER */}

<SettingsHeader/>





{/* MOBILE NAV BUTTON */}



<button

onClick={()=>
setMobileNav(true)
}


className="

xl:hidden

flex

items-center

justify-between

w-full

px-5

py-4


bg-white

border

border-slate-200

rounded-2xl


shadow-sm

"

>


<div
  className="
    text-left
  "
>

<p
  className="
    text-slate-400 text-xs uppercase tracking-wide
  "
>

Current Section

</p>


<p
  className="
    font-semibold capitalize
  "
>

{activeTab}

</p>


</div>




<Menu
size={20}
/>


</button>








{/* MAIN AREA */}


<div
  className="
    grid grid-cols-1 xl:grid-cols-[320px_1fr]
    gap-6
  "
>



{/* DESKTOP NAV */}


<div
  className="
    hidden xl:block
  "
>

<div
  className="
    top-6 sticky
  "
>


<SettingsNav

activeTab={activeTab}

onNavigate={handleNavigate}

/>


</div>


</div>








{/* CONTENT */}



<motion
  .main

initial={{
opacity:0,
y:10
}}


animate={{
opacity:1,
y:0
}}



transition={{
duration:.25
}}
  className="
    min-w-0
  "
>



<div
  className="
    overflow-hidden
    bg-white
    border border-slate-200 rounded-3xl
    shadow-sm
  "
>


<div
  className="
    p-5 md:p-8
  "
>


<Outlet/>


</div>


</div>



</motion.main>





</div>







</div>



{/* MOBILE DRAWER */}



<AnimatePresence>


{
mobileNav &&

<>



<motion.div

initial={{
opacity:0
}}

animate={{
opacity:1
}}

exit={{
opacity:0
}}


onClick={()=>
setMobileNav(false)
}


className="
fixed

inset-0

bg-black/40

backdrop-blur-sm

z-40

xl:hidden

"

/>






<motion
  .aside

initial={{
x:"-100%"
}}


animate={{
x:0
}}


exit={{
x:"-100%"
}}


transition={{
type:"spring",
stiffness:260,
damping:25
}}
  className="
    xl:hidden top-0 bottom-0 left-0 z-50 fixed overflow-y-auto
    w-[88%] max-w-sm
    bg-white
    shadow-2xl
  "
>


<div
  className="
    flex justify-between items-center
    p-5
    border-slate-200 border-b
  "
>


<h3
  className="
    font-bold text-lg
  "
>

Settings

</h3>



<button

onClick={()=>
setMobileNav(false)
}


className="
p-2

rounded-xl

hover:bg-slate-100

"

>


<X size={20}/>


</button>


</div>





<div
  className="
    p-5
  "
>

<SettingsNav

activeTab={activeTab}

onNavigate={handleNavigate}

/>


</div>




</motion.aside>



</>


}



</AnimatePresence>



</div>



);

};


export default Settings;