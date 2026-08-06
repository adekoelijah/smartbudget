import {
  BellOff,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";



/*
==================================================
NOTIFICATION EMPTY STATE
==================================================
*/


const NotificationEmptyState = ({
  title = "You're all caught up",
  description = 
    "No new notifications. We'll let you know when something important happens.",
  onRefresh,
  showRefresh = false,
}) => {


return (

<div
  className="
    flex flex-col justify-center items-center
    px-6 py-12
    text-center
  "
>


{/* ICON */}

<div
  className="
    relative flex justify-center items-center
    w-20 h-20
    bg-slate-100
    rounded-3xl
  "
>

<div
  className="
    flex justify-center items-center
    w-12 h-12
    text-slate-500
    bg-white
    rounded-2xl
    shadow-sm
  "
>

<BellOff size={24}/>

</div>



<div
  className="
    right-1 bottom-1 absolute flex justify-center items-center
    w-6 h-6
    text-emerald-600
    bg-emerald-50
    border border-white rounded-full
  "
>

<ShieldCheck size={13}/>

</div>


</div>





{/* TEXT */}

<h3
  className="
    mt-5
    font-semibold text-slate-900 text-base
  "
>

{title}

</h3>





<p
  className="
    max-w-xs
    mt-2
    text-slate-500 text-sm leading-relaxed
  "
>

{description}

</p>







{/* ACTION */}

{

showRefresh && (

<button
  type="button"

onClick={onRefresh}
  className="
    inline-flex justify-center items-center
    mt-5 px-4 py-2.5
    font-medium text-blue-600 text-sm
    bg-blue-50 hover:bg-blue-100
    rounded-xl
    transition
    gap-2
  "
>

<RefreshCcw size={16}/>

Refresh

</button>

)

}





</div>

);


};



export default NotificationEmptyState;