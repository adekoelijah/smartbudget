import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit3,
} from "lucide-react";


import {
  useEffect,
  useState,
} from "react";


import SaveBar from "./SaveBar";





const createInitialData = (user)=>({

  firstName:user?.firstName ?? "",
  lastName:user?.lastName ?? "",
  email:user?.email ?? "",
  phone:user?.phone ?? "",
  country:user?.country ?? "",
  dateOfBirth:user?.dateOfBirth ?? "",

});






const PersonalInformation = ({
  user,
  onUpdate,
})=>{



const [
isEditing,
setIsEditing
]=useState(false);



const [
isSaving,
setIsSaving
]=useState(false);



const [
error,
setError
]=useState("");



const [
formData,
setFormData
]=useState(
()=>createInitialData(user)
);






/*
================================
SYNC USER
Only when account changes
================================
*/


useEffect(()=>{


if(!user?._id)
return;


setFormData(
createInitialData(user)
);


},[
user?._id
]);









const initialData =
createInitialData(user);





const hasChanges =
Object.keys(formData)
.some(
(key)=>
formData[key] !== initialData[key]
);











const handleChange=(e)=>{


const {
name,
value,
}=e.target;



setError("");



setFormData(prev=>({

...prev,

[name]:value,

}));



};









const validateForm=()=>{


if(
!formData.firstName.trim()
)

return "First name is required";



if(
!formData.lastName.trim()
)

return "Last name is required";



if(
formData.phone &&
formData.phone.length < 7
)

return "Please enter a valid phone number";



return null;


};









const handleSave=async()=>{


if(isSaving)
return;



const validationError =
validateForm();



if(validationError){

setError(validationError);

return;

}




try{


setIsSaving(true);

setError("");



await onUpdate?.(
formData
);



setIsEditing(false);



}



catch(error){


console.error(
"Profile update failed",
error
);



setError(
error?.response?.data?.message ||
"Unable to update profile"
);



}


finally{


setIsSaving(false);


}



};











const handleCancel=()=>{


setFormData(
createInitialData(user)
);


setError("");

setIsEditing(false);



};









return (

<section
  className="
    p-6
    bg-white
    border border-slate-200 rounded-3xl
    shadow-sm
  "
>





<header
  className="
    flex flex-col sm:flex-row sm:justify-between sm:items-center
    mb-6
    gap-4
  "
>


<div>


<h3
  className="
    font-semibold text-slate-900 text-lg
  "
>

Personal Information

</h3>



<p
  className="
    mt-1
    text-slate-500 text-sm
  "
>

Manage your personal account details securely.

</p>


</div>








{
!isEditing &&

<button

onClick={()=>setIsEditing(true)}

className="
inline-flex
items-center
justify-center
gap-2
px-4
py-2.5
rounded-xl
bg-blue-600
hover:bg-blue-700
text-white
text-sm
font-medium
transition
"

>

<Edit3 size={16}/>

Edit Information

</button>

}



</header>







{
error && (

<div
  className="
    mb-5 px-4 py-3
    text-red-600 text-sm
    bg-red-50
    border border-red-200 rounded-xl
  "
>

{error}

</div>

)

}








<div
  className="
    grid grid-cols-1 md:grid-cols-2
    gap-5
  "
>






<FormField

icon={<User size={18}/>}

label="First Name"

name="firstName"

value={formData.firstName}

disabled={!isEditing}

onChange={handleChange}

/>







<FormField

icon={<User size={18}/>}

label="Last Name"

name="lastName"

value={formData.lastName}

disabled={!isEditing}

onChange={handleChange}

/>







<FormField

icon={<Mail size={18}/>}

label="Email Address"

name="email"

type="email"

value={formData.email}

disabled

/>







<FormField

icon={<Phone size={18}/>}

label="Phone Number"

name="phone"

value={formData.phone}

disabled={!isEditing}

onChange={handleChange}

/>







<FormField

icon={<MapPin size={18}/>}

label="Country"

name="country"

value={formData.country}

disabled={!isEditing}

onChange={handleChange}

/>







<FormField

icon={<Calendar size={18}/>}

label="Date of Birth"

name="dateOfBirth"

type="date"

value={
formatDateInput(
formData.dateOfBirth
)
}

disabled={!isEditing}

onChange={handleChange}

/>



</div>









<SaveBar

visible={
isEditing && hasChanges
}

isSaving={isSaving}

hasError={Boolean(error)}

onSave={handleSave}

onCancel={handleCancel}

/>






</section>


);

};









function formatDateInput(date){


if(!date)
return "";



const parsed =
new Date(date);



if(
Number.isNaN(
parsed.getTime()
)
)

return "";



return parsed
.toISOString()
.slice(0,10);


}










function FormField({

icon,
label,
name,
type="text",
value,
disabled,
onChange,

}){


return (

<div>


<label
  htmlFor={name}
  className="
    block
    mb-2
    font-medium text-slate-700 text-sm
  "
>

{label}

</label>






<div

className={`
flex
items-center
gap-3
rounded-xl
border
px-4
py-3

${
disabled
?
"bg-slate-50 border-slate-200"
:
"bg-white border-blue-300 focus-within:ring-2 focus-within:ring-blue-100"
}

`}

>


<span
  className="
    text-slate-400
  "
>

{icon}

</span>





<input
  id={name}

name={name}

type={type}

value={value}

disabled={disabled}

onChange={onChange}

autoComplete="off"
  className="
    w-full
    text-slate-900 text-sm
    bg-transparent
    outline-none
    disabled:cursor-not-allowed
  "
  /
>



</div>


</div>

);


}




export default PersonalInformation;