import {
  CheckCircle2,
  CircleAlert,
  User,
  MailCheck,
  ShieldCheck,
  Phone,
  Target,
  Wallet,
  ArrowRight,
} from "lucide-react";



const ProfileCompletion = ({
  user,
  onAction,
}) => {



const completionItems = [

{
id:"photo",
title:"Profile Photo",
description:"Add a profile picture",
completed:Boolean(user?.avatar),
icon:<User size={18}/>,
action:"Upload Photo",
},


{
id:"personal",
title:"Personal Information",
description:"Complete your account details",
completed:
Boolean(
user?.firstName &&
user?.lastName &&
user?.country
),
icon:<User size={18}/>,
action:"Complete Profile",
},


{
id:"email",
title:"Email Verification",
description:"Verify your email address",
completed:Boolean(user?.emailVerified),
icon:<MailCheck size={18}/>,
action:"Verify Email",
},


{
id:"phone",
title:"Phone Verification",
description:"Secure your account with phone verification",
completed:Boolean(user?.phoneVerified),
icon:<Phone size={18}/>,
action:"Verify Phone",
},


{
id:"security",
title:"Security Setup",
description:"Enable stronger account protection",
completed:Boolean(user?.twoFactorEnabled),
icon:<ShieldCheck size={18}/>,
action:"Enable Security",
},


{
id:"budget",
title:"Create First Budget",
description:"Start tracking your finances",
completed:Boolean(user?.hasBudget),
icon:<Wallet size={18}/>,
action:"Create Budget",
},


{
id:"goal",
title:"Financial Goals",
description:"Define your savings targets",
completed:Boolean(user?.hasGoals),
icon:<Target size={18}/>,
action:"Add Goals",
},

];





const completedCount =
completionItems.filter(
(item)=>item.completed
).length;



const percentage = Math.round(
(completedCount / completionItems.length) * 100
);





return (

<section
  className="
    p-6
    bg-white
    border border-slate-200 rounded-3xl
    shadow-sm
  "
>


{/* Header */}

<div
  className="
    flex flex-col sm:flex-row sm:justify-between sm:items-center
    mb-6
    gap-4
  "
>


<div>

<h3
  className="
    font-semibold text-slate-900 text-lg
  "
>
Profile Completion
</h3>


<p
  className="
    mt-1
    text-slate-500 text-sm
  "
>
Complete your profile to unlock a smarter financial experience.
</p>

</div>




<div
  className="
    text-right
  "
>

<p
  className="
    font-bold text-blue-600 text-3xl
  "
>
{percentage}%
</p>


<p
  className="
    text-slate-500 text-xs
  "
>
Completed
</p>


</div>


</div>







{/* Progress Bar */}

<div
  className="
    overflow-hidden
    h-3
    mb-8
    bg-slate-100
    rounded-full
  "
>

<div
  className="
    h-full
    bg-blue-600
    rounded-full
    transition-all duration-500
  "
  style={{
width:`${percentage}%`
}}
/
>


</div>









{/* Completion Items */}

<div
  className="
    space-y-3
  "
>


{
completionItems.map((item)=>(

<CompletionItem

key={item.id}

item={item}

onAction={onAction}

/>

))

}


</div>





</section>

);

};









function CompletionItem({
item,
onAction,
}) {


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
className={`
h-10
w-10
rounded-xl
flex
items-center
justify-center

${
item.completed
?
"bg-emerald-50 text-emerald-600"
:
"bg-blue-50 text-blue-600"
}

`}
>

{item.icon}

</div>





<div>


<h4
  className="
    font-semibold text-slate-900 text-sm
  "
>
{item.title}
</h4>



<p
  className="
    mt-1
    text-slate-500 text-xs
  "
>
{item.description}
</p>


</div>


</div>





<div>

{

item.completed

?

<CheckCircle2
  size={22}
  className="
    text-emerald-600
  "
  /
>


:

<button

onClick={() =>
onAction?.(item.id)
}

className="
inline-flex
items-center
gap-1
rounded-xl
bg-blue-50
px-3
py-2
text-xs
font-medium
text-blue-700
hover:bg-blue-100
transition
"

>

{item.action}

<ArrowRight size={14}/>

</button>


}


</div>



</div>

);

}





export default ProfileCompletion;