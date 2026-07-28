import {
  ShieldCheck,
  Lock,
  Smartphone,
  Monitor,
  LogOut,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import {
  useState,
} from "react";


import SectionCard from "../common/SectionCard";

import ConfirmDialog from "../common/ConfirmDialog";

import VerificationBadge from "./VerificationBadge";
import LoginActivity from "./LoginActivity";


const SecuritySettings = ({
  user,

  sessions = [],

  loadingSessions = false,

  onChangePassword,

  onEnable2FA,

  onDisable2FA,

  onLogoutSession,
  error,
  message,

  onLogoutAll,

}) => {



const [
showDisable2FA,
setShowDisable2FA
]=useState(false);



const [
showLogoutDialog,
setShowLogoutDialog
]=useState(false);


const securityScore =
calculateSecurityScore(user);


return (

<SectionCard

icon={
<ShieldCheck size={22}/>
}

title="Security Settings"

description="
Protect your SmartBudget account and manage your security preferences.
"

>

<div
  className="
    space-y-6
  "
>


{/* =========================
GLOBAL STATUS MESSAGES
========================= */}


{
error && (

<div
  className="
    flex items-center
    p-3
    text-red-600 text-sm
    bg-red-50
    border border-red-200 rounded-xl
    gap-2
  "
>

<AlertTriangle size={18}/>

{error}

</div>

)
}




{
message && (

<div
  className="
    flex items-center
    p-3
    text-emerald-600 text-sm
    bg-emerald-50
    border border-emerald-200 rounded-xl
    gap-2
  "
>

<CheckCircle2 size={18}/>

{message}

</div>

)
}






{/* Security Score */}

<div
  className="
    p-5
    bg-slate-50
    border border-slate-200 rounded-2xl
  "
>


<div
  className="
    flex justify-between items-center
  "
>


<div>

<p
  className="
    font-medium text-slate-600 text-sm
  "
>
Security Score
</p>


<h2
  className="
    mt-1
    font-bold text-slate-900 text-3xl
  "
>

{securityScore}%

</h2>


</div>




<ShieldCheck
  size={38}
  className="
    text-blue-600
  "
  /
>


</div>



<div
  className="
    overflow-hidden
    h-2
    mt-4
    bg-slate-200
    rounded-full
  "
>


<div
  className="
    h-full
    bg-blue-600
    rounded-full
  "
  style={{
width:`${securityScore}%`
}}

/
>


</div>


</div>


{/* Password */}


<SecurityItem

icon={
<Lock size={20}/>
}

title="Password"

description="
Use a strong password to protect your account.
"

actionLabel="Change Password"

onAction={onChangePassword}

/>


{/* Two Factor */}


<SecurityItem

icon={
<Smartphone size={20}/>
}

title="Two-Factor Authentication"

description={
user?.twoFactorEnabled

?
"Your account has additional protection enabled."

:
"Add an extra security layer to your account."
}

badge={

user?.twoFactorEnabled

?

<VerificationBadge

type="security"

size="sm"

/>

:

null

}


actionLabel={

user?.twoFactorEnabled

?
"Disable"
:
"Enable"

}


onAction={

user?.twoFactorEnabled

?

()=>setShowDisable2FA(true)

:

onEnable2FA

}


/>

{/* Login Activity */}


<LoginActivity

sessions={sessions}

loading={loadingSessions}

onLogoutSession={onLogoutSession}

onLogoutAll={onLogoutAll}

/>


{/* Logout Devices */}





</div>


<ConfirmDialog

isOpen={showDisable2FA}

title="Disable Two-Factor Authentication?"

description="
Your account will have reduced protection after disabling this security feature.
"

confirmText="Disable 2FA"

variant="warning"

onConfirm={async()=>{

await onDisable2FA?.();

setShowDisable2FA(false);

}}

onCancel={()=>setShowDisable2FA(false)}

/>


<ConfirmDialog

isOpen={showLogoutDialog}

title="Logout Other Devices?"

description="
All active sessions except this device will be signed out.
"

confirmText="Logout Devices"

variant="danger"

onConfirm={async()=>{

await onLogoutAll?.();

setShowLogoutDialog(false);

}}

onCancel={()=>setShowLogoutDialog(false)}

/>

</SectionCard>

);

};


function SecurityItem({

icon,
title,
description,
badge,
actionLabel,
onAction,

}){


return (

<div
  className="
    flex flex-col sm:flex-row justify-between sm:items-center
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
    text-blue-600
    bg-blue-50
    rounded-xl
  "
>

{icon}

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

{title}

</h4>


{badge}


</div>



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






<button
  onClick={onAction}
  className="
    px-4 py-2
    font-medium text-white text-sm
    bg-blue-600 hover:bg-blue-700
    rounded-xl
    transition
  "
>

{actionLabel}

</button>




</div>

);

}


function calculateSecurityScore(user){


let score = 40;


if(user?.emailVerified)
score +=20;


if(user?.phoneVerified)
score +=15;


if(user?.twoFactorEnabled)
score +=25;



return Math.min(score,100);


}

export default SecuritySettings;