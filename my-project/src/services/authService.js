// import api from "./api";
// // import axios from "axios";


// const API_URL =
//   import.meta.env.VITE_API_URL || "https://nexatech-smartbudget-backend.vercel.app/api";


// export const loginUser = async (data) => {
//   const res = await api.post("/auth/login", data);
//   return res.data;
// };

// //google 

// export const googleLogin = () => {
//   // const API_URL =
//   //   import.meta.env.VITE_API_URL || "https://nexatech-smartbudget-backend.vercel.app/api";

//   // Redirect to backend OAuth flow
//   window.location.href = `${API_URL}/auth/google`;
// };

// export const signupUser = async (data) => {
//   const res = await api.post("/auth/signup", data);
//   return res.data;
// };


// export const getCurrentUser = async () => {
//   const token = localStorage.getItem("token");

//   if (!token) {
//     throw new Error("No token found");
//   }

//   try {
//     const res = await api.get("/auth/me", {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     return res.data.user || res.data;
//   } catch (error) {
//     console.log("CURRENT USER ERROR:", error?.response?.data);

//     // Only clear auth if backend says unauthorized
//     if (error?.response?.status === 401) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//     }

//     throw error;
//   }
// };




// import api from "./api";



// /*
// =========================================
// LOGIN
// =========================================
// */

// export const loginUser = async(data)=>{

// const res =
// await api.post(
// "/auth/login",
// data
// );

// return res.data;

// };



// /*
// =========================================
// SIGNUP
// =========================================
// */

// export const signupUser = async(data)=>{

// const res =
// await api.post(
// "/auth/signup",
// data
// );

// return res.data;

// };



// /*
// =========================================
// GOOGLE LOGIN
// =========================================
// */

// export const googleLogin = ()=>{


// const API_URL =
// import.meta.env.VITE_API_URL ||
// "https://nexatech-smartbudget-backend.vercel.app/api";


// window.location.href =
// `${API_URL}/auth/google`;


// };




// /*
// =========================================
// CURRENT USER
// =========================================
// */

// export const getCurrentUser = async()=>{


// const res =
// await api.get(
// "/auth/me"
// );


// return res.data.user || res.data;


// };




// /*
// =========================================
// LOGOUT
// =========================================
// */

// export const logoutUser = async()=>{


// const res =
// await api.post(
// "/auth/logout"
// );
// return res.data;
// };
// /*
// =========================================
// EMAIL VERIFICATION
// =========================================
// */
// export const verifyEmail = async(token)=>{


// const res =
// await api.get(
// `/auth/verify-email/${token}`
// );


// return res.data;


// };
// /*
// =========================================
// RESEND VERIFICATION EMAIL
// =========================================
// */
// export const resendVerificationEmail =
// async(email)=>{


// const res =
// await api.post(
// "/auth/resend-verification",
// {
// email,
// }
// );
// return res.data;
// };
// /*
// =========================================
// FORGOT PASSWORD
// =========================================
// */
// export const forgotPassword =
// async(email)=>{
// const res =
// await api.post(
// "/auth/forgot-password",
// {
// email,
// }
// );
// return res.data;

// };

// /*
// =========================================
// RESET PASSWORD
// =========================================
// */
// export const resetPassword =
// async(token,password)=>{


// const res =
// await api.patch(
// `/auth/reset-password/${token}`,
// {
// password,
// }
// );
// return res.data;


// };
// /*
// =========================================
// REFRESH TOKEN
// =========================================
// */

// export const refreshAccessToken =
// async()=>{
// const res =
// await api.post(
// "/auth/refresh-token"
// );
// return res.data;
// };

// export const updateUserProfile = async(profileData)=>{

// const response = await api.put(
//   "/auth/profile",
//   profileData
// );


// return response.data;

// };



import api from "./api";



/*
=========================================
LOGIN
=========================================
*/

export const loginUser = async(data)=>{

  const response = await api.post(
    "/auth/login",
    data
  );

  return response.data;

};





/*
=========================================
SIGNUP
=========================================
*/

export const signupUser = async(data)=>{

  const response = await api.post(
    "/auth/signup",
    data
  );

  return response.data;

};





/*
=========================================
GOOGLE LOGIN
=========================================
*/

export const googleLogin = ()=>{


  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://nexatech-smartbudget-backend.vercel.app/api";


  window.location.href =
    `${API_URL}/auth/google`;

};







/*
=========================================
GET CURRENT AUTH USER
=========================================
*/

export const getCurrentUser = async()=>{


  const response = await api.get(
    "/auth/me"
  );


  return response.data;


};








/*
=========================================
LOGOUT
=========================================
*/

export const logoutUser = async()=>{


  const response = await api.post(
    "/auth/logout"
  );


  return response.data;

};









/*
=========================================
EMAIL VERIFICATION
=========================================
*/

export const verifyEmail = async(token)=>{


  const response = await api.get(
    `/auth/verify-email/${token}`
  );


  return response.data;


};








/*
=========================================
RESEND VERIFICATION EMAIL
=========================================
*/

export const resendVerificationEmail =
async(email)=>{


  const response = await api.post(
    "/auth/resend-verification",
    {
      email,
    }
  );


  return response.data;


};








/*
=========================================
FORGOT PASSWORD
=========================================
*/

export const forgotPassword =
async(email)=>{


  const response = await api.post(
    "/auth/forgot-password",
    {
      email,
    }
  );


  return response.data;


};









/*
=========================================
RESET PASSWORD
=========================================
*/

export const resetPassword =
async(token,password)=>{


  const response = await api.patch(
    `/auth/reset-password/${token}`,
    {
      password,
    }
  );


  return response.data;


};










/*
=========================================
REFRESH TOKEN
=========================================
*/

export const refreshAccessToken =
async()=>{


  const response = await api.post(
    "/auth/refresh-token"
  );


  return response.data;


};
