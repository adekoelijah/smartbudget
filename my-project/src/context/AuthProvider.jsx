
// import { createContext, useEffect, useMemo, useState } from "react";
// import { loginUser, signupUser, getCurrentUser } from "../services/authService";

// export const AuthContext = createContext(null);

// /**
//  * 🧠 Normalize API response (handles ALL backend shapes)
//  */
// const normalizeAuthResponse = (res) => {
//   const token = res?.token || res?.data?.token;
//   const user = res?.user || res?.data?.user;

//   return { token, user };
// };

// /**
//  * 🧠 Safe JSON parser
//  */
// const safeParse = (data) => {
//   try {
//     return JSON.parse(data);
//   } catch {
//     return null;
//   }
// };

// export const AuthProvider = ({ children }) => {
//   // =========================
//   // STATE
//   // =========================
//   const [token, setToken] = useState(() =>
//     localStorage.getItem("token")
//   );

//   const [user, setUser] = useState(() =>
//     safeParse(localStorage.getItem("user"))
//   );

//   const [loading, setLoading] = useState(false);
//   const [initializing, setInitializing] = useState(true);
//   const [error, setError] = useState(null);

//   // =========================
//   // SYNC (multi-tab logout)
//   // =========================
//   useEffect(() => {
//     const syncAuth = (event) => {
//       if (event.key === "token" && !event.newValue) {
//         setToken(null);
//         setUser(null);
//       }
//     };

//     window.addEventListener("storage", syncAuth);
//     return () => window.removeEventListener("storage", syncAuth);
//   }, []);

//   // =========================
//   // HYDRATE USER (SESSION RESTORE)
//   // =========================
//   useEffect(() => {
//     const hydrateUser = async () => {
//       if (!token) {
//         setInitializing(false);
//         return;
//       }

//       try {
//         const data = await getCurrentUser();

//         const currentUser = data?.user || data;

//         if (currentUser) {
//           setUser(currentUser);
//           localStorage.setItem("user", JSON.stringify(currentUser));
//         }
//       } catch (err) {
//         console.warn("Session expired or invalid token");
//         console.error("Failed to fetch current user:", err);

//         localStorage.removeItem("token");
//         localStorage.removeItem("user");

//         setToken(null);
//         setUser(null);
//       } finally {
//         setInitializing(false);
//       }
//     };

//     hydrateUser();
//   }, [token]);

//   // =========================
//   // LOGIN
//   // =========================
//   const login = async (formData) => {
//     try {
//       setLoading(true);
//       setError(null);

//       const res = await loginUser(formData);
//       const { token: authToken, user: authUser } =
//         normalizeAuthResponse(res);

//       if (!authToken || !authUser) {
//         throw new Error(res?.message || "Invalid server response during login");
//       }

//       localStorage.setItem("token", authToken);
//       localStorage.setItem("user", JSON.stringify(authUser));

//       setToken(authToken);
//       setUser(authUser);

//       return { success: true };
//     } catch (err) {
//       const message =
//         err?.response?.data?.message ||
//         err.message ||
//         "Login failed";

//       setError(message);
//       return { success: false, message };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =========================
//   // SIGNUP
//   // =========================
//   const signup = async (formData) => {
//     try {
//       setLoading(true);
//       setError(null);

//       const res = await signupUser(formData);
//       const { token: authToken, user: authUser } =
//         normalizeAuthResponse(res);

//       if (!authToken || !authUser) {
//         throw new Error(res?.message || "Invalid server response during signup");
//       }

//       localStorage.setItem("token", authToken);
//       localStorage.setItem("user", JSON.stringify(authUser));

//       setToken(authToken);
//       setUser(authUser);

//       return { success: true };
//     } catch (err) {
//       const message =
//         err?.response?.data?.message ||
//         err.message ||
//         "Signup failed";

//       setError(message);
//       return { success: false, message };
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =========================
//   // LOGOUT
//   // =========================
//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");

//     setToken(null);
//     setUser(null);
//   };

//   // =========================
//   // CONTEXT VALUE
//   // =========================
//   const value = useMemo(
//     () => ({
//       user,
//       token,
//       loading,
//       initializing,
//       error,
//       isAuthenticated: !!token && !!user,
//       login,
//       signup,
//       logout,
//     }),
//     [user, token, loading, initializing, error]
//   );

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };



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
  getCurrentUser,
} from "../services/authService";

 export const AuthContext = createContext(null);



