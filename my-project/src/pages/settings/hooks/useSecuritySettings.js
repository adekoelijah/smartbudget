// import {
//   useCallback,
//   useEffect,
//   useState,
// } from "react";


// import {
//   changePasswordRequest,
//   enableTwoFactorRequest,
//   disableTwoFactorRequest,
//   getLoginSessions,
//   revokeSessionRequest,
//   logoutAllDevicesRequest,
// } from "../../services/securityService";





// const initialPasswordState = {

//   currentPassword:"",
//   newPassword:"",
//   confirmPassword:"",

// };





// const initialLoadingState = {

//   password:false,

//   sessions:false,

//   twoFactor:false,

//   logout:false,

//   revoke:null,

// };






// export const useSecuritySettings = (
//   user
// )=>{



// /*
// ==================================
// PASSWORD STATE
// ==================================
// */


// const [
// passwordForm,
// setPasswordForm
// ]=useState(
// initialPasswordState
// );
// /*
// ==================================
// SESSION STATE
// ==================================
// */


// const [
// sessions,
// setSessions
// ]=useState([]);







// /*
// ==================================
// SECURITY STATES
// ==================================
// */


// const twoFactorEnabled = Boolean(
//     user?.twoFactorEnabled
    
// );


// const [
// loading,
// setLoading
// ]=useState(
// initialLoadingState
// );






// const [
// message,
// setMessage
// ]=useState("");



// const [
// error,
// setError
// ]=useState("");


// /*
// ==================================
// SYNC USER SECURITY STATE
// ==================================
// */



// /*
// ==================================
// MESSAGE CLEANUP
// ==================================
// */


// useEffect(()=>{


// if(!message)
// return;



// const timer =
// setTimeout(()=>{

// setMessage("");

// },5000);



// return ()=>clearTimeout(timer);



// },[
// message
// ]);
// /*
// ==================================
// HELPERS
// ==================================
// */

// const clearStatus = useCallback(()=>{

// setMessage("");
// setError("");

// },[]);

// const setLoadingState = (
// key,
// value
// )=>{


// setLoading(prev=>({

// ...prev,

// [key]:value,

// }));

// };

// /*
// ==================================
// PASSWORD FIELD UPDATE
// ==================================
// */


// const updatePasswordField =
// useCallback(
// (
// key,
// value
// )=>{


// setPasswordForm(prev=>({

// ...prev,

// [key]:value,

// }));


// setError("");

// },
// []
// );

// /*
// ==================================
// PASSWORD VALIDATION
// ==================================
// */


// const validatePassword =
// useCallback(()=>{


// if(
// !passwordForm.currentPassword
// )
// return "Current password is required";



// if(
// !passwordForm.newPassword
// )
// return "New password is required";



// if(
// passwordForm.newPassword.length < 8
// )
// return "Password must contain at least 8 characters";



// if(
// passwordForm.newPassword !==
// passwordForm.confirmPassword
// )
// return "Passwords do not match";



// return null;



// },[
// passwordForm
// ]);


// /*
// ==================================
// CHANGE PASSWORD
// ==================================
// */


// const changePassword =
// useCallback(
// async()=>{


// const validation =
// validatePassword();



// if(validation){

// setError(validation);

// return;

// }





// try{


// setLoadingState(
// "password",
// true
// );
// clearStatus();

// await changePasswordRequest(
// passwordForm
// );
// setPasswordForm(
// initialPasswordState
// );

// setMessage(
// "Password updated successfully"
// );

// }

// catch(error){


// console.error(
// "Password update failed:",
// error
// );

// setError(
// error?.response?.data?.message ||
// "Unable to update password"
// );



// }

// finally{


// setLoadingState(
// "password",
// false
// );


// }


// },
// [
// passwordForm,
// validatePassword, clearStatus
// ]
// );

// /*
// ==================================
// FETCH SESSIONS
// ==================================
// */


// const fetchSessions =
// useCallback(
// async()=>{


// try{


// setLoadingState(
// "sessions",
// true
// );


// clearStatus();





// const response =
// await getLoginSessions();





// setSessions(
// response?.sessions || []
// );


// }

// catch(error){


// console.error(
// "Session loading failed:",
// error
// );

// setError(
// "Unable to load login activity"
// );


// }

// finally{


// setLoadingState(
// "sessions",
// false
// );

// }

// },
// [clearStatus]
// );

// /*
// ==================================
// REVOKE DEVICE
// ==================================
// */


// const revokeSession =
// useCallback(
// async(
// sessionId
// )=>{


