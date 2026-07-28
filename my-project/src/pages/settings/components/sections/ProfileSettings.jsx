import {
  Camera,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useUser,
} from "../../context/UserContext";


import {
  useProfileSettings,
} from "../../hooks/profile/useProfileSettings";



import ProfileCard from "../../components/profile/ProfileCard";

import PersonalInformation from "../../components/profile/PersonalInformation";

import ProfileCompletion from "../../components/profile/ProfileCompletion";

import SecurityOverview from "../../components/profile/SecurityOverview";

import ChangePhotoModal from "../../components/profile/ChangePhotoModal";
import NotificationSettings from "../../components/profile/NotificationSettings";
import SecuritySettings from "../../components/profile/SecuritySettings";




import SectionCard from "../../components/common/SectionCard";

import LoadingSkeleton from "../../components/common/LoadingSkeleton";

import EmptyState from "../../components/common/EmptyState";



const ProfileSettings = () => {




const {
  user,
  loading,
  updateNotificationSettings,
} = useUser();






const {
  profile,
  preview,
  uploading,
  setAvatar,
  save,

} =
useProfileSettings();







const [
showPhotoModal,
setShowPhotoModal
]=useState(false);









/*
====================================
LOADING STATE
====================================
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
====================================
EMPTY STATE
====================================
*/


if(!user){


return (

<EmptyState

icon={
<UserRound size={30}/>
}

title="Profile unavailable"

description="
We couldn't load your account information. Please refresh and try again.
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





{/* ===========================
PROFILE HEADER
=========================== */}



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








{/* ===========================
PROFILE COMPLETION
=========================== */}


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









{/* ===========================
PERSONAL INFORMATION
=========================== */}



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


user={profile}


onUpdate={save}


/>


</SectionCard>









{/* ===========================
SECURITY
=========================== */}



<SectionCard

icon={
<ShieldCheck size={22}/>
}

title="Security Overview"

description="
Monitor your account protection and security status.
"

>


<SecuritySettings

user={user}

onChangePassword={()=>
console.log("password")
}

onEnable2FA={()=>
console.log("enable 2FA")
}

onDisable2FA={()=>
console.log("disable 2FA")
}

onLogoutDevices={()=>
console.log("logout devices")
}

/>


</SectionCard>


{/* ===========================
CHANGE PHOTO MODAL
=========================== */}



<ChangePhotoModal


open={showPhotoModal}


currentImage={
preview ||
profile.avatar
}


loading={uploading}


onClose={()=>setShowPhotoModal(false)}



onUpload={async(file)=>{


await setAvatar(file);


setShowPhotoModal(false);


}}


/>
<NotificationSettings

user={user}

onUpdate={
updateNotificationSettings
}

/>


</div>

);

};

export default ProfileSettings;