import {
  Monitor,
  Smartphone,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  LogOut,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";


import SectionCard from "../common/SectionCard";

import LoadingSkeleton from "../common/LoadingSkeleton";

import EmptyState from "../common/EmptyState";

import ConfirmDialog from "../common/ConfirmDialog";
import DeviceSessionCard from "./DeviceSessionCard";





const LoginActivity = ({
  sessions = [],
  loading = false,
  onLogoutSession,
  onLogoutAll,
}) => {



const [
selectedSession,
setSelectedSession
]=useState(null);



const [
showLogout,
setShowLogout
]=useState(false);






if(loading){


return (

<SectionCard

title="Login Activity"

description="
Monitor devices and sessions connected to your account.
"

>

<LoadingSkeleton
variant="list"
/>

</SectionCard>

);


}









if(!sessions.length){


return (

<SectionCard

title="Login Activity"

description="
Monitor devices and sessions connected to your account.
"

>


<EmptyState

icon={
<ShieldCheck size={30}/>
}

title="No login activity"

description="
Your recent account access history will appear here.
"

/>


</SectionCard>

);


}









const currentSession =
sessions.find(
(session)=>session.current
);







return (

<SectionCard

title="Login Activity"

description="
Review where and when your SmartBudget account was accessed.
"

icon={
<ShieldCheck size={22}/>
}

>





<div
  className="
    space-y-6
  "
>





{/* Current Session */}


{
currentSession && (

<CurrentSession

session={currentSession}

/>

)

}








{/* Activity List */}


<div>

<h4
  className="
    mb-4
    font-semibold text-slate-900 text-sm
  "
>

Recent Login History

</h4>




<div
  className="
    space-y-3
  "
>


{

sessions.map((session)=>(

<DeviceSessionCard

session={session}

onRevoke={onLogoutSession}

/>

))

}



</div>


</div>






{/* Logout All */}


<button

onClick={()=>{


setSelectedSession(
"all"
);


setShowLogout(true);


}}

className="
inline-flex
items-center
gap-2
rounded-xl
border
border-red-200
px-4
py-2.5
text-sm
font-medium
text-red-600
hover:bg-red-50
transition
"

>

<LogOut size={16}/>

Logout All Devices

</button>







</div>









<ConfirmDialog

isOpen={showLogout}

title={
selectedSession === "all"

?
"Logout All Devices?"

:
"Logout This Device?"

}

description={

selectedSession === "all"

?

"All active sessions except your current device will be terminated."

:

"This device session will be removed from your account."

}



confirmText="Confirm Logout"

variant="danger"

onConfirm={async()=>{


if(selectedSession==="all"){

await onLogoutAll?.();

}

else {


await onLogoutSession?.(
selectedSession.id
);

}


setShowLogout(false);


}}


onCancel={()=>
setShowLogout(false)
}

/>






</SectionCard>

);

};









function CurrentSession({
session,
}){


return (

<div
  className="
    p-5
    bg-blue-50
    border border-blue-200 rounded-2xl
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
    gap-3
  "
>


<div
  className="
    flex justify-center items-center
    w-11 h-11
    text-blue-600
    bg-white
    rounded-xl
  "
>


<ShieldCheck size={22}/>


</div>





<div>

<h4
  className="
    font-semibold text-slate-900 text-sm
  "
>

Current Session

</h4>


<p
  className="
    text-slate-500 text-xs
  "
>

This device is currently active

</p>


</div>



</div>



<span
  className="
    font-medium text-emerald-600 text-xs
  "
>

Active

</span>



</div>





<div
  className="
    grid grid-cols-1 sm:grid-cols-3
    mt-4
    gap-3
  "
>


<InfoItem

icon={<Monitor size={15}/>}

text={session.device}

/>


<InfoItem

icon={<MapPin size={15}/>}

text={session.location}

/>


<InfoItem

icon={<Clock size={15}/>}

text={formatDate(session.time)}

/>


</div>



</div>

);

}









function LoginSessionCard({

session,

onLogout,

}){


return (

<div
  className="
    flex justify-between items-center
    p-4
    border border-slate-200 rounded-2xl
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
    w-10 h-10
    text-slate-600
    bg-slate-100
    rounded-xl
  "
>


{

session.deviceType==="mobile"

?

<Smartphone size={18}/>

:

<Monitor size={18}/>

}


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

{session.device}

</h4>



{

session.suspicious && (

<AlertTriangle
  size={15}
  className="
    text-red-500
  "
  /
>

)

}


</div>




<div
  className="
    flex flex-wrap
    mt-1
    text-slate-500 text-xs
    gap-3
  "
>


<span>

{session.location}

</span>


<span>

{formatDate(session.time)}

</span>


</div>




</div>



</div>






{

!session.current && (

<button
  onClick={onLogout}
  className="
    font-medium text-red-600 hover:text-red-700 text-sm
  "
>

Remove

</button>

)

}



</div>

);

}









function InfoItem({
icon,
text,
}){


return (

<div
  className="
    flex items-center
    text-slate-600 text-xs
    gap-2
  "
>

{icon}

<span>
{text || "Unknown"}
</span>

</div>

);

}









function formatDate(date){


if(!date)
return "Unknown";


return new Date(date)
.toLocaleString();

}






export default LoginActivity;