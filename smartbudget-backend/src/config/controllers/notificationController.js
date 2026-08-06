import Notification from "../../models/Notification.js";
import User from "../../models/User.js";



/*
==================================================
HELPER FUNCTIONS
==================================================
*/

const sendError = (
  res,
  status,
  message
)=>{

return res.status(status).json({

success:false,

message,

});

};





const sendSuccess = (
res,
data={}
)=>{

return res.status(200).json({

success:true,

...data,

});

};





const mergePreferences = (
current={},
updates={}
)=>{

return {

...current,

...updates,

financial:{
...current.financial,
...updates.financial,
},

security:{
...current.security,
...updates.security,
},

communication:{
...current.communication,
...updates.communication,
},

channels:{
...current.channels,
...updates.channels,
},

};

};







/*
==================================================
GET NOTIFICATIONS
==================================================
*/

export const getNotifications =
async(
req,
res
)=>{

try{


const userId =
req.user.id;



let {

page=1,

limit=20,

type,

isRead,

}=req.query;



page =
Math.max(
Number(page),
1
);


limit =
Math.min(
Math.max(Number(limit),1),
50
);




const query={

user:userId,

};




if(type){

query.type = type;

}




if(isRead !== undefined){

query.isRead =
isRead === "true";

}






const skip =
(page - 1) * limit;






const [

notifications,

total,

]=await Promise.all([


Notification.find(query)

.sort({
createdAt:-1
})

.skip(skip)

.limit(limit)

.lean(),




Notification.countDocuments(
query
)


]);








return sendSuccess(
res,
{

notifications,


pagination:{

page,

limit,

total,

pages:
Math.ceil(
total / limit
),

},

}
);



}

catch(error){


console.error(
"GET_NOTIFICATIONS_ERROR:",
error
);



return sendError(

res,

500,

"Unable to fetch notifications"

);


}


};









/*
==================================================
GET UNREAD COUNT
==================================================
*/

export const getUnreadCount =
async(
req,
res
)=>{


try{


const count =
await Notification.countDocuments({

user:req.user.id,

isRead:false,

});




return sendSuccess(
res,
{
count
}
);



}

catch(error){


console.error(
"GET_UNREAD_COUNT_ERROR:",
error
);



return sendError(

res,

500,

"Unable to fetch unread count"

);


}



};









/*
==================================================
MARK NOTIFICATION AS READ
==================================================
*/

export const markNotificationAsRead =
async(
req,
res
)=>{

try{


const notification =
await Notification.findOne({

_id:req.params.id,

user:req.user.id,

});





if(!notification){

return sendError(

res,

404,

"Notification not found"

);

}





if(!notification.isRead){

notification.isRead=true;

notification.readAt =
new Date();


await notification.save();

}





return sendSuccess(

res,

{
notification
}

);



}

catch(error){


console.error(

"MARK_NOTIFICATION_READ_ERROR:",

error

);



return sendError(

res,

500,

"Unable to update notification"

);


}



};









/*
==================================================
MARK ALL NOTIFICATIONS AS READ
==================================================
*/

export const markAllNotificationsAsRead =
async(
req,
res
)=>{

try{


await Notification.updateMany(

{

user:req.user.id,

isRead:false,

},

{

$set:{

isRead:true,

readAt:new Date(),

}

}

);




return sendSuccess(

res,

{

message:
"All notifications marked as read"

}

);



}

catch(error){


console.error(

"MARK_ALL_NOTIFICATIONS_READ_ERROR:",

error

);



return sendError(

res,

500,

"Unable to update notifications"

);



}


};









/*
==================================================
DELETE NOTIFICATION
==================================================
*/

export const deleteNotification =
async(
req,
res
)=>{

try{


const notification =
await Notification.findOne({

_id:req.params.id,

user:req.user.id,

});





if(!notification){

return sendError(

res,

404,

"Notification not found"

);

}





await notification.deleteOne();






return sendSuccess(

res,

{

message:
"Notification deleted successfully"

}

);



}

catch(error){


console.error(

"DELETE_NOTIFICATION_ERROR:",

error

);



return sendError(

res,

500,

"Unable to delete notification"

);


}


};









/*
==================================================
CLEAR ALL NOTIFICATIONS
==================================================
*/

export const clearNotifications =
async(
req,
res
)=>{

try{


await Notification.deleteMany({

user:req.user.id,

});





return sendSuccess(

res,

{

message:
"Notifications cleared successfully"

}

);



}

catch(error){


console.error(

"CLEAR_NOTIFICATIONS_ERROR:",

error

);



return sendError(

res,

500,

"Unable to clear notifications"

);


}


};









/*
==================================================
GET NOTIFICATION PREFERENCES
==================================================
*/

export const getNotificationPreferences =
async(
req,
res
)=>{

try{


const user =
await User.findById(
req.user.id
)

.select(
"notificationSettings"
)

.lean();





if(!user){

return sendError(

res,

404,

"User not found"

);

}





return sendSuccess(

res,

{

settings:
user.notificationSettings || {}

}

);



}

catch(error){


console.error(

"GET_NOTIFICATION_PREFERENCES_ERROR:",

error

);



return sendError(

res,

500,

"Unable to fetch notification preferences"

);


}



};









/*
==================================================
UPDATE NOTIFICATION PREFERENCES
==================================================
*/

export const updateNotificationPreferences =
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

return sendError(

res,

404,

"User not found"

);

}





user.notificationSettings =
mergePreferences(

user.notificationSettings,

req.body

);





await user.save();






return sendSuccess(

res,

{

message:
"Notification preferences updated successfully",

settings:
user.notificationSettings

}

);



}

catch(error){


console.error(

"UPDATE_NOTIFICATION_PREFERENCES_ERROR:",

error

);



return sendError(

res,

500,

"Unable to update notification preferences"

);


}


};