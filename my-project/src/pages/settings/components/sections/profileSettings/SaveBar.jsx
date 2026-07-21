// src/components/profile/SaveBar.jsx

import PropTypes from "prop-types";
import {
  Save,
  X,
  Loader2,
} from "lucide-react";


const SaveBar = ({
  hasChanges,
  loading = false,
  onSave,
  onCancel,
}) => {

  if (!hasChanges) return null;


  return (
    <div
      className="
        sticky
        bottom-5
        z-20
        mt-8
        rounded-3xl
        bg-white/80
        backdrop-blur-xl
        border
        border-white/70
        shadow-[0_25px_70px_rgba(15,23,42,0.15)]
        p-4
        md:p-5
      "
    >

      <div
        className="
          flex
          flex-col
          sm:flex-row
          items-center
          justify-between
          gap-4
        "
      >

        {/* Message */}
        <div>

          <h4
            className="
              text-sm
              font-semibold
              text-slate-900
            "
          >
            Unsaved changes
          </h4>

          <p
            className="
              text-xs
              text-slate-500
              mt-1
            "
          >
            Save your updates before leaving this page.
          </p>

        </div>



        {/* Actions */}
        <div
          className="
            flex
            items-center
            gap-3
            w-full
            sm:w-auto
          "
        >

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="
              flex
              items-center
              justify-center
              gap-2
              h-11
              px-5
              rounded-2xl
              border
              border-slate-200
              bg-white
              text-slate-700
              text-sm
              font-medium
              hover:bg-slate-50
              disabled:opacity-50
              flex-1
              sm:flex-none
            "
          >

            <X className="w-4 h-4" />

            Cancel

          </button>



          <button
            type="button"
            onClick={onSave}
            disabled={loading}
            className="
              flex
              items-center
              justify-center
              gap-2
              h-11
              px-6
              rounded-2xl
              bg-blue-600
              text-white
              text-sm
              font-medium
              shadow-lg
              shadow-blue-600/20
              hover:bg-blue-700
              disabled:opacity-60
              flex-1
              sm:flex-none
            "
          >

            {loading ? (
              <>
                <Loader2
                  className="
                    w-4
                    h-4
                    animate-spin
                  "
                />

                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />

                Save Changes
              </>
            )}

          </button>


        </div>

      </div>


    </div>
  );
};



SaveBar.propTypes = {
  hasChanges: PropTypes.bool.isRequired,
  loading: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};


export default SaveBar;