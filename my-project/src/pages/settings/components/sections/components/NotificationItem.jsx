import {
  WalletCards,
  ShieldAlert,
  AlertTriangle,
  Target,
  Info,
  ArrowRight,
  Trash2,
  Check,
} from "lucide-react";




/*
==================================================
NOTIFICATION TYPE CONFIG
==================================================
*/


const notificationConfig = {

transaction:{
icon:WalletCards,
iconStyle:
"bg-blue-50 text-blue-600",
},

security:{
icon:ShieldAlert,
iconStyle:
"bg-red-50 text-red-600",
},

budget:{
icon:AlertTriangle,
iconStyle:
"bg-amber-50 text-amber-600",
},

goal:{
icon:Target,
iconStyle:
"bg-emerald-50 text-emerald-600",
},

system:{
icon:Info,
iconStyle:
"bg-slate-100 text-slate-600",
},

};






/*
==================================================
PRIORITY CONFIG
==================================================
*/


const priorityConfig = {

critical:
"border-red-200",

high:
"border-amber-200",

normal:
"border-slate-200",

};








/*
==================================================
COMPONENT
==================================================
*/


const NotificationItem = ({
notification,

onRead,

onDelete,

onAction,

})=>{



const config =
notificationConfig[
notification.type
]
||
notificationConfig.system;



const Icon =
config.icon;





const priority =
priorityConfig[
notification.priority
]
||
priorityConfig.normal;








const handleRead = ()=>{


if(
!notification.isRead
){

onRead?.(
notification._id
);

}


};








return (

<article

className={`

relative

p-4

border-b

transition

hover:bg-slate-50

${priority}

${

!notification.isRead

?

"bg-blue-50/40"

:

"bg-white"

}

`}

>






<div
  className="
    flex
    gap-3
  "
>








{/* ICON */}


<div

className={`

flex

justify-center

items-center

w-10

h-10

rounded-xl

shrink-0

${config.iconStyle}

`}

>

<Icon size={18}/>

</div>







{/* CONTENT */}


<div
  className="
    flex-1
    min-w-0
  "
>





<div
  className="
    flex justify-between items-start
    gap-3
  "
>


<div>


<h4
  className="
    font-semibold text-slate-900 text-sm leading-tight
  "
>

{notification.title}

</h4>


</div>





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
  aria-label="Unread notification"

/
>

)

}



</div>









<p
  className="
    mt-1
    text-slate-500 text-xs break-words leading-relaxed
  "
>

{notification.message}

</p>







{/* META */}

<div
  className="
    flex items-center
    mt-3
    gap-3
  "
>


<span
  className="
    text-[11px] text-slate-400
  "
>

{
formatDate(
notification.createdAt
)
}

</span>




{

notification.priority === "critical" && (

<span
  className="
    px-2 py-1
    font-medium text-[10px] text-red-600
    bg-red-50
    rounded-full
  "
>

Important

</span>

)

}


</div>








{/* ACTIONS */}

<div
  className="
    flex items-center
    mt-3
    gap-3
  "
>





{

notification.actionUrl && (

<button

type="button"

onClick={()=>{


handleRead();

onAction?.(
notification
);


}}

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

Open

<ArrowRight size={13}/>

</button>

)

}






{

!notification.isRead && (

<button
  type="button"

onClick={handleRead}
  className="
    inline-flex items-center
    font-medium text-slate-500 hover:text-slate-700 text-xs
    gap-1
  "
>

<Check size={13}/>

Mark read

</button>

)

}






<button

type="button"

onClick={()=>onDelete?.(
notification._id
)}

className="
inline-flex

items-center

font-medium

text-red-500

text-xs

hover:text-red-600

gap-1

"

>

<Trash2 size={13}/>

Delete

</button>







</div>







</div>






</div>





</article>

);


};







/*
==================================================
DATE FORMATTER
==================================================
*/


function formatDate(date){


if(!date){

return "";

}


return new Intl.DateTimeFormat(
undefined,
{

month:"short",

day:"numeric",

hour:"2-digit",

minute:"2-digit",

}

)
.format(
new Date(date)
);


}





export default NotificationItem;