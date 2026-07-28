import {
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  LogOut,
} from "lucide-react";





const DeviceSessionCard = ({
  session,
  onRevoke,
}) => {





const {

device,
deviceType,
browser,
location,
ipAddress,
lastActive,
current,
suspicious,

} = session;







return (

<div
  className="
    p-5
    bg-white
    border border-slate-200 hover:border-blue-200 rounded-2xl
    hover:shadow-sm transition
    group
  "
>



{/* HEADER */}


<div
  className="
    flex justify-between items-start
    gap-4
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
    text-slate-600
    bg-slate-100
    rounded-xl
  "
>


<DeviceIcon

type={deviceType}

/>


</div>






<div>


<div
  className="
    flex items-center
    gap-2
  "
>


<h4
  className="
    font-semibold text-slate-900 text-sm
  "
>

{device || "Unknown Device"}

</h4>





{

current && (

<span
  className="
    px-2.5 py-1
    font-medium text-emerald-600 text-xs
    bg-emerald-50
    rounded-full
  "
>

Current

</span>

)

}




{

suspicious && (

<AlertTriangle
  size={16}
  className="
    text-red-500
  "
  /
>

)

}


</div>





<p
  className="
    mt-1
    text-slate-500 text-xs
  "
>

{browser || "Unknown Browser"}

</p>



</div>



</div>








{

!current && (

<button

onClick={()=>
onRevoke?.(session)
}

className="
inline-flex
items-center
gap-2
rounded-xl
border
border-red-200
px-3
py-2
text-xs
font-medium
text-red-600
transition
hover:bg-red-50
"

>


<LogOut size={14}/>


Remove


</button>


)

}





</div>









{/* DETAILS */}



<div
  className="
    grid grid-cols-1 sm:grid-cols-2
    mt-5
    gap-3
  "
>


<SessionDetail

icon={
<MapPin size={15}/>
}

label="Location"

value={
location || "Unknown"
}

/>




<SessionDetail

icon={
<Clock size={15}/>
}

label="Last Active"

value={
formatDate(lastActive)
}

/>





<SessionDetail

icon={
<ShieldCheck size={15}/>
}

label="IP Address"

value={
ipAddress || "Hidden"
}

/>





<SessionDetail

icon={
<Monitor size={15}/>
}

label="Session Status"

value={
current
?
"Active now"
:
"Inactive"
}

/>



</div>









{/* SECURITY WARNING */}



{

suspicious && (

<div
  className="
    flex items-start
    mt-5 p-3
    bg-red-50
    border border-red-200 rounded-xl
    gap-3
  "
>


<AlertTriangle
  size={18}
  className="
    mt-0.5
    text-red-600
  "
  /
>



<div>


<p
  className="
    font-semibold text-red-700 text-sm
  "
>

Suspicious Activity Detected

</p>


<p
  className="
    mt-1
    text-red-600 text-xs
  "
>

Review this session immediately if you do not recognize this device.

</p>


</div>



</div>

)

}




</div>

);

};









function DeviceIcon({
type,
}){


switch(type){


case "mobile":

return <Smartphone size={20}/>;


case "tablet":

return <Tablet size={20}/>;


default:

return <Monitor size={20}/>;


}


}









function SessionDetail({
icon,
label,
value,
}){


return (

<div
  className="
    p-3
    bg-slate-50
    rounded-xl
  "
>


<div
  className="
    flex items-center
    text-slate-500 text-xs
    gap-2
  "
>

{icon}

<span>
{label}
</span>

</div>





<p
  className="
    mt-1
    font-medium text-slate-800 text-sm truncate
  "
>

{value}

</p>



</div>

);

}









function formatDate(date){


if(!date)
return "Unknown";



const formatted =
new Date(date);



return formatted.toLocaleString(
undefined,
{
dateStyle:"medium",
timeStyle:"short",
}
);


}






export default DeviceSessionCard;