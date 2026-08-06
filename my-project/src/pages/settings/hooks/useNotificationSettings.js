import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";


import notificationService from "../../../services/notificationService";


import {
  DEFAULT_NOTIFICATION_SETTINGS,
} from "../notificationConfig";



/*
==================================================
UTILITY FUNCTIONS
==================================================
*/


const clone = (value) =>
  JSON.parse(
    JSON.stringify(value)
  );



const isEqual = (
  first,
  second
)=>
JSON.stringify(first)
===
JSON.stringify(second);




/*
==================================================
USE NOTIFICATION SETTINGS
==================================================
*/


const useNotificationSettings = () => {



const [
settings,
setSettings
]=useState(
clone(DEFAULT_NOTIFICATION_SETTINGS)
);



const [
baseline,
setBaseline
]=useState(
clone(DEFAULT_NOTIFICATION_SETTINGS)
);





const [
loading,
setLoading
]=useState(true);





const [
saving,
setSaving
]=useState(false);





const [
error,
setError
]=useState(null);





const [
success,
setSuccess
]=useState(false);








/*
==================================================
LOAD SETTINGS
==================================================
*/


const loadSettings =
useCallback(
async()=>{


try{


setLoading(true);

setError(null);



const response =
await notificationService
.getNotificationPreferences();





const preferences =
response?.settings
||
DEFAULT_NOTIFICATION_SETTINGS;






const cloned =
clone(preferences);





setSettings(
cloned
);



setBaseline(
clone(cloned)
);





}

catch(error){


console.error(
"LOAD_NOTIFICATION_SETTINGS_ERROR:",
error
);



setError(
error?.message ||
"Unable to load notification settings."
);



}

finally{


setLoading(false);


}



},
[]
);








/*
==================================================
INITIAL LOAD
==================================================
*/


useEffect(()=>{


loadSettings();


},[
loadSettings
]);









/*
==================================================
CHANGE DETECTION
==================================================
*/


const hasChanges =
useMemo(
()=>!


isEqual(
settings,
baseline
),

[
settings,
baseline
]
);










/*
==================================================
TOGGLE SETTING
==================================================
*/


const toggleSetting =
useCallback(
(
section,
key
)=>{


setSettings(
previous=>({


...previous,


[section]:{


...previous[section],


[key]:
!previous[section]?.[key],


},


})
);



setSuccess(false);

setError(null);



},
[]
);










/*
==================================================
RESET SETTINGS
==================================================
*/


const resetSettings =
useCallback(
()=>{


setSettings(
clone(baseline)
);


setSuccess(false);

setError(null);



},
[
baseline
]
);









/*
==================================================
SAVE SETTINGS
==================================================
*/


const saveSettings =
useCallback(
async()=>{


try{


setSaving(true);

setError(null);

setSuccess(false);






const response =
await notificationService
.updateNotificationPreferences(
settings
);







if(!response?.success){


throw new Error(

response?.message ||

"Unable to save notification settings."

);


}







/*
==================================================
UPDATE LOCAL BASELINE
Avoid unnecessary reload
==================================================
*/


setBaseline(
clone(settings)
);




setSuccess(true);



return response;



}

catch(error){


console.error(
"SAVE_NOTIFICATION_SETTINGS_ERROR:",
error
);




setError(

error?.message ||

"Unable to save notification settings."

);



throw error;



}

finally{


setSaving(false);


}



},
[
settings
]
);









/*
==================================================
PUBLIC API
==================================================
*/


return {


settings,


loading,


saving,


error,


success,


hasChanges,


toggleSetting,


resetSettings,


saveSettings,


reloadSettings:
loadSettings,


};



};






export default useNotificationSettings;