/*
=========================================
HELPERS
=========================================
*/


const safeParse = (value)=>{

  try{

    return JSON.parse(value);

  }catch{

    return null;

  }

};



const normalizeAuthResponse = (response)=>{

  return {

    token:
      response?.token ||
      response?.data?.token ||
      null,


    user:
      response?.user ||
      response?.data?.user ||
      null,

  };

};





export const AuthProvider = ({
 children
})=>{


/*
=========================================
STATE
=========================================
*/


const [token,setToken] = useState(
 ()=>localStorage.getItem("token")
);


const [user,setUser] = useState(
 ()=>safeParse(
    localStorage.getItem("user")
 )
);


const [loading,setLoading]=useState(false);


const [initializing,setInitializing]=useState(true);


const [error,setError]=useState(null);





/*
=========================================
SAVE AUTH DATA
=========================================
*/


const saveAuth = useCallback(
({
 token,
 user
})=>{


if(token){

localStorage.setItem(
"token",
token
);

setToken(token);

}



if(user){

localStorage.setItem(
"user",
JSON.stringify(user)
);

setUser(user);

}



},
[]
);






/*
=========================================
CLEAR AUTH
=========================================
*/


const clearAuth = useCallback(()=>{


localStorage.removeItem(
"token"
);


localStorage.removeItem(
"user"
);


setToken(null);

setUser(null);


},
[]);







/*
=========================================
LOAD CURRENT USER
Used after Google Login
=========================================
*/


const hydrateUser = useCallback(
async()=>{


const storedToken =
localStorage.getItem("token");



if(!storedToken){

setInitializing(false);

return null;

}



try{


const response =
await getCurrentUser();



const currentUser =
response?.user ||
response;



if(currentUser){


setUser(currentUser);


localStorage.setItem(
"user",
JSON.stringify(currentUser)
);


}



return currentUser;



}catch(error){


console.error(
"HYDRATE_USER_ERROR:",
error
);


clearAuth();


return null;



}finally{


setInitializing(false);


}



},
[clearAuth]

);






/*
=========================================
INITIAL SESSION RESTORE
=========================================
*/


useEffect(()=>{


hydrateUser();


},[]);







/*
=========================================
MULTI TAB SYNC
=========================================
*/


useEffect(()=>{


const syncAuth=(event)=>{


if(event.key==="token"){


setToken(
event.newValue
);



if(!event.newValue){

setUser(null);

}


}



if(event.key==="user"){


setUser(
safeParse(event.newValue)
);


}



};



window.addEventListener(
"storage",
syncAuth
);



return ()=>{

window.removeEventListener(
"storage",
syncAuth
);

};



},[]);






/*
=========================================
LOGIN
=========================================
*/


const login = useCallback(
async(formData)=>{


try{


setLoading(true);

setError(null);



const response =
await loginUser(formData);



const {
token,
user
}=normalizeAuthResponse(
response
);



if(!token || !user){

throw new Error(
"Invalid login response"
);

}



saveAuth({
token,
user
});



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



}finally{


setLoading(false);


}



},
[saveAuth]
);






/*
=========================================
SIGNUP
=========================================
*/


const signup = useCallback(
async(formData)=>{


try{


setLoading(true);

setError(null);



const response =
await signupUser(formData);



const {
token,
user
}=normalizeAuthResponse(
response
);



if(!token || !user){

throw new Error(
"Invalid signup response"
);

}



saveAuth({
token,
user
});



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



}finally{


setLoading(false);


}


},
[saveAuth]
);








/*
=========================================
UPDATE USER
For profile changes
=========================================
*/


const updateUser = useCallback(
(updatedUser)=>{


setUser(prev=>({

...prev,

...updatedUser

}));


localStorage.setItem(
"user",
JSON.stringify({
...user,
...updatedUser
})
);


},
[user]
);







/*
=========================================
LOGOUT
=========================================
*/


const logout = useCallback(()=>{


clearAuth();


},[clearAuth]);








/*
=========================================
CONTEXT VALUE
=========================================
*/


const value = useMemo(()=>({


user,

token,


loading,

initializing,


error,


isAuthenticated:
Boolean(token && user),



login,

signup,


logout,


hydrateUser,


updateUser,


clearAuth,


}),
[
user,
token,
loading,
initializing,
error,
login,
signup,
logout,
hydrateUser,
updateUser,
clearAuth
]
);






return (

<AuthContext.Provider value={value}>

{children}

</AuthContext.Provider>

);


};