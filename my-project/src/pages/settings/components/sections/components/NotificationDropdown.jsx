import {
  Bell,
  CheckCheck,
  Trash2,
  ArrowRight,
  WalletCards,
  ShieldAlert,
  AlertTriangle,
  Target,
  Info,
} from "lucide-react";


import {
  useNavigate,
} from "react-router-dom";


import {
  useNotifications,
} from "../../context/NotificationContext";


import {
  useMemo,
} from "react";









/*
==================================================
TYPE CONFIGURATION
==================================================
*/


const notificationIcons = {


transaction:
WalletCards,


security:
ShieldAlert,


budget:
AlertTriangle,


goal:
Target,


system:
Info,


};










/*
==================================================
COMPONENT
==================================================
*/


const NotificationDropdown = ({
onClose,
})=>{



const navigate =
useNavigate();



const {

notifications,

loading,

readNotification,

readAllNotifications,

removeNotification,

} =
useNotifications();









/*
==================================================
LATEST NOTIFICATIONS
==================================================
*/


const latestNotifications =
useMemo(()=>{


return notifications.slice(
0,
10
);


},[
notifications
]);










/*
==================================================
OPEN NOTIFICATION
==================================================
*/


const handleOpen =
async(notification)=>{


try{


if(!notification.isRead){

await readNotification(
notification._id
);

}



if(notification.actionUrl){

navigate(
notification.actionUrl
);


onClose?.();


}


}

catch(error){


console.error(
"OPEN_NOTIFICATION_ERROR:",
error
);


}



};









/*
==================================================
DATE FORMATTER
==================================================
*/


const formatDate =
(date)=>{


const value =
new Date(date);



return value.toLocaleDateString(
undefined,
{

month:"short",

day:"numeric",

hour:"2-digit",

minute:"2-digit",

}

);


};









return (

<div
  className="
    right-0 z-50 absolute overflow-hidden
    w-[360px] max-w-[calc(100vw-2rem)]
    mt-3
    bg-white
    border border-slate-200 rounded-3xl
    shadow-2xl
  "
>









{/* HEADER */}

<div
  className="
    flex justify-between items-center
    px-5 py-4
    border-slate-200 border-b
  "
>


<div>


<h3
  className="
    font-semibold text-slate-900 text-sm
  "
>

Notifications

</h3>



<p
  className="
    mt-1
    text-slate-500 text-xs
  "
>

Stay updated with your SmartBudget activity

</p>


</div>








<button
  onClick={readAllNotifications}
  className="
    inline-flex items-center
    px-3 py-2
    font-medium text-blue-600 text-xs
    hover:bg-blue-50
    rounded-xl
    transition
    gap-1
  "
>


<CheckCheck size={14}/>

Mark all

</button>






</div>









{/* CONTENT */}

<div
  className="
    overflow-y-auto
    max-h-[420px]
  "
>







{
loading ? (

<div
  className="
    p-6
    text-slate-500 text-sm text-center
  "
>

Loading notifications...

</div>


)

:

latestNotifications.length === 0 ? (

<div
  className="
    flex flex-col justify-center items-center
    p-8
    text-center
  "
>


<div
  className="
    flex justify-center items-center
    w-12 h-12
    bg-slate-100
    rounded-2xl
  "
>

<Bell size={22}/>

</div>




<p
  className="
    mt-3
    font-medium text-slate-900 text-sm
  "
>

No notifications

</p>




<p
  className="
    mt-1
    text-slate-500 text-xs
  "
>

You're all caught up.

</p>


</div>


)

:

latestNotifications.map(notification=>{


const Icon =
notificationIcons[
notification.type
]
||
Info;




return (

<div

key={
notification._id
}

className={`
group

p-4

border-b

border-slate-100

transition

hover:bg-slate-50

${

!notification.isRead

?

"bg-blue-50/40"

:

""

}

`}

>






<div
  className="
    flex
    gap-3
  "
>







<div
  className="
    flex justify-center items-center
    w-10 h-10
    text-slate-700
    bg-slate-100
    rounded-xl
    shrink-0
  "
>

<Icon size={18}/>

</div>









<div
  className="
    flex-1
    min-w-0
  "
>


<div
  className="
    flex justify-between
    gap-2
  "
>


<h4
  className="
    font-semibold text-slate-900 text-sm truncate
  "
>

{
notification.title
}

</h4>



{

!notification.isRead && (

<span
  className="
    w-2 h-2
    mt-1
    bg-blue-600
    rounded-full
    shrink-0
  "
  /
>

)

}


</div>






<p
  className="
    mt-1
    text-slate-500 text-xs leading-relaxed
  "
>

{
notification.message
}

</p>




<p
  className="
    mt-2
    text-[11px] text-slate-400
  "
>

{
formatDate(
notification.createdAt
)
}

</p>







<div
  className="
    flex items-center
    mt-3
    gap-2
  "
>


<button

onClick={()=>handleOpen(notification)}

className="
inline-flex
items-center

font-medium

text-blue-600

text-xs

hover:underline

gap-1

"

>

View

<ArrowRight size={13}/>

</button>





<button

onClick={()=>removeNotification(notification._id)}

className="
inline-flex
items-center

font-medium

text-red-500

text-xs

hover:underline

gap-1

"

>


<Trash2 size={13}/>

Delete

</button>



</div>








</div>





</div>





</div>

);


})

}







</div>










{/* FOOTER */}

<div
  className="
    p-4
    text-center
    border-slate-200 border-t
  "
>

<button
  className="
    font-medium text-blue-600 text-sm hover:underline
  "
>

View all notifications

</button>


</div>






</div>

);


};






export default NotificationDropdown;