import {
  Loader2,
} from "lucide-react";



const SectionCard = ({
  title,
  description,
  icon,
  action,
  children,
  loading = false,
  className = "",
}) => {


  return (

    <section
      className={`
        rounded-3xl
        border
        border-slate-200
        bg-white
        shadow-sm
        p-6

        ${className}
      `}
    >



      {/* Header */}

      {
        (title || icon || action) && (

          <div
            className="
              flex flex-col sm:flex-row sm:justify-between sm:items-start
              mb-6
              gap-4
            "
          >



            <div
              className="
                flex items-start
                gap-3
              "
            >


              {
                icon && (

                  <div
                    className="
                      flex justify-center items-center
                      w-11 h-11
                      mb-2
                      text-blue-600
                      bg-blue-50
                      rounded-xl
                      shrink-0
                    "
                  >

                    {icon}

                  </div>

                )
              }




              <div>


                {
                  title && (

                    <h3
                      className="
                        font-semibold text-slate-900 text-lg
                      "
                    >

                      {title}

                    </h3>

                  )
                }





                {
                  description && (

                    <p
                      className="
                        mt-1
                        text-slate-500 text-sm
                      "
                    >

                      {description}

                    </p>

                  )
                }



              </div>


            </div>






            {
              action && (

                <div>

                  {action}

                </div>

              )
            }



          </div>

        )
      }





      {/* Content */}

      {
        loading

        ?

        (

          <div
            className="
              flex justify-center items-center
              py-10
              text-slate-500
              gap-2
            "
          >

            <Loader2
              size={20}
              className="
                animate-spin
              "
              /
            >

            Loading...

          </div>

        )


        :

        children

      }



    </section>

  );

};



export default SectionCard;