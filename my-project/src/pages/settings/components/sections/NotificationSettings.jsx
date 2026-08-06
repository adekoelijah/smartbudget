import {
  Bell,
  ShieldCheck,
  WalletCards,
  MessageSquare,
  Mail,
  Smartphone,
  Save,
  RotateCcw,
} from "lucide-react";


import {
  useEffect,
  useMemo,
  useState,
} from "react";


import SectionCard from "./components/SectionCard";
import NotificationGroup from "./components/NotificationGroup";
import SaveBar from "./components/SaveBar";


import {
  useNotifications,
} from "../../../../context/NotificationContext";





/*
==================================================
DEFAULT SETTINGS
==================================================
*/

const defaultSettings = {

financial:{

spendingAlerts:true,

budgetWarnings:true,

billReminders:true,

goalMilestones:true,

weeklySummary:true,

},


security:{

newLogin:true,

passwordChanges:true,

profileChanges:true,

suspiciousActivity:true,

},


communication:{

productUpdates:false,

promotions:false,

},


channels:{

email:true,

push:true,

sms:false,

},

};









/*
==================================================
COMPONENT
==================================================
*/


const NotificationSettings = ()=>{


const {

notificationSettings,

updateNotificationSettings,

loading,

error,

} = useNotifications();







const initialSettings =
useMemo(()=>{


return (

notificationSettings
||
defaultSettings

);


},[
notificationSettings
]);







const [
settings,
setSettings
]=useState(
initialSettings
);




const [
saving,
setSaving
]=useState(false);




const [
success,
setSuccess
]=useState(false);






useEffect(()=>{


setSettings(
initialSettings
);


},[
initialSettings
]);








/*
==================================================
CHANGE DETECTION
==================================================
*/


const hasChanges =
JSON.stringify(settings)
!==
JSON.stringify(initialSettings);









/*
==================================================
UPDATE VALUE
==================================================
*/


const updateSetting = (
section,
key
)=>{


setSuccess(false);


setSettings(prev=>({

...prev,


[section]:{


...prev[section],


[key]:
!prev[section][key]


}

}));


};









/*
==================================================
SAVE
==================================================
*/


const handleSave =
async()=>{


try{


setSaving(true);

setSuccess(false);



await updateNotificationSettings(
settings
);



setSuccess(true);



}

catch(error){


console.error(
"NOTIFICATION_SETTINGS_SAVE_ERROR:",
error
);


}

finally{


setSaving(false);


}



};









/*
==================================================
RESET
==================================================
*/


const handleReset = ()=>{


setSettings(
initialSettings
);


setSuccess(false);


};









return (

<div
  className="
    space-y-6
  "
>





{/* HEADER */}

<SectionCard

icon={
<Bell size={22}/>
}

title="Notification Preferences"

description="
Control how SmartBudget communicates with you about transactions, security, budgets, and account activity.
"

/>










{/* FINANCIAL */}

<div
  className="
    p-6
    bg-white
    border border-slate-200 rounded-3xl
    shadow-sm
  "
>


<NotificationGroup

title="Financial Alerts"

description="
Receive important updates about your money activity.
"

icon={
<WalletCards size={20}/>
}

section="financial"

settings={
settings.financial
}

onChange={
updateSetting
}

/>


</div>










{/* SECURITY */}

<div
  className="
    p-6
    bg-white
    border border-slate-200 rounded-3xl
    shadow-sm
  "
>


<NotificationGroup

title="Security Notifications"

description="
Protect your account with important security alerts.
"

icon={
<ShieldCheck size={20}/>
}

section="security"

settings={
settings.security
}

onChange={
updateSetting
}

/>


</div>











{/* COMMUNICATION */}

<div
  className="
    p-6
    bg-white
    border border-slate-200 rounded-3xl
    shadow-sm
  "
>


<NotificationGroup

title="Communication Preferences"

description="
Manage SmartBudget updates and product information.
"

icon={
<MessageSquare size={20}/>
}

section="communication"

settings={
settings.communication
}

onChange={
updateSetting
}

/>


</div>









{/* CHANNELS */}

<div
  className="
    p-6
    bg-white
    border border-slate-200 rounded-3xl
    shadow-sm
  "
>


<NotificationGroup

title="Delivery Channels"

description="
Choose where you want to receive notifications.
"

icon={
<Mail size={20}/>
}

section="channels"

settings={
settings.channels
}

onChange={
updateSetting
}

/>



</div>









{/* STATUS */}

{

success && (

<div
  className="
    px-4 py-3
    font-medium text-emerald-700 text-sm
    bg-emerald-50
    border border-emerald-200 rounded-2xl
  "
>

Notification preferences updated successfully.

</div>

)

}







{

error && (

<div
  className="
    px-4 py-3
    font-medium text-red-700 text-sm
    bg-red-50
    border border-red-200 rounded-2xl
  "
>

{
error
}

</div>

)

}









{/* ACTION BAR */}

{

hasChanges && (

<div
  className="
    flex justify-end
    gap-3
  "
>


<button
  onClick={handleReset}

disabled={saving}
  className="
    inline-flex items-center
    px-5 py-3
    font-medium text-slate-700 text-sm
    bg-white hover:bg-slate-50
    border border-slate-200 rounded-2xl
    transition
    gap-2
  "
>

<RotateCcw size={16}/>

Reset

</button>





<button
  onClick={handleSave}

disabled={saving}
  className="
    inline-flex items-center
    px-6 py-3
    font-semibold text-white text-sm
    bg-slate-900 hover:bg-black
    rounded-2xl
    disabled:opacity-60 transition
    gap-2
  "
>

<Save size={17}/>


{
saving
?
"Saving..."
:
"Save Preferences"
}


</button>




</div>

)

}






</div>

);


};



export default NotificationSettings;