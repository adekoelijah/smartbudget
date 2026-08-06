import Notification from "../models/Notification.js";
import User from "../models/User.js";



/*
==================================================
CREATE NOTIFICATION
==================================================
*/

export const createNotification = async ({
  userId,
  title,
  message,
  type,
  priority = "normal",
  channel = "in_app",
  actionUrl = null,
  resourceId = null,
  resourceModel = null,
  metadata = {},
}) => {


try {


const notification =
await Notification.create({

user:userId,

title,

message,

type,

priority,

channel,

actionUrl,

resourceId,

resourceModel,

metadata,

});



return notification;



}

catch(error){


console.error(
"CREATE_NOTIFICATION_ERROR:",
error
);


throw error;


}


};










/*
==================================================
GET USER NOTIFICATIONS
==================================================
*/

export const getUserNotifications =
async ({
userId,
page = 1,
limit = 20,
type,
isRead,
})=>{


const query = {

user:userId,

};



if(type){

query.type = type;

}



if(isRead !== undefined){

query.isRead =
isRead;

}





const skip =
(Number(page)-1)
*
Number(limit);





const [
notifications,
total
]=await Promise.all([


Notification.find(query)

.sort({
createdAt:-1
})

.skip(skip)

.limit(
Number(limit)
),



Notification.countDocuments(
query
)



]);






return {

notifications,

pagination:{

page:Number(page),

limit:Number(limit),

total,

pages:
Math.ceil(
total / Number(limit)
)

}

};



};










/*
==================================================
GET UNREAD COUNT
==================================================
*/

export const getUnreadNotificationCount =
async(userId)=>{


return Notification.countDocuments({

user:userId,

isRead:false,

});


};










/*
==================================================
MARK ONE AS READ
==================================================
*/

export const markNotificationRead =
async({
userId,
notificationId,
})=>{


const notification =
await Notification.findOne({

_id:notificationId,

user:userId,

});




if(!notification){

throw new Error(
"Notification not found"
);

}





notification.isRead =
true;


notification.readAt =
new Date();



await notification.save();




return notification;


};










/*
==================================================
MARK ALL READ
==================================================
*/

export const markAllNotificationsRead =
async(userId)=>{


return Notification.updateMany(

{

user:userId,

isRead:false,

},

{

$set:{

isRead:true,

readAt:new Date(),

}

}

);


};










/*
==================================================
DELETE NOTIFICATION
==================================================
*/

export const removeNotification =
async({
userId,
notificationId,
})=>{


const notification =
await Notification.findOne({

_id:notificationId,

user:userId,

});





if(!notification){

throw new Error(
"Notification not found"
);

}




await notification.deleteOne();


return true;


};










/*
==================================================
CLEAR USER NOTIFICATIONS
==================================================
*/

export const clearUserNotifications =
async(userId)=>{


return Notification.deleteMany({

user:userId,

});


};










/*
==================================================
GET USER NOTIFICATION SETTINGS
==================================================
*/

export const getUserNotificationPreferences =
async(userId)=>{


const user =
await User.findById(
userId
)
.select(
"notificationSettings"
);




return (
user?.notificationSettings ||
{}
);


};










/*
==================================================
UPDATE USER NOTIFICATION SETTINGS
==================================================
*/

export const updateUserNotificationPreferences =
async({
userId,
settings,
})=>{


const user =
await User.findByIdAndUpdate(

userId,

{

$set:{

notificationSettings:
settings,

}

},

{

new:true,

runValidators:true,

}

)
.select(
"notificationSettings"
);





return user.notificationSettings;


};










/*
==================================================
SMARTBUDGET EVENT HELPERS
==================================================
*/


export const createTransactionNotification =
async({
userId,
title,
message,
metadata={},
})=>{


return createNotification({

userId,

type:
"transaction",

title,

message,

priority:
"normal",

metadata,

});


};








export const createBudgetNotification =
async({
userId,
title,
message,
metadata={}
})=>{


return createNotification({

userId,

type:
"budget",

title,

message,

priority:
"high",

metadata,

});


};








export const createSecurityNotification =
async({
userId,
title,
message,
metadata={}
})=>{


return createNotification({

userId,

type:
"security",

title,

message,

priority:
"critical",

metadata,

});


};