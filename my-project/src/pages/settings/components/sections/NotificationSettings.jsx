import {
  Bell,
  ShieldCheck,
  WalletCards,
  Mail,
  Smartphone,
  MessageSquare,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import SectionCard from "./components/SectionCard";
import SaveBar from "./components/SaveBar";





const defaultSettings = {

  financial: {

    spendingAlerts:true,

    budgetWarnings:true,

    billReminders:true,

    goalMilestones:true,

    weeklySummary:true,

  },


  security: {

    newLogin:true,

    passwordChanges:true,

    profileChanges:true,

    suspiciousActivity:true,

  },


  communication: {

    productUpdates:false,

    promotions:false,

  },


  channels: {

    email:true,

    push:true,

    sms:false,

  },


};









const NotificationSettings = ({
  user,
  onUpdate,
}) => {



const initialSettings =
useMemo(
()=>user?.notificationSettings
||
defaultSettings,

[user]
);






const [
settings,
setSettings
]=useState(initialSettings);






const [
saving,
setSaving
]=useState(false);



const [
error,
setError
]=useState(false);









useEffect(()=>{


setSettings(initialSettings);


},[
initialSettings
]);










const hasChanges =
JSON.stringify(settings)
!==
JSON.stringify(initialSettings);











const updateSetting = (
section,
key
)=>{


setSettings(prev=>({

...prev,

[section]:{

...prev[section],

[key]:
!prev[section][key]

}

}));


setError(false);


};











const handleSave = async()=>{


try{


setSaving(true);

setError(false);



await onUpdate?.(
settings
);



}

catch(error){


console.error(
"Notification update failed",
error
);


setError(true);


}

finally{


setSaving(false);


}


};










const handleCancel = ()=>{


setSettings(initialSettings);


};








return (

<SectionCard

icon={
<Bell size={22}/>
}

title="Notification Settings"

description="
Control how SmartBudget keeps you informed about your finances and account security.
"

>



<div
  className="
    space-y-8
  "
>





<NotificationGroup

title="Financial Alerts"

description="
Stay informed about your spending and financial progress.
"

icon={
<WalletCards size={20}/>
}

settings={settings.financial}

section="financial"

onChange={updateSetting}

/>









<NotificationGroup

title="Security Notifications"

description="
Important alerts that help protect your account.
"

icon={
<ShieldCheck size={20}/>
}

settings={settings.security}

section="security"

onChange={updateSetting}

/>









<NotificationGroup

title="Communication Preferences"

description="
Manage SmartBudget updates and announcements.
"

icon={
<MessageSquare size={20}/>
}

settings={settings.communication}

section="communication"

onChange={updateSetting}

/>









<NotificationGroup

title="Notification Channels"

description="
Choose where you want to receive notifications.
"

icon={
<Mail size={20}/>
}

settings={settings.channels}

section="channels"

onChange={updateSetting}

/>





</div>








<SaveBar

visible={
hasChanges
}

isSaving={saving}

hasError={error}

onSave={handleSave}

onCancel={handleCancel}

/>







</SectionCard>

);

};









function NotificationGroup({

title,
description,
icon,
settings,
section,
onChange,

}) {



return (

<div>





<div
  className="
    flex items-center
    mb-4
    gap-3
  "
>


<div
  className="
    flex justify-center items-center
    w-10 h-10
    text-blue-600
    bg-blue-50
    rounded-xl
  "
>

{icon}

</div>




<div>

<h4
  className="
    font-semibold text-slate-900 text-sm
  "
>

{title}

</h4>


<p
  className="
    mt-1
    text-slate-500 text-xs
  "
>

{description}

</p>


</div>


</div>








<div
  className="
    space-y-3
  "
>

{

Object.entries(settings)
.map(
([
key,
value
])=>(


<NotificationToggle

key={key}

label={
formatLabel(key)
}

checked={value}

onChange={()=>onChange(
section,
key
)}

/>


))

}



</div>



</div>

);

}









function NotificationToggle({

label,
checked,
onChange,

}) {



return (

<div
  className="
    flex justify-between items-center
    p-4
    hover:bg-slate-50
    border border-slate-200 rounded-2xl
    transition
  "
>



<div>


<p
  className="
    font-medium text-slate-800 text-sm
  "
>

{label}

</p>


<p
  className="
    mt-1
    text-slate-500 text-xs
  "
>

Receive alerts when this happens

</p>


</div>






<button

onClick={onChange}

className={`
relative
h-6
w-11
rounded-full
transition

${
checked
?
"bg-blue-600"
:
"bg-slate-300"
}

`}

>



<span

className={`
absolute
top-1
h-4
w-4
rounded-full
bg-white
transition

${
checked
?
"translate-x-6"
:
"translate-x-1"
}

`}

/>


</button>



</div>

);

}









function formatLabel(value){

return value

.replace(
/([A-Z])/g,
" $1"
)

.replace(
/^./,
char=>char.toUpperCase()
);

}

export default NotificationSettings;