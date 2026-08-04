


import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import AuthContext from "./AuthContext";

import {
  loginUser,
  signupUser,
  logoutUser,
} from "../services/authService";



/*
=========================================
AUTH CONTEXT
=========================================
*/






/*
=========================================
HELPERS
=========================================
*/


const getStoredToken = () => {

  try {

    return localStorage.getItem("token");

  } catch (error) {

    console.error(
      "GET_TOKEN_ERROR:",
      error
    );

    return null;

  }

};





const storeToken=(token)=>{


try{


if(!token){

return;

}


localStorage.setItem(
"token",
token
);


}
catch(error){


console.error(
"STORE_TOKEN_ERROR:",
error
);


}


};





const removeStoredToken = ()=>{

  localStorage.removeItem(
    "token"
  );

};






const extractToken = (response)=>{

  return (
    response?.token ||
    response?.data?.token ||
    null
  );

};







/*
=========================================
AUTH PROVIDER
=========================================
*/


export const AuthProvider = ({
  children
})=>{


const [
  token,
  setToken
]=useState(
  getStoredToken
);




const [
  loading,
  setLoading
]=useState(false);




const [
  initializing,
  setInitializing
]=useState(true);




const [
  error,
  setError
]=useState(null);








/*
=========================================
RESTORE AUTH SESSION
=========================================
*/


useEffect(()=>{


const timer =
setTimeout(()=>{

setInitializing(false);

},0);



return ()=>clearTimeout(timer);


},[]);









/*
=========================================
LOGIN
=========================================
*/


const login = useCallback(
async(credentials)=>{


try{


setLoading(true);

setError(null);



const response =
await loginUser(
credentials
);



const token =
extractToken(
response
);



if(!token){

throw new Error(
"Authentication token missing"
);

}



storeToken(token);



setToken(token);





return {

success:true,

token

};



}
catch(error){


const message =
error?.response?.data?.message ||
error?.message ||
"Login failed";



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
SIGNUP
=========================================
*/


const signup = useCallback(
async(userData)=>{


try{


setLoading(true);

setError(null);



const response =
await signupUser(
userData
);



const token =
extractToken(
response
);



if(!token){

throw new Error(
"Authentication token missing"
);

}




storeToken(token);



setToken(token);





return {

success:true,

token

};



}
catch(error){


const message =
error?.response?.data?.message ||
error?.message ||
"Signup failed";



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
LOGOUT
=========================================
*/


const logout = useCallback(
async()=>{


try{


await logoutUser();



}
catch(error){


console.error(
"LOGOUT_ERROR:",
error
);


}
finally{


removeStoredToken();



setToken(null);



window.location.href =
"/login";


}



},
[]
);









/*
=========================================
MULTI TAB TOKEN SYNC
=========================================
*/


useEffect(()=>{


const syncToken=(event)=>{


if(
event.key === "token"
){


setToken(
event.newValue
);


}



};



window.addEventListener(
"storage",
syncToken
);



return ()=>{


window.removeEventListener(
"storage",
syncToken
);



};



},[]);









/*
=========================================
CONTEXT VALUE
=========================================
*/


const value = useMemo(()=>({


token,


loading,


initializing,


error,



isAuthenticated:
Boolean(token),



login,


signup,


logout,



}),
[
token,
loading,
initializing,
error,
login,
signup,
logout
]);







return (

<AuthContext.Provider
value={value}
>

{children}

</AuthContext.Provider>

);


};