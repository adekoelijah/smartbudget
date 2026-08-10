

// // import axios from "axios";

// // const API_BASE_URL =
// //   import.meta.env.VITE_API_URL || "https://nexatech-smartbudget-backend.vercel.app/api";
  
  
// // // const API_BASE_URL =
// // //   import.meta.env.VITE_API_URL ||
// // //   "http://localhost:5000/api";

// // const api = axios.create({
// //   baseURL: API_BASE_URL,
// //   withCredentials:true,
// //   timeout: 15000,
// //   headers: {
// //     "Content-Type": "application/json",
// //   },
// // });

// // /* =========================================
// //    TOKEN RESOLVER (ROBUST)
// // ========================================= */
// // const getToken = () => {
// //   try {
// //     return localStorage.getItem("token");
// //   } catch {
// //     return null;
// //   }
// // };

// // /* =========================================
// //    REQUEST INTERCEPTOR
// // ========================================= */
// // api.interceptors.request.use(
// //   (config) => {
// //     const token = getToken();

// //     if (token) {
// //       config.headers.Authorization = `Bearer ${token}`;
// //     } else {
// //       delete config.headers.Authorization;
// //     }

// //     return config;
// //   },
// //   (error) => Promise.reject(error)
// // );

// // /* =========================================
// //    RESPONSE INTERCEPTOR (SMART AUTH HANDLING)
// // ========================================= */
// // api.interceptors.response.use(
// //   (response) => response,

// //   (error) => {
// //     const status = error.response?.status;

// //     if (status === 401) {
// //       console.warn("SESSION INVALID OR EXPIRED");

// //       // optional but recommended in production
// //       // localStorage.removeItem("token");
// //     }

// //     if (status === 429) {
// //       console.warn("RATE LIMIT EXCEEDED");
// //     }

// //     if (!error.response) {
// //       return Promise.reject({
// //         message: "Network error. Please check connection.",
// //       });
// //     }

// //     return Promise.reject(error);
// //   }
// // );

// // export default api;




// //new code


// // import axios from "axios";


// // const API_BASE_URL =
// //   import.meta.env.VITE_API_URL ||
// //   "https://nexatech-smartbudget-backend.vercel.app/api";


// // const api = axios.create({

// //   baseURL: API_BASE_URL,

// //   withCredentials: true,

// //   timeout: 15000,

// //   headers:{
// //     "Content-Type":"application/json",
// //   },

// // });


// // /*
// // =========================================
// // TOKEN MANAGEMENT
// // =========================================
// // */

// // const getToken = () => {

// //   try {

// //     return localStorage.getItem("token");

// //   } catch {

// //     return null;

// //   }

// // };


// // const setToken = (token)=>{

// //   localStorage.setItem(
// //     "token",
// //     token
// //   );

// // };


// // const removeToken = ()=>{

// //   localStorage.removeItem(
// //     "token"
// //   );

// // };



// // /*
// // =========================================
// // REQUEST INTERCEPTOR
// // =========================================
// // */

// // api.interceptors.request.use(

// // (config)=>{

// // const token = getToken();


// // if(token){

// // config.headers.Authorization =
// // `Bearer ${token}`;

// // }


// // return config;


// // },

// // (error)=>Promise.reject(error)

// // );



// // /*
// // =========================================
// // REFRESH TOKEN CONTROL
// // =========================================
// // */

// // let isRefreshing = false;

// // let refreshSubscribers = [];


// // const subscribeTokenRefresh = (callback)=>{

// // refreshSubscribers.push(callback);

// // };


// // const onTokenRefreshed = (token)=>{

// // refreshSubscribers.forEach(
// // (callback)=>{
// // callback(token);
// // }
// // );

// // refreshSubscribers=[];

// // };



// // /*
// // =========================================
// // RESPONSE INTERCEPTOR
// // =========================================
// // */
// // api.interceptors.response.use(

// // (response)=>response,


// // async(error)=>{

// // const originalRequest = error.config;

// // const status = error.response?.status;


// // /*
// // Only handle expired access tokens
// // */

// // if(
// //   status === 401 &&
// //   !originalRequest._retry
// // ){

// // originalRequest._retry = true;


// // try{


// // let newToken;


// // if(!isRefreshing){


// //   isRefreshing = true;


// //   const response =
// //   await axios.post(

// //     `${API_BASE_URL}/auth/refresh-token`,

// //     {},

