import {
  Save,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";



const SaveBar = ({
  visible = false,
  isSaving = false,
  hasError = false,
  message,
  onSave,
  onCancel,
}) => {


  if (!visible) return null;



  return (

    <div
      className="
        right-0 bottom-0 left-0 z-40 fixed
        bg-white/95
        border-slate-200 border-t
        shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md
      "
    >

      <div
        className="
          max-w-7xl
          mx-auto px-4 sm:px-6 lg:px-8 py-4
        "
      >


        <div
          className="
            flex flex-col sm:flex-row sm:justify-between sm:items-center
            gap-4
          "
        >


          {/* Status Message */}

          <div
            className="
              flex items-center
              gap-3
            "
          >

            {
              hasError
              ?

              <div
                className="
                  flex justify-center items-center
                  w-9 h-9
                  text-red-600
                  bg-red-50
                  rounded-xl
                "
              >
                <AlertCircle size={18}/>
              </div>

              :

              <div
                className="
                  flex justify-center items-center
                  w-9 h-9
                  text-blue-600
                  bg-blue-50
                  rounded-xl
                "
              >
                <Save size={18}/>
              </div>

            }



            <div>

              <p
                className="
                  font-medium text-slate-900 text-sm
                "
              >
                {
                  hasError
                  ?
                  "Unable to save changes"
                  :
                  "Unsaved changes"
                }
              </p>



              <p
                className="
                  mt-0.5
                  text-slate-500 text-xs
                "
              >
                {
                  message
                  ||
                  (
                    hasError
                    ?
                    "Please review your information and try again."
                    :
                    "Save your updates before leaving this page."
                  )
                }
              </p>


            </div>


          </div>






          {/* Actions */}

          <div
            className="
              flex items-center
              gap-3
            "
          >


            <button
              onClick={onCancel}
              disabled={isSaving}
              className="
                inline-flex flex-1 sm:flex-none justify-center items-center
                px-5 py-2.5
                font-medium text-slate-700 text-sm
                hover:bg-slate-50
                border border-slate-300 rounded-xl
                disabled:opacity-50
                gap-2
              "
            >

              <X size={16}/>

              Cancel

            </button>





            <button
              onClick={onSave}
              disabled={isSaving}
              className="
                inline-flex flex-1 sm:flex-none justify-center items-center
                px-5 py-2.5
                font-medium text-white text-sm
                bg-blue-600 hover:bg-blue-700
                rounded-xl
                disabled:opacity-60
                disabled:cursor-not-allowed
                gap-2
              "
            >

              {
                isSaving
                ?

                <>
                  <Loader2
                    size={16}
                    className="
                      animate-spin
                    "
                    /
                  >

                  Saving...

                </>

                :

                <>

                  <Save size={16}/>

                  Save Changes

                </>
              }


            </button>


          </div>


        </div>


      </div>


    </div>

  );

};


export default SaveBar;