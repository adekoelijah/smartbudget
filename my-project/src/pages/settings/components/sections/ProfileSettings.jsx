

import {
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useState,
} from "react";



import { useUser } from "../../../../context/UserContext"


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






const ProfileSettings = () => {



const {

user,

loading,

updateProfile,

updateNotificationSettings,

}=useUser();





const {

profile,

preview,

uploading,

setAvatar,

save,

}=useProfileSettings();






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







{/* PROFILE OVERVIEW */}


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









{/* PROFILE COMPLETION */}


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









{/* PERSONAL INFORMATION */}


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


user={profile || user}


onUpdate={updateProfile}


/>


</SectionCard>









{/* SECURITY */}


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


onChangePassword={()=>{

console.log(
"change password"
);

}}



onEnable2FA={()=>{

console.log(
"enable 2FA"
);

}}



onDisable2FA={()=>{

console.log(
"disable 2FA"
);

}}



onLogoutDevices={()=>{

console.log(
"logout devices"
);

}}


/>


</SectionCard>









{/* NOTIFICATIONS */}


<NotificationSettings


user={user}


onUpdate={
updateNotificationSettings
}


/>









{/* CHANGE PHOTO */}


<ChangePhotoModal


open={showPhotoModal}



currentImage={
preview ||
profile?.avatar ||
user?.avatar
}



loading={uploading}



onClose={()=>
setShowPhotoModal(false)
}




onUpload={async(file)=>{


await setAvatar(file);


setShowPhotoModal(false);


}}


/>



</div>

);


};



export default ProfileSettings;