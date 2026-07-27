

// import axios from "axios";

// const API_BASE_URL =
//   import.meta.env.VITE_API_URL || "https://nexatech-smartbudget-backend.vercel.app/api";
  
  
// // const API_BASE_URL =
// //   import.meta.env.VITE_API_URL ||
// //   "http://localhost:5000/api";

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   withCredentials:true,
//   timeout: 15000,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// /* =========================================
//    TOKEN RESOLVER (ROBUST)
// ========================================= */
// const getToken = () => {
//   try {
//     return localStorage.getItem("token");
//   } catch {
//     return null;
//   }
// };

// /* =========================================
//    REQUEST INTERCEPTOR
// ========================================= */
// api.interceptors.request.use(
//   (config) => {
//     const token = getToken();

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     } else {
//       delete config.headers.Authorization;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// /* =========================================
//    RESPONSE INTERCEPTOR (SMART AUTH HANDLING)
// ========================================= */
// api.interceptors.response.use(
//   (response) => response,

//   (error) => {
//     const status = error.response?.status;

//     if (status === 401) {
//       console.warn("SESSION INVALID OR EXPIRED");

//       // optional but recommended in production
//       // localStorage.removeItem("token");
//     }

//     if (status === 429) {
//       console.warn("RATE LIMIT EXCEEDED");
//     }

//     if (!error.response) {
//       return Promise.reject({
//         message: "Network error. Please check connection.",
//       });
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;




//new code


import axios from "axios";


const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://nexatech-smartbudget-backend.vercel.app/api";


const api = axios.create({

  baseURL: API_BASE_URL,

  withCredentials: true,

  timeout: 15000,

  headers:{
    "Content-Type":"application/json",
  },

});


/*
=========================================
TOKEN MANAGEMENT
=========================================
*/

const getToken = () => {

  try {

    return localStorage.getItem("token");

  } catch {

    return null;

  }

};


const setToken = (token)=>{

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



/*
=========================================
REQUEST INTERCEPTOR
=========================================
*/

api.interceptors.request.use(

(config)=>{

const token = getToken();


if(token){

config.headers.Authorization =
`Bearer ${token}`;

}


return config;


},

(error)=>Promise.reject(error)

);



/*
=========================================
REFRESH TOKEN CONTROL
=========================================
*/

let isRefreshing = false;

let refreshSubscribers = [];


const subscribeTokenRefresh = (callback)=>{

refreshSubscribers.push(callback);

};


const onTokenRefreshed = (token)=>{

refreshSubscribers.forEach(
(callback)=>{
callback(token);
}
);

refreshSubscribers=[];

};



/*
=========================================
RESPONSE INTERCEPTOR
=========================================
*/
api.interceptors.response.use(

(response)=>response,


async(error)=>{

const originalRequest = error.config;

const status = error.response?.status;


/*
Only handle expired access tokens
*/

if(
  status === 401 &&
  !originalRequest._retry
){

originalRequest._retry = true;


try{


let newToken;


if(!isRefreshing){


  isRefreshing = true;


  const response =
  await axios.post(

    `${API_BASE_URL}/auth/refresh-token`,

    {},

    {
      withCredentials:true,
    }

  );


  newToken =
  response.data.token;


  setToken(newToken);


  isRefreshing = false;


  onTokenRefreshed(newToken);



}
else{


 return new Promise((resolve)=>{


  subscribeTokenRefresh(
    (token)=>{


      originalRequest.headers.Authorization =
      `Bearer ${token}`;


      resolve(
        api(originalRequest)
      );


    }
  );


 });


}


/*
Retry original request
*/

originalRequest.headers.Authorization =
`Bearer ${newToken}`;


return api(originalRequest);



}
catch(refreshError){


isRefreshing=false;

removeToken();


window.location.href="/login";


return Promise.reject(refreshError);


}


}



if(status===429){

console.warn(
"Too many requests"
);

}



if(!error.response){

return Promise.reject({

message:
"Network error. Please check your connection."

});

}


return Promise.reject(error);


}

);


export default api;