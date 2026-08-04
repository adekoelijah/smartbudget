import {
  useCallback,
  useEffect,
  useState,
} from "react";


import {
  changePasswordRequest,
  enableTwoFactorRequest,
  disableTwoFactorRequest,
  getLoginSessions,
  revokeSessionRequest,
  logoutAllDevicesRequest,
} from "../../services/securityService";





const initialPasswordState = {

  currentPassword:"",
  newPassword:"",
  confirmPassword:"",

};





const initialLoadingState = {

  password:false,

  sessions:false,

  twoFactor:false,

  logout:false,

  revoke:null,

};






export const useSecuritySettings = (
  user
)=>{



/*
==================================
PASSWORD STATE
==================================
*/


const [
passwordForm,
setPasswordForm
]=useState(
initialPasswordState
);
/*
==================================
SESSION STATE
==================================
*/


const [
sessions,
setSessions
]=useState([]);







/*
==================================
SECURITY STATES
==================================
*/


const twoFactorEnabled = Boolean(
    user?.twoFactorEnabled
);

const [
loading,
setLoading
]=useState(
initialLoadingState
);






const [
message,
setMessage
]=useState("");



const [
error,
setError
]=useState("");


/*
==================================
SYNC USER SECURITY STATE
==================================
*/



/*
==================================
MESSAGE CLEANUP
==================================
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
/*
==================================
HELPERS
==================================
*/

const clearStatus = useCallback(()=>{

setMessage("");
setError("");

},[]);

const setLoadingState = (
key,
value
)=>{


setLoading(prev=>({

...prev,

[key]:value,

}));

};

/*
==================================
PASSWORD FIELD UPDATE
==================================
*/


const updatePasswordField =
useCallback(
(
key,
value
)=>{


setPasswordForm(prev=>({

...prev,

[key]:value,

}));


setError("");

},
[]
);

/*
==================================
PASSWORD VALIDATION
==================================
*/


const validatePassword =
useCallback(()=>{


if(
!passwordForm.currentPassword
)
return "Current password is required";



if(
!passwordForm.newPassword
)
return "New password is required";



if(
passwordForm.newPassword.length < 8
)
return "Password must contain at least 8 characters";



if(
passwordForm.newPassword !==
passwordForm.confirmPassword
)
return "Passwords do not match";



return null;



},[
passwordForm
]);


/*
==================================
CHANGE PASSWORD
==================================
*/


const changePassword =
useCallback(
async()=>{


const validation =
validatePassword();



if(validation){

setError(validation);

return;

}





try{


setLoadingState(
"password",
true
);
clearStatus();

await changePasswordRequest(
passwordForm
);
setPasswordForm(
initialPasswordState
);

setMessage(
"Password updated successfully"
);

}

catch(error){


console.error(
"Password update failed:",
error
);

setError(
error?.response?.data?.message ||
"Unable to update password"
);



}

finally{


setLoadingState(
"password",
false
);


}


},
[
passwordForm,
validatePassword, clearStatus
]
);

/*
==================================
FETCH SESSIONS
==================================
*/


const fetchSessions =
useCallback(
async()=>{


try{


setLoadingState(
"sessions",
true
);


clearStatus();





const response =
await getLoginSessions();





setSessions(
response?.sessions || []
);


}

catch(error){


console.error(
"Session loading failed:",
error
);

setError(
"Unable to load login activity"
);


}

finally{


setLoadingState(
"sessions",
false
);

}

},
[clearStatus]
);

/*
==================================
REVOKE DEVICE
==================================
*/


const revokeSession =
useCallback(
async(
sessionId
)=>{


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

String(session._id)
!==
String(sessionId)

)

);



setMessage(
"Device removed successfully"
);

}

catch(error){

setError(
  error?.response?.data?.message ??
  "Unable to remove device"
);


}

finally{


setLoading(prev=>({

...prev,

revoke:null,

}));


}



},
[]
);


/*
==================================
LOGOUT ALL DEVICES
==================================
*/


const logoutAllDevices =
useCallback(
async()=>{


try{


setLoadingState(
"logout",
true
);



await logoutAllDevicesRequest();




setSessions([]);




setMessage(
"All devices logged out"
);



}

catch(error){


setError(
  error?.response?.data?.message ??
  "Unable to logout devices"
);


}

finally{


setLoadingState(
"logout",
false
);


}



},
[]
);


/*
==================================
ENABLE 2FA
==================================
*/


const enable2FA =
useCallback(
async()=>{


try{


setLoadingState(
"twoFactor",
true
);



await enableTwoFactorRequest();





setMessage(
"Two-factor authentication enabled"
);



}

catch(error){



setError(
  error?.response?.data?.message ??
  "Unable to enable 2FA"
);


}

finally{


setLoadingState(
"twoFactor",
false
);


}



},
[]
);











/*
==================================
DISABLE 2FA
==================================
*/


const disable2FA =
useCallback(
async()=>{


try{


setLoadingState(
"twoFactor",
true
);



await disableTwoFactorRequest();




setMessage(
"Two-factor authentication disabled"
);



}

catch(error){


setError(
  error?.response?.data?.message ??
  "Unable to disable 2FA"
);


}

finally{


setLoadingState(
"twoFactor",
false
);


}



},
[]
);











/*
==================================
INITIAL SESSION LOAD
==================================
*/

return {

passwordForm,

sessions,

twoFactorEnabled,

loading,

message,

error,


updatePasswordField,

changePassword,

fetchSessions,

revokeSession,

logoutAllDevices,

enable2FA,

disable2FA,

};

};