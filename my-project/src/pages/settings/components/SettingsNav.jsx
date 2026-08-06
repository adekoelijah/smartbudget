import {
memo,
useMemo,
} from "react";


import {
LockKeyhole,
ShieldCheck,
} from "lucide-react";


import {
motion
} from "framer-motion";




import {SETTINGS_NAVIGATION} from "../components/sections/components/settingsNavigation";



const SettingsNav = ({
activeTab,
onNavigate,
})=>{


const groups = useMemo(()=>{


return SETTINGS_NAVIGATION.reduce(
(acc,item)=>{


if(!acc[item.category]){
acc[item.category]=[];
}


acc[item.category].push(item);


return acc;


},{}

);


},[]);



return (


<aside
  className="
    lg:top-6 lg:sticky overflow-hidden
    w-full lg:w-[300px]
    bg-white
    border border-slate-200 rounded-3xl
    shadow-[0_20px_50px_rgba(15,23,42,.08)]
  "
>


{/* HEADER */}


<div
  className="
    relative
    p-6
    text-white
    bg-slate-950
  "
>


<div>


<p
  className="
    font-semibold text-[11px] text-slate-400 uppercase tracking-[0.25em]
  "
>

SMARTBUDGET

</p>



<h2
  className="
    mt-2
    font-bold text-xl
  "
>

Settings

</h2>


<p
  className="
    mt-2
    text-slate-400 text-sm
  "
>

Manage your financial workspace.

</p>


</div>



<div
  className="
    top-5 right-5 absolute flex items-center
    px-3 py-1.5
    bg-emerald-500/10
    border border-emerald-400/20 rounded-full
    gap-2
  "
>


<span
  className="
    w-2 h-2
    bg-emerald-400
    rounded-full
  "
  /
>


<span
  className="
    font-semibold text-emerald-300 text-xs
  "
>

Secure

</span>


</div>


</div>





{/* NAVIGATION */}



<nav
  className="
    space-y-6 p-4
  "
>


{
Object.entries(groups)
.map(
([
category,
items
])=>(


<div
key={category}
>


<p
  className="
    mb-2 px-3
    font-bold text-[11px] text-slate-400 uppercase tracking-wider
  "
>

{category}

</p>



<div
  className="
    space-y-2
  "
>


{
items.map(item=>{


const Icon=item.icon;


const active =
activeTab===item.id;



return (


<motion.button

key={item.id}

onClick={()=>
onNavigate?.(item.id)
}


whileTap={{
scale:.98
}}



aria-current={
active
?
"page"
:
undefined
}



className={`
relative

flex
items-center

w-full

gap-3

px-3
py-3

rounded-2xl

transition-all


focus:outline-none

focus:ring-2
focus:ring-blue-500



${
active

?

`
bg-slate-950
text-white

shadow-lg

`

:

`

text-slate-700

hover:bg-slate-50

`

}

`}


>


{
active &&

<span
  className="
    left-0 absolute
    w-1 h-8
    bg-blue-500
    rounded-r-full
  "
  /
>

}




<div

className={`
flex
items-center
justify-center

w-10
h-10

rounded-xl


${
active

?
"bg-white/10"

:
"bg-slate-100"

}

`}

>

<Icon size={18}/>

</div>




<div
  className="
    text-left
  "
>

<p
  className="
    font-semibold text-sm
  "
>

{item.label}

</p>


<p

className={`
text-xs
mt-0.5


${
active

?
"text-slate-300"

:
"text-slate-500"

}

`}

>

{item.description}

</p>


</div>



</motion.button>


);


})

}



</div>


</div>


))


}


</nav>






{/* SECURITY FOOTER */}



<div
  className="
    p-5
    bg-slate-50
    border-slate-200 border-t
  "
>


<div
  className="
    flex items-center
    gap-3
  "
>


<div
  className="
    flex justify-center items-center
    w-11 h-11
    bg-emerald-50
    rounded-xl
  "
>

<ShieldCheck
  size={22}
  className="
    text-emerald-600
  "
  /
>


</div>




<div>


<p
  className="
    text-slate-500 text-xs
  "
>

Security Status

</p>


<p
  className="
    font-semibold text-slate-900 text-sm
  "
>

Protected

</p>


</div>



</div>


</div>



</aside>


);

};


export default memo(SettingsNav);