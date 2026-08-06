import {
  Globe,
  LayoutGrid,
  Clock3,
  Wallet,
  Languages,
  ShieldCheck,
  Save,
} from "lucide-react";

import { usePreferences } from "../../hooks/usePreferences";


/*
=========================================
REUSABLE FIELD COMPONENT
=========================================
*/

const Field = ({
  icon: Icon,
  label,
  description,
  children,
}) => {

  return (
    <div
      className="
        flex flex-col
        py-5
        border-slate-200 border-b last:border-none
        gap-4
      "
    >

      <div
        className="
          flex items-start
          gap-3
        "
      >

        <div
          className="
            flex justify-center items-center
            w-10 h-10
            text-slate-700
            bg-slate-100
            rounded-xl
            shrink-0
          "
        >
          <Icon size={18}/>
        </div>


        <div>

          <h4
            className="
              font-semibold text-slate-900 text-sm
            "
          >
            {label}
          </h4>


          <p
            className="
              max-w-xl
              mt-1
              text-slate-500 text-xs leading-relaxed
            "
          >
            {description}
          </p>

        </div>

      </div>


      <div
        className="
          md:flex md:justify-end
          w-full
        "
      >

        <div
          className="
            w-full md:w-[240px]
          "
        >

          {children}

        </div>

      </div>


    </div>
  );
};




/*
=========================================
SELECT COMPONENT
=========================================
*/

const Select = ({
  value,
  onChange,
  children,
}) => {


return (

<select
  value={value}
  onChange={onChange}
  className="
    w-full h-11
    px-4
    font-medium text-slate-800 text-sm
    bg-slate-50 focus:bg-white
    border border-slate-200 focus:border-slate-400 rounded-2xl outline-none
    transition
  "
>

{children}

</select>

);

};




/*
=========================================
MAIN COMPONENT
=========================================
*/


const PreferenceSettings = () => {


const {
  preferences,
  loading,
  message,
  updatePreference,
  savePreferences,
}=usePreferences();




const handleLanguageChange=(value)=>{


updatePreference(
 "language",
 value
);


document.documentElement.lang=value;


};





const handleSave=async()=>{


await savePreferences();


};




return (

<div
  className="
    space-y-6
  "
>


{/* HEADER */}

<section
  className="
    relative overflow-hidden
    p-6
    bg-white
    border border-slate-200 rounded-3xl
    shadow-sm
  "
>


<div
  className="
    z-10 relative flex items-center
    gap-4
  "
>


<div
  className="
    flex justify-center items-center
    w-14 h-14
    text-white
    bg-slate-900
    rounded-2xl
  "
>

<ShieldCheck size={24}/>

</div>



<div>

<h2
  className="
    font-bold text-slate-900 text-xl
  "
>
Preferences Center
</h2>


<p
  className="
    mt-2
    text-slate-500 text-sm
  "
>
Manage your SmartBudget regional and
display experience.
</p>


</div>


</div>


</section>





{/* DISPLAY */}

<section
  className="
    p-6
    bg-white
    border border-slate-200 rounded-3xl
    shadow-sm
  "
>


<h3
  className="
    mb-2
    font-semibold text-slate-400 text-xs uppercase tracking-[0.2em]
  "
>
Display
</h3>



<Field

icon={LayoutGrid}

label="Layout Density"

description="
Controls spacing and sizing across your dashboard experience.
"

>


<Select

value={preferences.density}

onChange={(e)=>
updatePreference(
"density",
e.target.value
)
}

>


<option value="comfortable">
Comfortable
</option>


<option value="compact">
Compact
</option>


</Select>


</Field>



</section>





{/* REGIONAL */}

<section
  className="
    p-6
    bg-white
    border border-slate-200 rounded-3xl
    shadow-sm
  "
>


<h3
  className="
    mb-2
    font-semibold text-slate-400 text-xs uppercase tracking-[0.2em]
  "
>
Regional
</h3>




<Field

icon={Wallet}

label="Currency"

description="
Controls currency formatting across transactions and reports.
"

>


<Select

value={preferences.currency}

onChange={(e)=>
updatePreference(
"currency",
e.target.value
)
}

>


<option value="NGN">
₦ Nigerian Naira
</option>


<option value="USD">
$ US Dollar
</option>


<option value="GBP">
£ British Pound
</option>


<option value="EUR">
€ Euro
</option>


</Select>


</Field>





<Field

icon={Clock3}

label="Timezone"

description="
Used for transaction timestamps and financial reports.
"

>


<Select

value={preferences.timezone}

onChange={(e)=>
updatePreference(
"timezone",
e.target.value
)
}

>


<option value="Africa/Lagos">
Africa/Lagos
</option>


<option value="UTC">
UTC
</option>


<option value="Europe/London">
Europe/London
</option>


<option value="America/New_York">
America/New_York
</option>


</Select>


</Field>





<Field

icon={Languages}

label="Language"

description="
Application language preference.
"

>


<Select

value={preferences.language}

onChange={(e)=>
handleLanguageChange(
e.target.value
)
}

>


<option value="en">
English
</option>


</Select>


</Field>





<Field

icon={Globe}

label="Region"

description="
Your account region used for localization.
"

>


<div
  className="
    inline-flex items-center
    px-4 py-2
    font-semibold text-emerald-700 text-xs
    bg-emerald-50
    border border-emerald-100 rounded-2xl
  "
>

Nigeria

</div>


</Field>



</section>





{/* SAVE */}

<div
  className="
    flex justify-end
  "
>


<button
  onClick={handleSave}

disabled={loading}
  className="
    flex items-center
    px-6 py-3
    font-semibold text-white text-sm
    bg-slate-900 hover:bg-black
    rounded-2xl
    disabled:opacity-60 transition
    gap-2
  "
>


<Save size={18}/>


{
loading
?
"Saving..."
:
"Save Preferences"
}



</button>


</div>





{
message &&

<div
  className="
    px-4 py-3
    font-medium text-emerald-700 text-sm text-center
    bg-emerald-50
    border border-emerald-100 rounded-2xl
  "
>

{message}

</div>

}



</div>

);

};


export default PreferenceSettings;