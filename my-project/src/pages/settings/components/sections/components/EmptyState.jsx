import {
  Inbox,
  ArrowRight,
} from "lucide-react";



const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondaryAction,
  variant = "default",
}) => {



  const variants = {


    default: {
      container:
        "bg-slate-50 border-slate-200",

      icon:
        "bg-blue-50 text-blue-600",
    },


    success: {

      container:
        "bg-emerald-50 border-emerald-200",

      icon:
        "bg-emerald-100 text-emerald-600",

    },


    warning: {

      container:
        "bg-amber-50 border-amber-200",

      icon:
        "bg-amber-100 text-amber-600",

    },


  };



  const style =
    variants[variant] ||
    variants.default;




  return (

    <div
      className={`
        flex
        flex-col
        items-center
        justify-center
        text-center
        rounded-3xl
        border
        p-8
        ${style.container}
      `}
    >



      {/* Icon */}

      <div
        className="
          flex items-center justify-center
          h-16 w-16
          mb-5
          rounded-2xl
          ${style.icon}
        "
      >

        {
          icon
          ||
          <Inbox size={30}/>
        }


      </div>





      {/* Content */}

      <h3
        className="
          font-semibold text-slate-900 text-lg
        "
      >

        {title}

      </h3>




      <p
        className="
          max-w-md
          mt-2
          text-slate-500 text-sm leading-relaxed
        "
      >

        {description}

      </p>







      {/* Actions */}

      {
        (actionLabel || secondaryLabel) && (

          <div
            className="
              flex flex-col sm:flex-row
              mt-6
              gap-3
            "
          >


            {
              actionLabel && (

                <button
                  onClick={onAction}
                  className="
                    inline-flex justify-center items-center
                    px-5 py-3
                    font-medium text-white text-sm
                    bg-blue-600 hover:bg-blue-700
                    rounded-xl
                    transition
                    gap-2
                  "
                >

                  {actionLabel}

                  <ArrowRight size={16}/>

                </button>

              )
            }





            {
              secondaryLabel && (

                <button
                  onClick={onSecondaryAction}
                  className="
                    px-5 py-3
                    font-medium text-slate-700 text-sm
                    hover:bg-white
                    border border-slate-300 rounded-xl
                    transition
                  "
                >

                  {secondaryLabel}

                </button>

              )
            }


          </div>

        )
      }




    </div>

  );

};



export default EmptyState;