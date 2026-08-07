import {
  ShieldCheck,
  Lock,
  Smartphone,
  Monitor,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
} from "lucide-react";

import {
  useState,
} from "react";


import SectionCard from "./components/SectionCard";
import ConfirmDialog from "./components/ConfirmDialog";


const SecuritySettings = ({
user = null,
  sessions = [],
  loading = {},
  message = "",
  error = "",
  onChangePassword,

  passwordForm,

  updatePasswordField,


  onEnable2FA,

  onDisable2FA,

  onVerify2FA,


  twoFactorEnabled,

  twoFactorSecret,


  onRevokeSession,

  onLogoutAll,


}) => {



const [
showPassword,
setShowPassword
]=useState(false);



const [
showEnable2FA,
setShowEnable2FA
]=useState(false);



const [
twoFactorCode,
setTwoFactorCode
]=useState("");



const [
showDisableDialog,
setShowDisableDialog
]=useState(false);



const [
showLogoutDialog,
setShowLogoutDialog
]=useState(false);


const securityScore =
calculateSecurityScore(user);


const passwordLoading = Boolean(loading?.password);


return (


<SectionCard

icon={
<ShieldCheck size={22}/>
}

title="Security Settings"

description="
Protect your SmartBudget account and manage your account security.
"

>


<div
  className="
    space-y-6
  "
>



{/* ===========================
MESSAGES
=========================== */}



{
error && (

<StatusMessage
type="error"
message={error}
/>

)

}



{
message && (

<StatusMessage
type="success"
message={message}
/>

)

}



{/* ===========================
SECURITY SCORE
=========================== */}



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
    text-slate-500 text-sm
  "
>
Security Score
</p>


<h2
  className="
    font-bold text-slate-900 text-3xl
  "
>

{securityScore}%

</h2>


</div>


<ShieldCheck
  size={40}
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









{/* ===========================
PASSWORD
=========================== */}



<SecurityCard

icon={
<Lock size={20}/>
}

title="Password"

description="
Update your password regularly to keep your account secure.
"

action={

<button

disabled={passwordLoading}

onClick={()=>
setShowPassword(
!showPassword
)
}

className="
security-button
">

{passwordLoading 
?
"Updating..."
:
"Change Password"
}


</button>

}

/>



{
showPassword && (

<div
  className="
    space-y-3 p-4
    border rounded-xl
  "
>


<PasswordInput

label="Current Password"

value={
passwordForm.currentPassword
}

onChange={
e=>
updatePasswordField(
"currentPassword",
e.target.value
)
}

/>



<PasswordInput

label="New Password"

value={
passwordForm.newPassword
}

onChange={
e=>
updatePasswordField(
"newPassword",
e.target.value
)
}/>



<PasswordInput

label="Confirm Password"

value={
passwordForm.confirmPassword
}

onChange={
e=>
updatePasswordField(
"confirmPassword",
e.target.value
)
}

/>
<button
  type="button"
  onClick={onChangePassword}
  disabled={passwordLoading}
  className="
    security-button
  "
>
  {loading.password ? "Saving..." : "Save Password"}
</button>


</div>

)

}


{/* ===========================
2FA
=========================== */}

<SecurityCard

icon={
<Smartphone size={20}/>
}

title="Two Factor Authentication"

description={

twoFactorEnabled

?

"Your account is protected with 2FA."

:

"Add an extra security layer."

}


badge={

twoFactorEnabled
?

<Badge>
Enabled
</Badge>

:

<Badge warning>
Disabled
</Badge>

}



action={

twoFactorEnabled

?

<button
onClick={()=>setShowDisableDialog(true)}
  className="security-button-danger"
  
>

Disable

</button>


:

<button
  onClick={async()=>{
await onEnable2FA();
setShowEnable2FA(true);
}}
  className="security-button"
>Enable</button>}/>

{showEnable2FA && twoFactorSecret &&
(
<div
  className="
    space-y-3 p-4
    border rounded-xl
  "
>
<p
  className="
    text-slate-600 text-sm
  "
>

Enter your authentication code to complete setup.

</p>


<input

value={twoFactorCode}

onChange={
e=>
setTwoFactorCode(
e.target.value
)
}

placeholder="123456"

className="
input
"

/>



<button

onClick={()=>{

onVerify2FA(
twoFactorCode
);

}}

className="
security-button
"

>

Verify

</button>


</div>

)

}


{/* ===========================
ACTIVE SESSIONS
=========================== */}



<div>


<div
  className="
    flex justify-between items-center
    mb-3
  "
>


<h3
  className="
    font-semibold text-slate-900
  "
>

Active Devices

</h3>



<button

onClick={()=>setShowLogoutDialog(true)
}

className="
text-sm
text-red-600
"

>

Logout all

</button>


</div>





{
sessions.length === 0

?

<p
  className="
    text-slate-500 text-sm
  "
>

No active sessions.

</p>


:

sessions.map(
(session)=>(

<DeviceCard

key={
session._id
}

session={session}

onRemove={
onRevokeSession
}

/>

)

)

}


</div>

</div>

<ConfirmDialog

isOpen={
showDisableDialog
}

title="
Disable Two-Factor Authentication?
"

description="
Your account will have reduced protection.
"

confirmText="Disable"

variant="warning"


onConfirm={()=>{

onDisable2FA();

setShowDisableDialog(false);

}}


onCancel={()=>{

setShowDisableDialog(false);

}}


/>





<ConfirmDialog

isOpen={
showLogoutDialog
}

title="
Logout all devices?
"

description="
All other active sessions will be terminated.
"

confirmText="Logout Devices"

variant="danger"


onConfirm={()=>{

onLogoutAll();

setShowLogoutDialog(false);

}}


onCancel={()=>{

setShowLogoutDialog(false);

}}


/>




</SectionCard>


);

};


