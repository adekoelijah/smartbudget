import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";


import {
  getCurrentUser,
} from "../services/authService";


import {
  updateUserProfile,
  updateUserAvatar,
  updateNotificationSettings,
} from "../services/userService";



import {
  useAuth,
} from "../hooks/useAuth";





/*
=========================================
CONTEXT
=========================================
*/

export const UserContext = createContext(null);






/*
=========================================
STORAGE HELPERS
=========================================
*/


const USER_STORAGE_KEY = "user";



const getStoredUser = () => {

  try {

    const stored =
      localStorage.getItem(
        USER_STORAGE_KEY
      );


    return stored
      ? JSON.parse(stored)
      : null;


  } catch(error) {

    console.error(
      "GET_STORED_USER_ERROR:",
      error
    );


    return null;

  }

};





const saveUser = (user)=>{


  if(!user){

    localStorage.removeItem(
      USER_STORAGE_KEY
    );

    return;

  }



  localStorage.setItem(
    USER_STORAGE_KEY,
    JSON.stringify(user)
  );


};







/*
=========================================
ERROR HANDLER
=========================================
*/


const getErrorMessage = (error, fallback)=>{


return (
  error?.response?.data?.message ||
  error?.message ||
  fallback
);


};









/*
=========================================
USER PROVIDER
=========================================
*/


export const UserProvider = ({
  children,
})=>{


const {
  token,
}=useAuth();





const [
  user,
  setUser
]=useState(
  getStoredUser
);





const [
  loading,
  setLoading
]=useState(false);





const [
  updatingProfile,
  setUpdatingProfile
]=useState(false);





const [
  updatingAvatar,
  setUpdatingAvatar
]=useState(false);





const [
  error,
  setError
]=useState(null);










/*
=========================================
SET USER
Centralized state update
=========================================
*/


const setCurrentUser = useCallback(
(userData)=>{


setUser(
  userData
);


saveUser(
  userData
);


},
[]
);









/*
=========================================
FETCH CURRENT USER
=========================================
*/


const refreshUser = useCallback(
async()=>{


if(!token){

setCurrentUser(null);

return null;

}




try{


setLoading(true);

setError(null);



const response =
await getCurrentUser();



const currentUser =
response?.user ||
response?.data?.user ||
response;



setCurrentUser(
currentUser
);



return currentUser;



}
catch(error){


const message =
getErrorMessage(
  error,
  "Unable to load user profile"
);



console.error(
"REFRESH_USER_ERROR:",
error
);



setError(
message
);



setCurrentUser(null);



return null;


}
finally{


setLoading(false);


}



},
[
token,
setCurrentUser
]
);









/*
=========================================
INITIAL LOAD
=========================================
*/

useEffect(()=>{


let cancelled = false;



const loadUser = async()=>{


const result =
await refreshUser();



if(cancelled)
return;



return result;


};



loadUser();



return ()=>{

cancelled=true;

};


},[
refreshUser
]
);









/*
=========================================
UPDATE PROFILE
=========================================
*/


const updateProfile = useCallback(
async(profileData)=>{


try{


setUpdatingProfile(true);

setError(null);



const response =
await updateUserProfile(
profileData
);



const updatedUser =
response?.user ||
response?.data?.user ||
response;



setCurrentUser(
updatedUser
);



return {

success:true,

user:updatedUser,

};


}
catch(error){


const message =
getErrorMessage(
error,
"Profile update failed"
);



setError(
message
);



return {

success:false,

message,

};



}
finally{


setUpdatingProfile(false);


}



},
[
setCurrentUser
]
);









/*
=========================================
UPDATE AVATAR
=========================================
*/


const updateAvatar = useCallback(
async(file)=>{


try{


setUpdatingAvatar(true);

setError(null);



const formData =
new FormData();


formData.append(
"avatar",
file
);



const response =
await updateUserAvatar(
formData
);



const updatedUser =
response?.user ||
response?.data?.user ||
response;



setCurrentUser(
updatedUser
);



return {

success:true,

user:updatedUser,

};



}
catch(error){


const message =
getErrorMessage(
error,
"Avatar update failed"
);



setError(
message
);



return {

success:false,

message,

};



}
finally{


setUpdatingAvatar(false);


}



},
[
setCurrentUser
]
);









/*
=========================================
UPDATE NOTIFICATION SETTINGS
=========================================
*/


const updateNotifications =
useCallback(
async(settings)=>{


try{


setError(null);



const response =
await updateNotificationSettings(
settings
);



const updatedUser =
response?.user ||
response?.data?.user ||
response;



setCurrentUser(
updatedUser
);



return {

success:true,

user:updatedUser,

};



}
catch(error){


const message =
getErrorMessage(
error,
"Notification update failed"
);



setError(
message
);



return {

success:false,

message,

};


}



},
[
setCurrentUser
]
);









/*
=========================================
CLEAR USER
=========================================
*/


const clearUser = useCallback(()=>{


setCurrentUser(
null
);



},[
setCurrentUser
]);









/*
=========================================
MULTI TAB USER SYNC
=========================================
*/


useEffect(()=>{


const syncUser=(event)=>{


if(
event.key !== USER_STORAGE_KEY
)
return;



setUser(
event.newValue
?
JSON.parse(event.newValue)
:
null
);



};



window.addEventListener(
"storage",
syncUser
);



return ()=>{


window.removeEventListener(
"storage",
syncUser
);


};



},[]);









/*
=========================================
CONTEXT VALUE
=========================================
*/


const value = useMemo(()=>({


user,


loading,


updatingProfile,


updatingAvatar,


error,



refreshUser,


updateProfile,


updateAvatar,


updateNotifications,


clearUser,



}),
[
user,
loading,
updatingProfile,
updatingAvatar,
error,
refreshUser,
updateProfile,
updateAvatar,
updateNotifications,
clearUser,
]
);








return (

<UserContext.Provider
value={value}
>

{children}

</UserContext.Provider>

);


};