import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";


import {
  getCurrentUser,
  updateUserProfile,
} from "../services/authService";


import { useAuth } from "./useAuth";



/*
=========================================
CONTEXT
=========================================
*/


const UserContext = createContext(null);





/*
=========================================
PROVIDER
=========================================
*/


export const UserProvider = ({
 children
})=>{


const {
 token
}=useAuth();





const [
user,
setUser
]=useState(null);



const [
loading,
setLoading
]=useState(true);



const [
error,
setError
]=useState(null);









/*
=========================================
FETCH CURRENT USER
=========================================
*/


const fetchUser = useCallback(
async()=>{


if(!token){

setUser(null);

setLoading(false);

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



setUser(currentUser);



localStorage.setItem(
"user",
JSON.stringify(currentUser)
);



return currentUser;



}catch(error){


console.error(
"FETCH_USER_ERROR:",
error
);



setError(
error?.response?.data?.message ||
"Unable to load user profile"
);



setUser(null);



return null;



}
finally{


setLoading(false);


}



},
[token]
);









/*
=========================================
INITIAL LOAD
=========================================
*/


useEffect(()=>{


fetchUser();


},[
fetchUser
]);









/*
=========================================
UPDATE PROFILE
=========================================
*/


const updateProfile = useCallback(
async(profileData)=>{


try{


setLoading(true);



const response =
await updateUserProfile(
profileData
);



const updatedUser =
response?.user ||
response?.data?.user ||
response;



setUser(updatedUser);



localStorage.setItem(
"user",
JSON.stringify(updatedUser)
);



return {

success:true,

user:updatedUser

};



}catch(error){


const message =
error?.response?.data?.message ||
"Profile update failed";



setError(message);



return {

success:false,

message

};



}
finally{


setLoading(false);


}


},
[]
);









/*
=========================================
UPDATE NOTIFICATION SETTINGS
=========================================
*/


const updateNotificationSettings =
useCallback(
async(settings)=>{


try{


const updatedUser = {

...user,

notificationSettings:
settings,

};



setUser(updatedUser);



localStorage.setItem(
"user",
JSON.stringify(updatedUser)
);



/*
Future API:
PUT /users/notifications
*/


return {

success:true

};



}catch(error){


console.error(
"NOTIFICATION_UPDATE_ERROR",
error
);



return {

success:false

};


}



},
[user]
);









/*
=========================================
CLEAR USER
Called after logout
=========================================
*/


const clearUser = useCallback(()=>{


setUser(null);


localStorage.removeItem(
"user"
);


},[]);









/*
=========================================
MULTI TAB SYNC
=========================================
*/


useEffect(()=>{


const syncUser=(event)=>{


if(event.key==="user"){


if(event.newValue){

setUser(
JSON.parse(
event.newValue
)
);


}
else{


setUser(null);


}


}



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

error,

fetchUser,

refreshUser:fetchUser,


updateProfile,


saveProfile:updateProfile,


changeAvatar:updateProfile,


updateNotificationSettings,


clearUser,


}),
[
user,
loading,
error,
fetchUser,
updateProfile,
updateNotificationSettings,
clearUser
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









/*
=========================================
HOOK
=========================================
*/


export const useUser = ()=>{


const context =
useContext(
UserContext
);



if(!context){

throw new Error(
"useUser must be used inside UserProvider"
);

}



return context;


};