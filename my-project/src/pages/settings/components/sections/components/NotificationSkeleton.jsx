import {
  Fragment,
} from "react";



/*
==================================================
NOTIFICATION SKELETON
==================================================
*/


const NotificationSkeleton = ({
  count = 4,
}) => {


return (

<div
  className="
    space-y-0
  "
  aria-label="Loading notifications"

aria-busy="true"
>





{

Array.from({
  length: count
})

.map((_, index)=>(


<Fragment key={index}>


<div
  className="
    flex
    p-4
    border-slate-100 border-b
    gap-3
  "
>


{/* ICON PLACEHOLDER */}

<div
  className="
    w-10 h-10
    bg-slate-200
    rounded-xl
    animate-pulse
    shrink-0
  "
  /
>







{/* CONTENT PLACEHOLDER */}

<div
  className="
    flex-1
    space-y-3
  "
>


<div
  className="
    w-3/4 h-3
    bg-slate-200
    rounded-full
    animate-pulse
  "
  /
>




<div
  className="
    w-full h-2.5
    bg-slate-100
    rounded-full
    animate-pulse
  "
  /
>




<div
  className="
    w-1/2 h-2.5
    bg-slate-100
    rounded-full
    animate-pulse
  "
  /
>






<div
  className="
    flex
    mt-3
    gap-3
  "
>


<div
  className="
    w-12 h-2
    bg-slate-100
    rounded-full
    animate-pulse
  "
  /
>


<div
  className="
    w-16 h-2
    bg-slate-100
    rounded-full
    animate-pulse
  "
  /
>



</div>




</div>




</div>




</Fragment>


))

}



</div>


);


};



export default NotificationSkeleton;