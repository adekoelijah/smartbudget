

import {
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useState,
} from "react";

import { useUser, } from "../../../../context/useUser";



import {
  useProfileSettings,
} from "../../hooks/useProfileSettings";


import ProfileCard from "./components/ProfileCard";
import PersonalInformation from "./components/PersonalInformation";
import ProfileCompletion from "./components/ProfileCompletion";
import ChangePhotoModal from "./components/ChangePhotoModal";

import NotificationSettings from "./NotificationSettings";
import SecuritySettings from "./SecuritySettings";

import SectionCard from "./components/SectionCard";
import LoadingSkeleton from "./components/LoadingSkeleton";
import EmptyState from "./components/EmptyState";
import {useSecuritySettings } from "../../hooks/useSecuritySettings";







const ProfileSettings = ()=>{




/*
=====================================
GLOBAL USER STATE
=====================================
*/


const {

user,
  updateProfile,
  updatingProfile,

loading,

updateUserNotifications,

}=useUser();





/*
=====================================
PROFILE SETTINGS STATE
=====================================
*/


const {

profile,

preview,

uploading,

uploadAvatar,

}=useProfileSettings();



const {

sessions,

loading:securityLoading,

message:securityMessage,

error:securityError,

changePassword,


revokeSession,

logoutAllDevices,

enable2FA,

disable2FA,

}=useSecuritySettings(user);












const [
showPhotoModal,
setShowPhotoModal
]=useState(false);









/*
=====================================
LOADING STATE
=====================================
*/


if(loading){


return (

<div
  className="
    space-y-6
  "
>


<LoadingSkeleton
variant="profile"
/>


<LoadingSkeleton
variant="card"
/>


<LoadingSkeleton
variant="card"
/>


</div>

);


}









/*
=====================================
EMPTY USER STATE
=====================================
*/


if(!user){


return (

<EmptyState


icon={
<UserRound size={30}/>
}


title="Profile unavailable"



description="
We couldn't load your account information.
Please refresh and try again.
"



actionLabel="Reload"



onAction={()=>
window.location.reload()
}


/>

);


}









return (

<div
  className="
    space-y-6
  "
>









{/* =================================
PROFILE OVERVIEW
================================= */}



<SectionCard


icon={
<UserRound size={22}/>
}


title="Profile Overview"


description="
Manage your identity, account details, and financial preferences.
"


>


<ProfileCard


user={user}


onChangePhoto={()=>
setShowPhotoModal(true)
}


/>


</SectionCard>









{/* =================================
PROFILE COMPLETION
================================= */}



<SectionCard


title="Profile Completion"


description="
Complete your profile to unlock a smarter financial experience.
"


>


<ProfileCompletion


user={user}


onAction={(action)=>{

console.log(
"Profile action:",
action
);

}}


/>


</SectionCard>









{/* =================================
PERSONAL INFORMATION
================================= */}



<SectionCard


icon={
<UserRound size={22}/>
}


title="Personal Information"


description="
Update your personal account information securely.
"


>


<PersonalInformation

user={user}

onUpdate={updateProfile}

isSaving={updatingProfile}


/>


</SectionCard>









{/* =================================
SECURITY
================================= */}

<SecuritySettings

user={user}

sessions={sessions}

loadingSessions={
securityLoading.sessions
}

message={
securityMessage
}

error={
securityError
}


onChangePassword={
changePassword
}


onEnable2FA={
enable2FA
}


onDisable2FA={
disable2FA
}


onLogoutSession={
revokeSession
}


onLogoutAll={
logoutAllDevices
}


/>









{/* =================================
NOTIFICATIONS
================================= */}



<NotificationSettings


user={user}


onUpdate={
updateUserNotifications
}


/>









{/* =================================
PROFILE PHOTO
================================= */}



<ChangePhotoModal


open={showPhotoModal}



currentImage={

preview ||

profile?.avatar ||

user?.avatar

}



loading={uploading}



onClose={()=>{

setShowPhotoModal(false);

}}



onUpload={async(file)=>{


const response =
await uploadAvatar(file);



if(response?.success){


setShowPhotoModal(false);


}



}}


/>


</div>

);


};





export default ProfileSettings;