// //     {
// //       withCredentials:true,
// //     }

// //   );


// //   newToken =
// //   response.data.token;


// //   setToken(newToken);


// //   isRefreshing = false;


// //   onTokenRefreshed(newToken);



// // }
// // else{


// //  return new Promise((resolve)=>{


// //   subscribeTokenRefresh(
// //     (token)=>{


// //       originalRequest.headers.Authorization =
// //       `Bearer ${token}`;


// //       resolve(
// //         api(originalRequest)
// //       );


// //     }
// //   );


// //  });


// // }


// // /*
// // Retry original request
// // */

// // originalRequest.headers.Authorization =
// // `Bearer ${newToken}`;


// // return api(originalRequest);



// // }
// // catch(refreshError){


// // isRefreshing=false;

// // removeToken();


// // window.location.href="/login";


// // return Promise.reject(refreshError);


// // }


// // }



// // if(status===429){

// // console.warn(
// // "Too many requests"
// // );

// // }



// // if(!error.response){

// // return Promise.reject({

// // message:
// // "Network error. Please check your connection."

// // });

// // }


// // return Promise.reject(error);


// // }

// // );


// // export default api;




// import axios from "axios";


// const API_BASE_URL =
//   import.meta.env.VITE_API_URL ||
//   "https://nexatech-smartbudget-backend.vercel.app/api";



// const api = axios.create({

//   baseURL: API_BASE_URL,

//   withCredentials:true,

//   timeout:15000,

//   headers:{
//     "Content-Type":"application/json",
//   },

// });





// /*
// =========================================
// TOKEN STORAGE
// =========================================
// */


// const getToken = ()=>{

// try{

// return localStorage.getItem("token");

// }
// catch{

// return null;

// }

// };



// const setToken = (token)=>{

// if(token){

// localStorage.setItem(
// "token",
// token
// );

// }

// };




// const removeToken = ()=>{

// localStorage.removeItem(
// "token"
// );

// };







// /*
// =========================================
// REQUEST INTERCEPTOR
// =========================================
// */


// api.interceptors.request.use(

// (config)=>{


// const token =
// getToken();



// if(token){

// config.headers.Authorization =
// `Bearer ${token}`;

// }



// return config;


// },


// (error)=>
// Promise.reject(error)

// );









// /*
// =========================================
// REFRESH MANAGEMENT
// =========================================
// */


// let isRefreshing = false;


// let pendingRequests = [];




// const resolvePendingRequests = (
// token
// )=>{


// pendingRequests.forEach(
// (callback)=>{

// callback(token);

// });


// pendingRequests=[];


// };






// /*
// =========================================
// RESPONSE INTERCEPTOR
// =========================================
// */


// api.interceptors.response.use(


// (response)=>
// response,



// async(error)=>{


// const originalRequest =
// error.config;


// const status =
// error.response?.status;



// if(
// status !==401 ||
// originalRequest?._retry
// ){

// return Promise.reject(error);

// }





// originalRequest._retry=true;



// /*
// Prevent refresh endpoint loop
// */

// if(
// originalRequest.url.includes(
// "/auth/refresh-token"
// )
// ){

// removeToken();

// return Promise.reject(error);

// }







// if(isRefreshing){



// return new Promise(
// (resolve)=>{


// pendingRequests.push(
// (token)=>{


// originalRequest.headers.Authorization =
// `Bearer ${token}`;


// resolve(
// api(originalRequest)
// );


// }

// );


// });



// }






// isRefreshing=true;




// try{


// const response =
// await axios.post(

// `${API_BASE_URL}/auth/refresh-token`,

// {},

// {
// withCredentials:true,
// }

// );




// const newToken =
// response.data.token;



// if(!newToken){

// throw new Error(
// "No refresh token received"
// );

// }





// setToken(newToken);



// resolvePendingRequests(
// newToken
// );





// originalRequest.headers.Authorization =
// `Bearer ${newToken}`;




// return api(originalRequest);





// }
// catch(refreshError){



// pendingRequests=[];


// removeToken();




// /*
// Do not hard reload
// */

// window.dispatchEvent(
// new Event(
// "auth:logout"
// )
// );



// return Promise.reject(
// refreshError
// );



// }
// finally{


// isRefreshing=false;


// }




// }

// );



// export default api;




import axios from "axios";

/*
==================================================
API CONFIGURATION
==================================================
*/

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://nexatech-smartbudget-backend.vercel.app/api";


