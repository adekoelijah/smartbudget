import {
  Mail,
  CalendarDays,
  MapPin,
  ShieldCheck,
  Pencil,
} from "lucide-react";

import VerificationBadge from "./VerificationBadge";



const ProfileCard = ({
  user,
  onEdit,
  loading = false,
}) => {


const fullName =
`${user?.firstName ?? ""} ${user?.lastName ?? ""}`
.trim() || "SmartBudget User";



const initials =
fullName
.split(" ")
.filter(Boolean)
.map(
(name)=>name.charAt(0)
)
.slice(0,2)
.join("")
.toUpperCase();




const memberDate =
user?.createdAt
?
new Intl.DateTimeFormat(
"en-NG",
{
 year:"numeric",
 month:"long",
 day:"numeric",
}
).format(
new Date(user.createdAt)
)
:
"Recently joined";





return (

<section
  className="
    relative overflow-hidden
    bg-white
    border border-slate-200 rounded-3xl
    shadow-sm
  "
>


{/* HEADER */}

<div
  className="
    h-28
    bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900
  "
  /
>



<div
  className="
    relative
    px-6 pb-6
  "
>


{/* PROFILE HEADER */}


<div
  className="
    flex flex-col sm:flex-row sm:justify-between sm:items-end
    gap-5
  "
>



<div
  className="
    flex items-end
    gap-4 -mt-14
  "
>



{/* AVATAR */}

<div
  className="
    relative overflow-hidden
    w-24 h-24
    bg-white
    border-4 border-white rounded-3xl
    shadow-xl
    shrink-0
  "
>


{
user?.avatar

?

<img
src={user.avatar}
alt={fullName}
onError={(e)=>{
e.currentTarget.style.display="none";
}}
className="
w-full
h-full
object-cover
"
/>

:

<div
  className="
    flex justify-center items-center
    w-full h-full
    font-bold text-blue-700 text-2xl
    bg-blue-50
  "
>
{initials}
</div>

}



</div>





<div
  className="
    mb-1
  "
>


<div
  className="
    flex items-center
    gap-2
  "
>


<h2
  className="
    font-bold text-slate-900 text-xl
  "
>
{fullName}
</h2>



<VerificationBadge
type="verified"
size="sm"
/>



</div>



<p
  className="
    mt-1
    text-slate-500 text-sm
  "
>
SmartBudget Account
</p>


</div>



</div>






<button
  type="button"

onClick={onEdit}

disabled={loading}
  className="
    inline-flex justify-center items-center
    px-5 py-3
    font-semibold text-white text-sm
    bg-blue-600 hover:bg-blue-700
    rounded-2xl
    disabled:opacity-60 transition
    gap-2
  "
>


<Pencil size={16}/>


{
loading
?
"Opening..."
:
"Edit Profile"
}


</button>




</div>






{/* INFORMATION */}

<div
  className="
    grid grid-cols-1 md:grid-cols-2
    mt-8
    gap-4
  "
>


<InfoItem
icon={<Mail size={18}/>}
title="Email"
value={
user?.email ||
"Not available"
}
/>



<InfoItem
icon={<CalendarDays size={18}/>}
title="Member Since"
value={memberDate}
/>



<InfoItem
icon={<MapPin size={18}/>}
title="Location"
value={
user?.country ||
"Nigeria"
}
/>




<InfoItem
icon={<ShieldCheck size={18}/>}
title="Security"
value="Account Protected"
/>



</div>





{/* STATUS */}

<div
  className="
    flex justify-between items-center
    mt-6 p-4
    bg-slate-50
    border border-slate-200 rounded-2xl
  "
>


<div>


<p
  className="
    font-semibold text-slate-900 text-sm
  "
>
Account Status
</p>


<p
  className="
    mt-1
    text-slate-500 text-xs
  "
>
Your account is active and secured.
</p>


</div>



<div
  className="
    px-4 py-2
    font-semibold text-emerald-700 text-xs
    bg-emerald-100
    rounded-full
  "
>
Active
</div>



</div>




</div>


</section>

);


};





function InfoItem({
icon,
title,
value,
}) {


return (

<div
  className="
    flex items-center
    p-4
    border border-slate-200 rounded-2xl
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
  "
>

{icon}

</div>




<div
  className="
    min-w-0
  "
>


<p
  className="
    text-slate-500 text-xs
  "
>
{title}
</p>



<p
  className="
    mt-1
    font-semibold text-slate-900 text-sm truncate
  "
>
{value}
</p>



</div>



</div>

);


}


export default ProfileCard;