// try{


// setLoading(prev=>({

// ...prev,

// revoke:sessionId,

// }));

// await revokeSessionRequest(
// sessionId
// );

// setSessions(prev=>

// prev.filter(
// session=>

// String(session._id)
// !==
// String(sessionId)

// )

// );



// setMessage(
// "Device removed successfully"
// );

// }

// catch(error){

// setError(
//   error?.response?.data?.message ??
//   "Unable to remove device"
// );


// }

// finally{


// setLoading(prev=>({

// ...prev,

// revoke:null,

// }));


// }



// },
// []
// );


// /*
// ==================================
// LOGOUT ALL DEVICES
// ==================================
// */


// const logoutAllDevices =
// useCallback(
// async()=>{


// try{


// setLoadingState(
// "logout",
// true
// );



// await logoutAllDevicesRequest();




// setSessions([]);




// setMessage(
// "All devices logged out"
// );



// }

// catch(error){


// setError(
//   error?.response?.data?.message ??
//   "Unable to logout devices"
// );


// }

// finally{


// setLoadingState(
// "logout",
// false
// );


// }



// },
// []
// );


// /*
// ==================================
// ENABLE 2FA
// ==================================
// */


// const enable2FA =
// useCallback(
// async()=>{


// try{


// setLoadingState(
// "twoFactor",
// true
// );



// await enableTwoFactorRequest();





// setMessage(
// "Two-factor authentication enabled"
// );



// }

// catch(error){



// setError(
//   error?.response?.data?.message ??
//   "Unable to enable 2FA"
// );


// }

// finally{


// setLoadingState(
// "twoFactor",
// false
// );


// }



// },
// []
// );











// /*
// ==================================
// DISABLE 2FA
// ==================================
// */


// const disable2FA =
// useCallback(
// async()=>{


// try{


// setLoadingState(
// "twoFactor",
// true
// );



// await disableTwoFactorRequest();




// setMessage(
// "Two-factor authentication disabled"
// );



// }

// catch(error){


// setError(
//   error?.response?.data?.message ??
//   "Unable to disable 2FA"
// );


// }

// finally{


// setLoadingState(
// "twoFactor",
// false
// );


// }



// },
// []
// );











// /*
// ==================================
// INITIAL SESSION LOAD
// ==================================
// */

// return {

// passwordForm,

// sessions,

// twoFactorEnabled,

// loading,

// message,

// error,


// updatePasswordField,

// changePassword,

// fetchSessions,

// revokeSession,

// logoutAllDevices,

// enable2FA,

// disable2FA,

// };

// };

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  changePasswordRequest,
  getLoginSessions,
  revokeSessionRequest,
  logoutAllDevicesRequest,
  enableTwoFactorRequest,
  verifyTwoFactorRequest,
  disableTwoFactorRequest,
  getSecurityError,
} from "../../../services/securityService";



/*
==================================================
INITIAL STATES
==================================================
*/


const INITIAL_PASSWORD_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};



const INITIAL_LOADING = {
  password: false,
  sessions: false,
  revoke: null,
  logoutAll: false,
  twoFactor: false,
};



/*
==================================================
HOOK
==================================================
*/


