import {
  User,
  ShieldCheck,
  Bell,
  SlidersHorizontal,
  CreditCard,
} from "lucide-react";


export const SETTINGS_NAVIGATION = [

{
 id:"profile",

label:"Profile",

description:
"Personal information and account identity.",

category:"Account",

icon:User,

},


{
 id:"security",

label:"Security",

description:
"Password, sessions and account protection.",

category:"Account",

icon:ShieldCheck,

},


{
 id:"notifications",

label:"Notifications",

description:
"Alerts and financial updates.",

category:"Experience",

icon:Bell,

},


{
 id:"preferences",

label:"Preferences",

description:
"Customize your SmartBudget experience.",

category:"Experience",

icon:SlidersHorizontal,

},


{
 id:"billing",

label:"Billing",

description:
"Subscription and payments.",

category:"Payments",

icon:CreditCard,

},


];