/*
==================================================
SMALL COMPONENTS
==================================================
*/


function SecurityCard({
icon,
title,
description,
badge,
action,
}){

return (

<div
  className="
    flex flex-col sm:flex-row sm:justify-between sm:items-center
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
    font-semibold
  "
>
{title}
</h4>

{badge}

</div>


<p
  className="
    text-slate-500 text-sm
  "
>
{description}
</p>


</div>

</div>



<div
  className="
    shrink-0
  "
>
{action}
</div>


</div>

);

}






function DeviceCard({
session,
onRemove,
}){


return (

<div
  className="
    flex justify-between items-center
    p-4
    border rounded-xl
  "
>


<div
  className="
    flex
    gap-3
  "
>


<Monitor
size={22}
/>


<div>

<p
  className="
    font-medium
  "
>

{
session.device ||
"Unknown Device"
}

</p>


<p
  className="
    text-slate-500 text-xs
  "
>

{
session.ipAddress ||
"No IP"
}

</p>


</div>


</div>



<button

onClick={()=>onRemove(
session._id
)
}

className="
text-red-600
text-sm
"

>

Remove

</button>


</div>


);

}






function PasswordInput({
label,
value,
onChange,
}){


return (

<div>

<label
  className="
    font-medium text-sm
  "
>

{label}

</label>


<input
  type="password"

value={value}

onChange={onChange}
  className="
    w-full
    mt-1 px-3 py-2
    border rounded-xl
  "
  /
>


</div>

);

}


function Badge({
children,
warning
}){


return (

<span
className={`
px-2 py-1
rounded-full
text-xs
font-medium
${
warning
?
"bg-red-100 text-red-600"
:
"bg-green-100 text-green-600"
}
`}
>

{children}

</span>

);

}







function StatusMessage({
type,
message
}){


return (

<div

className={`
flex gap-2
items-center
p-3
rounded-xl
text-sm

${
type==="error"
?
"bg-red-50 text-red-600"
:
"bg-green-50 text-green-600"
}

`}

>


{
type==="error"

?

<AlertTriangle size={18}/>

:

<CheckCircle2 size={18}/>

}


{message}


</div>

);


}

function calculateSecurityScore(user){


let score=40;



if(user?.isEmailVerified)
score+=20;


if(user?.twoFactorEnabled)
score+=30;


if(user?.phoneVerified)
score+=10;

return Math.min(
score,
100
);

}

export default SecuritySettings;