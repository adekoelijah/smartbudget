import bcrypt from "bcryptjs";

import User from "../models/User.js";

import Session from "../models/Session.js";





/*
==================================================
CHANGE PASSWORD
==================================================
*/

export const changePassword = async (
req,
res
) => {

try {


const {
currentPassword,
newPassword,
} = req.body;



const userId = req.user.id;



if(
!currentPassword ||
!newPassword
){

return res.status(400).json({

message:
"Current password and new password are required"

});

}






const user =
await User.findById(userId)
.select("+password");



if(!user){

return res.status(404).json({

message:
"User not found"

});

}






const passwordMatch =
await bcrypt.compare(
currentPassword,
user.password
);



if(!passwordMatch){

return res.status(401).json({

message:
"Current password is incorrect"

});

}





const hashedPassword =
await bcrypt.hash(
newPassword,
12
);





user.password =
hashedPassword;



await user.save();





return res.status(200).json({

success:true,

message:
"Password changed successfully"

});



}

catch(error){

console.error(
"Change password error:",
error
);


return res.status(500).json({

message:
"Unable to change password"

});

}


};









/*
==================================================
ENABLE 2FA
==================================================
*/

export const enableTwoFactor =
async(
req,
res
)=>{


try{


const user =
await User.findById(
req.user.id
);



if(!user){

return res.status(404).json({

message:
"User not found"

});

}



user.twoFactorEnabled =
true;



await user.save();




return res.json({

success:true,

message:
"Two-factor authentication enabled"

});



}

catch(error){


console.error(
"Enable 2FA error:",
error
);



return res.status(500).json({

message:
"Unable to enable 2FA"

});


}


};









/*
==================================================
DISABLE 2FA
==================================================
*/

export const disableTwoFactor =
async(
req,
res
)=>{


try{


const user =
await User.findById(
req.user.id
);



if(!user){

return res.status(404).json({

message:
"User not found"

});

}




user.twoFactorEnabled =
false;



await user.save();





return res.json({

success:true,

message:
"Two-factor authentication disabled"

});



}

catch(error){

console.error(
"Disable 2FA error:",
error
);



return res.status(500).json({

message:
"Unable to disable 2FA"

});


}


};









/*
==================================================
GET LOGIN ACTIVITY
==================================================
*/

export const getLoginActivity =
async(
req,
res
)=>{


try{


const sessions =
await Session.find({

user:req.user.id,

isActive:true,

})

.sort({

lastActiveAt:-1

})

.select(
"-refreshTokenHash"
);







return res.json({

success:true,

sessions

});


}

catch(error){


console.error(
"Get sessions error:",
error
);



return res.status(500).json({

message:
"Unable to fetch login activity"

});


}


};









/*
==================================================
REVOKE SINGLE SESSION
==================================================
*/

export const revokeSession =
async(
req,
res
)=>{


try{


const {
sessionId
}=req.params;



const session =
await Session.findOne({

_id:sessionId,

user:req.user.id

});






if(!session){

return res.status(404).json({

message:
"Session not found"

});

}





await session.revoke(
"User revoked device"
);






return res.json({

success:true,

message:
"Device removed successfully"

});


}

catch(error){


console.error(
"Revoke session error:",
error
);



return res.status(500).json({

message:
"Unable to revoke session"

});


}


};









/*
==================================================
LOGOUT ALL DEVICES
==================================================
*/

export const logoutAllDevices =
async(
req,
res
)=>{


try{


await Session.updateMany(

{
user:req.user.id,

isActive:true,

},

{

$set:{

isActive:false,

isRevoked:true,

revokedAt:new Date(),

revokedReason:
"Logged out all devices"

}

}

);





return res.json({

success:true,

message:
"All devices logged out"

});


}

catch(error){


console.error(
"Logout all error:",
error
);



return res.status(500).json({

message:
"Unable to logout devices"

});


}


};