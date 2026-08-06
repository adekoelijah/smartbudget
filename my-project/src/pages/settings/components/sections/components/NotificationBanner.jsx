import {
  AlertTriangle,
  Bell,
  CheckCircle,
  ShieldAlert,
  WalletCards,
  X,
  ArrowRight,
} from "lucide-react";

import {
  useNotifications,
} from "../../context/NotificationContext";

import {
  useNavigate,
} from "react-router-dom";

import {
  useMemo,
  useState,
} from "react";




/*
==================================================
NOTIFICATION CONFIG
==================================================
*/


const notificationConfig = {

security:{
icon:ShieldAlert,

style:
"bg-red-50 border-red-200 text-red-700",

},

budget:{
icon:AlertTriangle,

style:
"bg-amber-50 border-amber-200 text-amber-700",

},

transaction:{
icon:WalletCards,

style:
"bg-blue-50 border-blue-200 text-blue-700",

},

goal:{
icon:CheckCircle,

style:
"bg-emerald-50 border-emerald-200 text-emerald-700",

},

system:{
icon:Bell,

style:
"bg-slate-50 border-slate-200 text-slate-700",

},

};






/*
==================================================
COMPONENT
==================================================
*/


const NotificationBanner = ()=>{


const navigate =
useNavigate();



const {

notifications,

readNotification,

} = useNotifications();





const [
dismissed,
setDismissed
]=useState([]);








/*
==================================================
FILTER IMPORTANT ALERTS
==================================================
*/


const alerts =
useMemo(()=>{


return notifications

.filter(item=>


!item.isRead &&

!dismissed.includes(
item._id
)

)

.filter(item=>

[
"critical",
"high"
]

.includes(
item.priority
)

)

.slice(0,3);



},[
notifications,
dismissed
]);







if(!alerts.length){

return null;

}








const handleDismiss =
(id)=>{


setDismissed(prev=>[

...prev,

id

]);


};








const handleAction =
async(notification)=>{


try{


await readNotification(
notification._id
);



if(notification.actionUrl){

navigate(
notification.actionUrl
);

}



}

catch(error){


console.error(
"NOTIFICATION_ACTION_ERROR:",
error
);


}


};








return (

<div
  className="
    top-4 right-4 z-50 fixed
    w-[calc(100%-2rem)] max-w-md
    space-y-3
  "
  aria-live="polite"
>





{

alerts.map(notification=>{


const config =
notificationConfig[
notification.type
]
||
notificationConfig.system;



const Icon =
config.icon;





return (

<div

key={
notification._id
}

className={`
relative

flex

p-4

border

rounded-2xl

shadow-lg

backdrop-blur-sm

gap-3

${config.style}

`}

>





<div
  className="
    flex justify-center items-center
    w-10 h-10
    bg-white/70
    rounded-xl
    shrink-0
  "
>

<Icon size={20}/>

</div>








<div
  className="
    flex-1
    min-w-0
  "
>



<h4
  className="
    font-semibold text-sm
  "
>

{
notification.title
}

</h4>





<p
  className="
    mt-1
    text-xs leading-relaxed
    opacity-80
  "
>

{
notification.message
}

</p>






{

notification.actionUrl && (

<button

onClick={()=>handleAction(notification)}

className="
inline-flex
items-center

mt-3

font-medium

text-xs

hover:underline

gap-1

"

>

View details

<ArrowRight size={14}/>

</button>

)

}



</div>








<button

onClick={()=>handleDismiss(notification._id)}

aria-label="Dismiss notification"

className="
flex

justify-center
items-center

w-8
h-8

hover:bg-black/5

rounded-lg

transition

"

>

<X size={16}/>

</button>








</div>


);


})

}





</div>

);


};




export default NotificationBanner;