import {
  BadgeCheck,
  MailCheck,
  ShieldCheck,
  Crown,
  FileCheck,
} from "lucide-react";

import { cloneElement } from "react";



const VerificationBadge = ({
  type = "verified",
  size = "md",
  showLabel = true,
}) => {



const badgeTypes = {


verified: {

label:"Verified Account",

description:"Account identity confirmed",

icon:<BadgeCheck />,

style:
"bg-blue-50 text-blue-700 border-blue-200",

},



email:{

label:"Email Verified",

description:"Email address confirmed",

icon:<MailCheck />,

style:
"bg-emerald-50 text-emerald-700 border-emerald-200",

},




security:{

label:"Secure Account",

description:"Security protection enabled",

icon:<ShieldCheck />,

style:
"bg-indigo-50 text-indigo-700 border-indigo-200",

},





premium:{

label:"Premium Member",

description:"Premium subscription active",

icon:<Crown />,

style:
"bg-amber-50 text-amber-700 border-amber-200",

},




kyc:{

label:"Identity Verified",

description:"KYC verification completed",

icon:<FileCheck />,

style:
"bg-purple-50 text-purple-700 border-purple-200",

},


};





const badge =
badgeTypes[type] ||
badgeTypes.verified;






const sizeStyles = {


sm:
"px-2.5 py-1 text-xs gap-1.5",


md:
"px-3 py-1.5 text-sm gap-2",


lg:
"px-4 py-2 text-base gap-2.5",


};






return (

<div
className={`
inline-flex
items-center
rounded-full
border
font-medium
${badge.style}
${sizeStyles[size]}
`}
>


<span
  className="
    flex items-center
  "
>

{
cloneIcon(
badge.icon,
size
)
}

</span>



{
showLabel && (

<span>

{badge.label}

</span>

)

}



</div>

);

};









function cloneIcon(icon, size) {
  const iconSize = {
    sm: 14,
    md: 16,
    lg: 20,
  }[size];

  return cloneElement(icon, {
    size: iconSize,
  });
}


export default VerificationBadge;