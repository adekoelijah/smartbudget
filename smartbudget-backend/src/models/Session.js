import mongoose from "mongoose";



const sessionSchema = new mongoose.Schema(
{

/*
====================================
USER OWNERSHIP
====================================
*/

user: {

type: mongoose.Schema.Types.ObjectId,

ref: "User",

required: true,

index: true,

},





/*
====================================
AUTH TOKENS
====================================
*/


refreshTokenHash: {

type: String,

required: true,

select: false,

},





/*
====================================
DEVICE INFORMATION
====================================
*/


device: {

type: String,

default: "Unknown Device",

},



deviceType: {

type: String,

enum: [
"desktop",
"mobile",
"tablet",
"unknown",
],

default: "unknown",

},




browser: {

type: String,

default: "Unknown Browser",

},




operatingSystem: {

type: String,

default: "Unknown OS",

},





/*
====================================
NETWORK INFORMATION
====================================
*/


ipAddress: {

type: String,

default: null,

},




location: {

country: {

type:String,

default:null,

},


city: {

type:String,

default:null,

},


},

 





/*
====================================
SESSION STATUS
====================================
*/


isActive: {

type:Boolean,

default:true,

index:true,

},





isCurrent: {

type:Boolean,

default:false,

},





isRevoked: {

type:Boolean,

default:false,

},





revokedAt: {

type:Date,

default:null,

},





revokedReason: {

type:String,

default:null,

},







/*
====================================
SECURITY FLAGS
====================================
*/


suspicious: {

type:Boolean,

default:false,

},




suspiciousReason: {

type:String,

default:null,

},







/*
====================================
ACTIVITY TRACKING
====================================
*/


lastActiveAt: {

type:Date,

default:Date.now,

},




createdAt: {

type:Date,

default:Date.now,

},




expiresAt: {

type:Date,

required:true,

},




},
{

timestamps:true,

}
);









/*
====================================
INDEXES
====================================
*/


/*
Fast session lookup
*/

sessionSchema.index({

user:1,

isActive:1,

});





/*
Automatic cleanup
*/

sessionSchema.index(
{
expiresAt:1
},
{
expireAfterSeconds:0
}
);










/*
====================================
HELPERS
====================================
*/



sessionSchema.methods.revoke =
function(reason="User logout"){

this.isActive=false;

this.isRevoked=true;

this.revokedAt=new Date();

this.revokedReason=reason;


return this.save();

};









sessionSchema.methods.touch =
function(){

this.lastActiveAt=new Date();

return this.save();

};









export default mongoose.model(
"Session",
sessionSchema
);