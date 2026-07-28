import {
  ShieldCheck,
  Lock,
  Smartphone,
  Clock3,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";


const SecurityOverview = ({
  user,
  onNavigate,
}) => {


  const securityItems = [

    {
      title: "Password Security",
      description:
        "Your password is strong and regularly protected.",
      status: "Secure",
      icon: <Lock size={20}/>,
      variant: "success",
    },


    {
      title: "Two-Factor Authentication",
      description:
        user?.twoFactorEnabled
          ?
          "Additional authentication layer is active."
          :
          "Enable 2FA for stronger account protection.",
      status:
        user?.twoFactorEnabled
          ?
          "Enabled"
          :
          "Recommended",
      icon: <Smartphone size={20}/>,
      variant:
        user?.twoFactorEnabled
          ?
          "success"
          :
          "warning",
    },


    {
      title: "Login Activity",
      description:
        "Review recent devices and account access.",
      status: "Protected",
      icon: <Monitor size={20}/>,
      variant: "success",
    },


    {
      title: "Security Review",
      description:
        "Last security check completed successfully.",
      status: "Up to date",
      icon: <Clock3 size={20}/>,
      variant: "success",
    },

  ];



  return (

    <section
      className="
        p-6
        bg-white
        border border-slate-200 rounded-3xl
        shadow-sm
      "
    >


      {/* Header */}

      <div
        className="
          flex justify-between items-start
          mb-6
          gap-4
        "
      >

        <div>

          <div
            className="
              flex items-center
              gap-3
            "
          >

            <div
              className="
                flex justify-center items-center
                w-11 h-11
                text-blue-600
                bg-blue-50
                rounded-xl
              "
            >
              <ShieldCheck size={22}/>
            </div>


            <div>

              <h3
                className="
                  font-semibold text-slate-900 text-lg
                "
              >
                Security Overview
              </h3>


              <p
                className="
                  mt-1
                  text-slate-500 text-sm
                "
              >
                Monitor and protect your SmartBudget account.
              </p>

            </div>

          </div>

        </div>


      </div>




      {/* Security Score */}

      <div
        className="
          mb-6 p-5
          bg-slate-50
          border border-slate-200 rounded-2xl
        "
      >

        <div
          className="
            flex flex-col sm:flex-row sm:justify-between sm:items-center
            gap-4
          "
        >

          <div>

            <p
              className="
                text-slate-500 text-sm
              "
            >
              Account Security Score
            </p>


            <div
              className="
                flex items-center
                mt-2
                gap-2
              "
            >

              <h4
                className="
                  font-bold text-slate-900 text-3xl
                "
              >
                92%
              </h4>


              <span
                className="
                  px-3 py-1
                  font-semibold text-emerald-700 text-xs
                  bg-emerald-100
                  rounded-full
                "
              >
                Excellent
              </span>

            </div>


          </div>



          <div
            className="
              flex items-center
              font-medium text-emerald-600 text-sm
              gap-2
            "
          >

            <CheckCircle2 size={18}/>

            Account Protected

          </div>


        </div>


      </div>





      {/* Security Items */}

      <div
        className="
          grid grid-cols-1 md:grid-cols-2
          gap-4
        "
      >

        {
          securityItems.map((item,index)=>(

            <SecurityCard
              key={index}
              {...item}
            />

          ))
        }


      </div>




      {/* Action */}

      <button
        onClick={onNavigate}
        className="
          flex justify-center items-center
          w-full
          mt-6 px-5 py-3
          font-medium text-blue-700 text-sm
          bg-blue-50 hover:bg-blue-100
          border border-blue-200 rounded-xl
          transition
          gap-2
        "
      >

        Manage Security Settings

        <ArrowRight size={16}/>

      </button>


    </section>

  );

};





function SecurityCard({
  title,
  description,
  status,
  icon,
  variant,
}) {


  const statusStyle =
    variant === "warning"
      ?
      "bg-amber-100 text-amber-700"
      :
      "bg-emerald-100 text-emerald-700";



  return (

    <div
      className="
        p-4
        border border-slate-200 rounded-2xl
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
          "
        >

          {icon}

        </div>



        <div
          className="
            flex-1
          "
        >

          <div
            className="
              flex justify-between items-center
              gap-2
            "
          >

            <h4
              className="
                font-semibold text-slate-900 text-sm
              "
            >
              {title}
            </h4>


            <span
              className={`
                rounded-full
                px-2.5
                py-1
                text-xs
                font-medium
                ${statusStyle}
              `}
            >
              {status}
            </span>


          </div>



          <p
            className="
              mt-2
              text-slate-500 text-xs leading-relaxed
            "
          >
            {description}
          </p>


        </div>


      </div>


    </div>

  );

}



export default SecurityOverview;