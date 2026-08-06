



import jwt from "jsonwebtoken";

import User from "../models/User.js";

import Session from "../models/Session.js";





const protect = async(
req,
res,
next
)=>{


try{


const authHeader =
req.headers.authorization;




if(
!authHeader ||
!authHeader.startsWith("Bearer ")
){


return res.status(401).json({

success:false,

message:
"Authorization token required"

});


}




const token =
authHeader.split(" ")[1];





if(!token){


return res.status(401).json({

success:false,

message:
"No token provided"

});


}







const decoded =
jwt.verify(
token,
process.env.JWT_SECRET
);







if(
decoded.type !== "access"
){


return res.status(401).json({

success:false,

message:
"Invalid token type"

});


}







/*
================================
SESSION VALIDATION
================================
*/


if(!decoded.sessionId){


return res.status(401).json({

success:false,

message:
"Invalid session"

});


}







const session =
await Session.findOne({

_id:decoded.sessionId,

user:decoded.id,

isActive:true,

isRevoked:false

});






if(!session){


return res.status(401).json({

success:false,

message:
"Session expired or revoked"

});


}









/*
================================
USER VALIDATION
================================
*/


const user =
await User.findById(
decoded.id
)
.select("-password");






if(!user){


return res.status(401).json({

success:false,

message:
"User not found"

});


}







if(
!user.isEmailVerified
){


return res.status(403).json({

success:false,

message:
"Please verify your email before continuing."

});


}







/*
================================
UPDATE ACTIVITY
================================
*/


session.lastActiveAt =
new Date();


await session.save();







req.user = user;

req.session = session;







next();



}

catch(error){



if(
error.name === "TokenExpiredError"
){


return res.status(401).json({

success:false,

message:
"Session expired. Please login again."

});


}






if(
error.name === "JsonWebTokenError"
){


return res.status(401).json({

success:false,

message:
"Invalid authentication token."

});


}





console.error(
"Auth middleware error:",
error
);



return res.status(401).json({

success:false,

message:
"Authentication failed."

});



}


};

export default protect;