import api from "./api";


let interceptorInitialized = false;



let isRefreshing = false;


let failedQueue = [];



/*
  Handle requests waiting
  while token refresh is happening
*/

const processQueue = (
  error,
  token = null
)=>{


  failedQueue.forEach(
    promise => {

      if(error){

        promise.reject(error);

      }else{

        promise.resolve(token);

      }

    }
  );


  failedQueue = [];

};





const setupRefreshTokenInterceptor = () => {

  if(interceptorInitialized) return;

  interceptorInitialized = true;


  api.interceptors.response.use(
(response)=> response,

async(error)=>{


const originalRequest =
error.config;



/*
  Only handle expired tokens
*/

if(
error.response?.status === 401 &&
!originalRequest._retry
){



if(isRefreshing){


return new Promise(
(resolve,reject)=>{


failedQueue.push({
resolve,
reject
});


})

.then(token=>{


originalRequest.headers.Authorization =
`Bearer ${token}`;


return api(originalRequest);


});


}





originalRequest._retry = true;


isRefreshing = true;



try{


/*
  Request new access token

  refreshToken is automatically
  sent because axios has:

  withCredentials:true
*/

const response =
await api.post(
"/auth/refresh-token"
);



const newToken =
response.data.token;



if(!newToken){

throw new Error(
"Refresh token failed"
);

}



/*
 Save new access token
*/

localStorage.setItem(
"token",
newToken
);



/*
 Update failed requests
*/

processQueue(
null,
newToken
);



originalRequest.headers.Authorization =
`Bearer ${newToken}`;



return api(originalRequest);



}catch(refreshError){



processQueue(
refreshError,
null
);



/*
  Session completely expired
*/

localStorage.removeItem(
"token"
);

localStorage.removeItem(
"user"
);



window.location.href =
"/login";



return Promise.reject(
refreshError
);



}finally{


isRefreshing=false;


}



}



return Promise.reject(error);



}

);


};



export default setupRefreshTokenInterceptor;