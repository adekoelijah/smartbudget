


// import api from "./api";

// const unwrap = (res) => res.data || res;

// /* GET USER */
// // export const getUser = async () => {
// //   const res = await api.get("/users/me");
// //   return unwrap(res);
// // };
// /* GET USER */
// export const getUser = async () => {
//   const res = await api.get("/auth/me");
//   return unwrap(res);
// };

// /* UPDATE PROFILE */

// // updated to auth instead of user
// export const updateProfile = async (payload) => {
//   const res = await api.put("/auth/me", payload);
//   return unwrap(res);
// };

// /* UPLOAD AVATAR */
// export const uploadAvatar = async (file) => {
//   const form = new FormData();
//   form.append("avatar", file);


//   // updated to auth insteade of user
//   const res = await api.post("/auth/avatar", form, {
//     headers: { "Content-Type": "multipart/form-data" },
//   }); 

//   return unwrap(res);
// };


import api from "./api";



/*
=========================================
RESPONSE HANDLER
=========================================
*/

const unwrap = (response) => {

  const data = response?.data;

  if(!data){
    throw new Error(
      "Invalid server response"
    );
  }


  return data;

};





/*
=========================================
GET CURRENT USER PROFILE
=========================================
*/

export const getProfile = async()=>{


try{


const response =
await api.get(
"/auth/me"
);


return unwrap(response);


}catch(error){


console.error(
"GET_PROFILE_ERROR:",
error
);


throw error;

}


};






/*
=========================================
UPDATE PROFILE
=========================================
*/

export const updateProfile = async(
payload
)=>{


try{


const response =
await api.put(
"/auth/me",
payload
);


return unwrap(response);



}catch(error){


console.error(
"UPDATE_PROFILE_ERROR:",
error
);


throw error;


}


};







/*
=========================================
UPLOAD PROFILE AVATAR
=========================================
*/

export const uploadAvatar = async(
file
)=>{


try{


const formData =
new FormData();



formData.append(
"avatar",
file
);




const response =
await api.post(
"/auth/avatar",
formData
);



return unwrap(response);



}catch(error){


console.error(
"UPLOAD_AVATAR_ERROR:",
error
);


throw error;


}


};







/*
=========================================
REMOVE AVATAR
=========================================
*/

export const removeAvatar = async()=>{


try{


const response =
await api.delete(
"/auth/avatar"
);


return unwrap(response);



}catch(error){


console.error(
"REMOVE_AVATAR_ERROR:",
error
);


throw error;


}


};






export default {

getProfile,

updateProfile,

uploadAvatar,

removeAvatar,

};