export const useSecuritySettings = (
  user,
  updateUser
) => {


/*
==================================================
STATE
==================================================
*/


const [
passwordForm,
setPasswordForm
] = useState(
INITIAL_PASSWORD_FORM
);



const [
sessions,
setSessions
] = useState([]);




const [
loading,
setLoading
] = useState(
INITIAL_LOADING
);



const [
message,
setMessage
] = useState("");



const [
error,
setError
] = useState("");



const [
twoFactorSecret,
setTwoFactorSecret
] = useState(null);



const [
twoFactorEnabled,
setTwoFactorEnabled
] = useState(
Boolean(user?.twoFactorEnabled)
);



/*
==================================================
HELPERS
==================================================
*/


const updateLoading = (
key,
value
)=>{

setLoading(prev=>({
...prev,
[key]:value,
}));

};



const clearMessages = ()=>{

setMessage("");

setError("");

};




const handleError = (
err
)=>{

const message =
getSecurityError(err);

setError(message);

};





/*
==================================================
PASSWORD FORM
==================================================
*/


const updatePasswordField = (
field,
value
)=>{

setPasswordForm(prev=>({
...prev,
[field]:value,
}));

setError("");

};





const validatePassword = ()=>{


if(
!passwordForm.currentPassword
){

return "Current password is required";

}



if(
!passwordForm.newPassword
){

return "New password is required";

}



if(
passwordForm.newPassword.length < 8
){

return "Password must contain at least 8 characters";

}



if(
passwordForm.newPassword !==
passwordForm.confirmPassword
){

return "Passwords do not match";

}


return null;

};






/*
==================================================
CHANGE PASSWORD
==================================================
*/


const changePassword =
useCallback(
async()=>{


const validation =
validatePassword();


if(validation){

setError(validation);

return {
success:false,
};

}



try{


updateLoading(
"password",
true
);


clearMessages();



await changePasswordRequest({

currentPassword:
passwordForm.currentPassword,


newPassword:
passwordForm.newPassword,

});



setPasswordForm(
INITIAL_PASSWORD_FORM
);



setMessage(
"Password updated successfully."
);



return {
success:true,
};



}catch(err){


handleError(err);


return {
success:false,
};



}finally{


updateLoading(
"password",
false
);


}



},
[
passwordForm
]
);







/*
==================================================
FETCH LOGIN SESSIONS
==================================================
*/


const fetchSessions =
useCallback(
async()=>{


try{


updateLoading(
"sessions",
true
);


const response =
await getLoginSessions();



setSessions(
response?.sessions || []
);



}catch(err){


handleError(err);



}finally{


updateLoading(
"sessions",
false
);


}



},
[]
);







/*
==================================================
REVOKE DEVICE
==================================================
*/


const revokeSession =
useCallback(
async(sessionId)=>{


try{


setLoading(prev=>({

...prev,

revoke:sessionId,

}));


await revokeSessionRequest(
sessionId
);



setSessions(prev=>

prev.filter(
session=>

session._id !== sessionId

)

);



setMessage(
"Device removed successfully."
);



}catch(err){


handleError(err);


}finally{


setLoading(prev=>({

...prev,

revoke:null,

}));

}



},
[]
);








/*
==================================================
LOGOUT ALL DEVICES
==================================================
*/


const logoutAllDevices =
useCallback(
async()=>{


try{


updateLoading(
"logoutAll",
true
);



await logoutAllDevicesRequest();



setSessions([]);




setMessage(
"All other devices have been logged out."
);



}catch(err){


handleError(err);



}finally{


updateLoading(
"logoutAll",
false
);


}



},
[]
);






/*
==================================================
ENABLE 2FA
==================================================
*/


const enable2FA =
useCallback(
async()=>{


try{


updateLoading(
"twoFactor",
true
);



clearMessages();



const response =
await enableTwoFactorRequest();



setTwoFactorSecret(
response?.secret || null
);



setMessage(
"Two-factor setup started."
);



return response;



}catch(err){


handleError(err);


}finally{


updateLoading(
"twoFactor",
false
);


}



},
[]
);








/*
==================================================
VERIFY 2FA
==================================================
*/


const verify2FA =
useCallback(
async(code)=>{


try{


updateLoading(
"twoFactor",
true
);



const response =
await verifyTwoFactorRequest(
code
);



setTwoFactorEnabled(true);



if(updateUser){

updateUser({
twoFactorEnabled:true,
});

}



setMessage(
"Two-factor authentication enabled."
);



return response;



}catch(err){


handleError(err);



}finally{


updateLoading(
"twoFactor",
false
);


}



},
[
updateUser
]
);







/*
==================================================
DISABLE 2FA
==================================================
*/


const disable2FA =
useCallback(
async(code)=>{


try{


updateLoading(
"twoFactor",
true
);



await disableTwoFactorRequest(
code
);



setTwoFactorEnabled(false);



if(updateUser){

updateUser({
twoFactorEnabled:false,
});

}



setMessage(
"Two-factor authentication disabled."
);



}catch(err){


handleError(err);



}finally{


updateLoading(
"twoFactor",
false
);


}



},
[
updateUser
]
);








/*
==================================================
AUTO LOAD SESSIONS
==================================================
*/


useEffect(()=>{

if(user){

fetchSessions();

}

},[
user,
fetchSessions
]);






/*
==================================================
AUTO CLEAR MESSAGE
==================================================
*/


useEffect(()=>{


if(!message)
return;


const timer =
setTimeout(()=>{

setMessage("");

},5000);



return ()=>clearTimeout(timer);



},[
message
]);







return {


passwordForm,

sessions,


loading,


message,

error,


twoFactorEnabled,

twoFactorSecret,



updatePasswordField,


changePassword,


fetchSessions,


revokeSession,


logoutAllDevices,


enable2FA,


verify2FA,


disable2FA,


clearMessages,


};


};