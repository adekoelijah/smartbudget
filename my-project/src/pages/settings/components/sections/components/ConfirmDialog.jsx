import {
  X,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";



const ConfirmDialog = ({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) => {



if (!isOpen) return null;





const variants = {


danger: {

icon:
<AlertTriangle size={24}/>,

iconStyle:
"bg-red-50 text-red-600",

button:
"bg-red-600 hover:bg-red-700",

},




warning: {

icon:
<AlertTriangle size={24}/>,

iconStyle:
"bg-amber-50 text-amber-600",

button:
"bg-amber-600 hover:bg-amber-700",

},




success: {

icon:
<CheckCircle2 size={24}/>,

iconStyle:
"bg-emerald-50 text-emerald-600",

button:
"bg-emerald-600 hover:bg-emerald-700",

},


};




const style =
variants[variant] ||
variants.danger;







return (

<div
  className="
    z-50 fixed inset-0 flex justify-center items-center
    px-4
    bg-slate-950/40
    backdrop-blur-sm
  "
>


<div
  className="
    w-full max-w-md
    p-6
    bg-white
    border border-slate-200 rounded-3xl
    shadow-xl
  "
>



{/* Header */}

<div
  className="
    flex justify-between items-start
    gap-4
  "
>


<div
  className="
    flex items-center
    gap-3
  "
>


<div
className={`
h-12
w-12
rounded-2xl
flex
items-center
justify-center

${style.iconStyle}
`}
>

{style.icon}

</div>





<div>

<h3
  className="
    font-semibold text-slate-900 text-lg
  "
>

{title}

</h3>


</div>


</div>





<button
  onClick={onCancel}

disabled={loading}
  className="
    p-2
    text-slate-400
    hover:bg-slate-100
    rounded-xl
    transition
  "
>

<X size={20}/>

</button>



</div>








{/* Description */}

<p
  className="
    mt-5
    text-slate-500 text-sm leading-relaxed
  "
>

{description}

</p>








{/* Actions */}

<div
  className="
    flex flex-col-reverse sm:flex-row
    mt-8
    gap-3
  "
>



<button
  onClick={onCancel}

disabled={loading}
  className="
    flex-1
    px-5 py-3
    font-medium text-slate-700 text-sm
    hover:bg-slate-50
    border border-slate-300 rounded-xl
    disabled:opacity-50
  "
>

{cancelText}

</button>






<button

onClick={onConfirm}

disabled={loading}

className={`
flex-1
inline-flex
items-center
justify-center
gap-2
rounded-xl
px-5
py-3
text-sm
font-medium
text-white
transition
disabled:opacity-60

${style.button}
`}

>


{
loading
?

<>

<Loader2
  size={16}
  className="
    animate-spin
  "
  /
>

Processing...

</>


:

confirmText

}



</button>




</div>





</div>


</div>

);

};



export default ConfirmDialog;