/*
==================================================
AXIOS INSTANCE
==================================================
*/

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,

  headers: {
    "Content-Type": "application/json",
  },
});


/*
==================================================
TOKEN STORAGE
==================================================
*/

const getToken = () => {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
};


const setToken = (token) => {
  if (!token) return;

  try {
    localStorage.setItem("token", token);
  } catch (error) {
    console.error(
      "TOKEN_STORAGE_ERROR:",
      error
    );
  }
};


const removeToken = () => {
  try {
    localStorage.removeItem("token");
  } catch (error) {
    console.error(
      "TOKEN_REMOVE_ERROR:",
      error
    );
  }
};


/*
==================================================
REQUEST INTERCEPTOR
==================================================
*/

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


/*
==================================================
REFRESH TOKEN MANAGEMENT
==================================================
*/

let isRefreshing = false;

let pendingRequests = [];


/*
==================================================
PROCESS QUEUED REQUESTS
==================================================
*/

const processQueue = (
  error,
  token = null
) => {
  pendingRequests.forEach(
    ({ resolve, reject }) => {

      if (error) {
        reject(error);
      } else {
        resolve(token);
      }

    }
  );

  pendingRequests = [];
};


/*
==================================================
RESPONSE INTERCEPTOR
==================================================
*/

api.interceptors.response.use(

  (response) => {
    return response;
  },

  async (error) => {

    const originalRequest =
      error.config;

    const status =
      error.response?.status;


    /*
    ==============================================
    NETWORK ERROR
    ==============================================
    */

    if (!error.response) {

      return Promise.reject({
        message:
          "Network error. Please check your connection.",
      });

    }


    /*
    ==============================================
    ONLY HANDLE 401
    ==============================================
    */

    if (status !== 401) {

      if (status === 429) {
        console.warn(
          "Too many requests."
        );
      }

      return Promise.reject(error);
    }


    /*
    ==============================================
    PREVENT INFINITE RETRY
    ==============================================
    */

    if (
      originalRequest?._retry
    ) {
      return Promise.reject(error);
    }


    originalRequest._retry = true;


    /*
    ==============================================
    NEVER REFRESH THE REFRESH REQUEST
    ==============================================
    */

    if (
      originalRequest.url?.includes(
        "/auth/refresh-token"
      )
    ) {

      removeToken();

      window.dispatchEvent(
        new Event("auth:logout")
      );

      return Promise.reject(error);
    }


    /*
    ==============================================
    WAIT FOR EXISTING REFRESH
    ==============================================
    */

    if (isRefreshing) {

      return new Promise(
        (resolve, reject) => {

          pendingRequests.push({
            resolve,
            reject,
          });

        }
      ).then((newToken) => {

        originalRequest.headers =
          originalRequest.headers || {};

        originalRequest.headers.Authorization =
          `Bearer ${newToken}`;

        return api(originalRequest);

      });

    }


    /*
    ==============================================
    START TOKEN REFRESH
    ==============================================
    */

    isRefreshing = true;


    try {

      const response =
        await axios.post(

          `${API_BASE_URL}/auth/refresh-token`,

          {},

          {
            withCredentials: true,
            headers: {
              "Content-Type":
                "application/json",
            },
          }

        );


      /*
      ============================================
      EXTRACT NEW ACCESS TOKEN
      ============================================
      */

      const newToken =
        response.data?.token;


      if (!newToken) {

        throw new Error(
          "Refresh endpoint did not return an access token."
        );

      }


      /*
      ============================================
      STORE NEW ACCESS TOKEN
      ============================================
      */

      setToken(newToken);


      /*
      ============================================
      RESOLVE QUEUED REQUESTS
      ============================================
      */

      processQueue(
        null,
        newToken
      );


      /*
      ============================================
      RETRY ORIGINAL REQUEST
      ============================================
      */

      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newToken}`;


      return api(
        originalRequest
      );


    } catch (refreshError) {

      /*
      ============================================
      REFRESH FAILED
      ============================================
      */

      processQueue(
        refreshError,
        null
      );

      removeToken();


      /*
      Do not force a hard page reload.
      Let AuthContext/AuthProvider handle logout.
      */

      window.dispatchEvent(
        new Event("auth:logout")
      );


      return Promise.reject(
        refreshError
      );


    } finally {

      isRefreshing = false;

    }

  }

);


export default api;

