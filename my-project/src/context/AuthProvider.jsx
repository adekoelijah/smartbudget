import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  loginUser,
  signupUser,
} from "../services/authService";


export const AuthContext = createContext(null);



/*
=========================================
HELPERS
=========================================
*/


const getStoredToken = () => {

  try {

    return localStorage.getItem("token");

  } catch {

    return null;

  }

};





const saveToken = (token)=>{

  localStorage.setItem(
    "token",
    token
  );

};





const removeToken = ()=>{

  localStorage.removeItem(
    "token"
  );

};





const normalizeResponse = (response)=>{

  return {

    token:
      response?.token ??
      response?.data?.token ??
      null,


    user:
      response?.user ??
      response?.data?.user ??
      null,

  };

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
RESTORE SESSION
=========================================
*/


useEffect(()=>{


const existingToken =
getStoredToken();


if(existingToken){

setToken(existingToken);

}


setInitializing(false);


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
await loginUser(credentials);



const {
token
}=normalizeResponse(
response
);



if(!token){

throw new Error(
"Authentication failed"
);

}



saveToken(token);


setToken(token);




return {

success:true

};



}catch(error){


const message =
error?.response?.data?.message ||
error.message ||
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
async(data)=>{


try{


setLoading(true);

setError(null);



const response =
await signupUser(data);



const {
token
}=normalizeResponse(
response
);



if(!token){

throw new Error(
"Signup failed"
);

}




saveToken(token);


setToken(token);





return {

success:true

};




}catch(error){



const message =
error?.response?.data?.message ||
error.message ||
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


const logout = useCallback(()=>{


removeToken();


setToken(null);


window.location.href="/login";


},[]);









/*
=========================================
TOKEN SYNC BETWEEN TABS
=========================================
*/


useEffect(()=>{


const listener=(event)=>{


if(event.key==="token"){


setToken(
event.newValue
);


}


};



window.addEventListener(
"storage",
listener
);



return ()=>{

window.removeEventListener(
"storage",
listener
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