import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";


import {
  useUser,
} from "../../../context/UserContext";





const createProfileState = (user)=>({

  firstName:
    user?.firstName || "",


  lastName:
    user?.lastName || "",


  email:
    user?.email || "",


  phone:
    user?.phone || "",


  country:
    user?.country || "",


  dateOfBirth:
    user?.dateOfBirth || "",


  avatar:
    user?.avatar || "",

});








export const useProfileSettings = ()=>{



const {

user,

loading,

updateProfile,

}=useUser();







const initialProfile = useMemo(

()=>createProfileState(user),

[user]

);







const [
profile,
setProfile
]=useState(
initialProfile
);






const [
preview,
setPreview
]=useState(null);





const [
saving,
setSaving
]=useState(false);





const [
uploading,
setUploading
]=useState(false);





const [
message,
setMessage
]=useState("");





const [
error,
setError
]=useState("");









/*
====================================
SYNC PROFILE WHEN USER CHANGES
====================================
*/


useEffect(()=>{


setProfile(initialProfile);


},[
initialProfile
]);









/*
====================================
DIRTY STATE
====================================
*/


const isDirty = useMemo(()=>{


return Object.keys(profile)
.some(
(key)=>
profile[key] !== initialProfile[key]
);


},[
profile,
initialProfile
]);









/*
====================================
UPDATE LOCAL FIELD
====================================
*/


const updateField = useCallback(
(key,value)=>{


setProfile(prev=>({

...prev,

[key]:value,

}));


setError("");


},
[]
);









/*
====================================
SAVE PROFILE
====================================
*/


const save = useCallback(

async()=>{


try{


setSaving(true);

setError("");

setMessage("");



const response =
await updateProfile(profile);





if(!response?.success){

throw new Error(
response?.message ||
"Profile update failed"
);

}




setMessage(
"Profile updated successfully"
);





return response;




}

catch(error){


console.error(
"PROFILE_SAVE_ERROR:",
error
);



setError(
error.message ||
"Unable to update profile"
);



return {

success:false

};



}

finally{


setSaving(false);


}



},

[
profile,
updateProfile
]

);









/*
====================================
AVATAR PREVIEW
====================================
*/


const setAvatar = useCallback(

async(file)=>{


if(!file) return;




try{


setUploading(true);

setError("");





if(preview){

URL.revokeObjectURL(preview);

}





const local =
URL.createObjectURL(file);



setPreview(local);





/*
Temporary local update.

Actual upload service
should be connected here.
*/


setProfile(prev=>({

...prev,

avatar:local

}));




return {

success:true

};



}

catch(error){


console.error(
"AVATAR_ERROR:",
error
);



setError(
"Unable to update profile photo"
);



return {

success:false

};



}

finally{


setUploading(false);


}



},

[
preview
]

);









/*
====================================
RESET FORM
====================================
*/


const reset = useCallback(()=>{


setProfile(
initialProfile
);



if(preview){

URL.revokeObjectURL(
preview
);

}



setPreview(null);

setError("");

setMessage("");



},[
initialProfile,
preview
]);









return {

profile,

preview,

loading,

saving,

uploading,

message,

error,

isDirty,


updateField,


setAvatar,


save,


reset,


};


};