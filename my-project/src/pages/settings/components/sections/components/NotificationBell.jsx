import {
  Bell,
} from "lucide-react";


import {
  useNotifications,
} from "../../context/NotificationContext";


import {
  useState,
  useRef,
  useEffect,
} from "react";


import NotificationDropdown from "./NotificationDropdown";




/*
==================================================
COMPONENT
==================================================
*/


const NotificationBell = ()=>{


const {
  unreadCount,
} = useNotifications();




const [
  open,
  setOpen
]=useState(false);




const containerRef =
useRef(null);







/*
==================================================
CLOSE WHEN CLICK OUTSIDE
==================================================
*/


useEffect(()=>{


const handleClickOutside =
(event)=>{


if(

containerRef.current &&

!containerRef.current.contains(
event.target
)

){

setOpen(false);

}


};




document.addEventListener(
"mousedown",
handleClickOutside
);



return ()=>{


document.removeEventListener(
"mousedown",
handleClickOutside
);


};


},[]);









/*
==================================================
KEYBOARD ACCESSIBILITY
==================================================
*/


const handleKeyDown =
(event)=>{


if(
event.key === "Escape"
){

setOpen(false);

}



};









return (

<div
  ref={containerRef}

onKeyDown={handleKeyDown}
  className="
    relative
  "
>





<button

type="button"

onClick={()=>setOpen(prev=>!prev)}

aria-label="Notifications"

aria-expanded={open}

className="
relative

flex
justify-center
items-center

w-11
h-11

text-slate-600

bg-white

border
border-slate-200

hover:bg-slate-50

rounded-2xl

shadow-sm

transition

focus:outline-none

focus:ring-2

focus:ring-blue-500

"

>


<Bell size={20}/>






{
unreadCount > 0 && (

<span
  className="
    absolute flex justify-center items-center
    min-w-[20px] h-5
    px-1.5
    font-semibold text-[11px] text-white
    bg-red-600
    border-2 border-white rounded-full
    -top-1 -right-1
  "
>

{
unreadCount > 99
?
"99+"
:
unreadCount
}

</span>

)

}







</button>









{
open && (

<NotificationDropdown

onClose={()=>setOpen(false)}

/>

)

}






</div>

);


};




export default NotificationBell;