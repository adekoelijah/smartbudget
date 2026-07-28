import { 
  ShieldCheck,
  Mail,
  CalendarDays,
  MapPin,
  Edit3,
  BadgeCheck,
} from "lucide-react";


const ProfileCard = ({
  user,
  onEdit,
}) => {

  const fullName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    "SmartBudget User";


  const initials =
    fullName
      .split(" ")
      .map(name => name[0])
      .slice(0,2)
      .join("")
      .toUpperCase();


  return (
    <section
      className="
        relative overflow-hidden
        p-6
        bg-white
        border border-slate-200 rounded-3xl
        shadow-sm
      "
    >

      {/* Premium background accent */}
      <div
        className="
          top-0 absolute inset-x-0
          h-32
          bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700
        "
        /
      >


      <div
        className="
          z-10 relative
        "
      >


        {/* Header */}
        <div
          className="
            flex flex-col sm:flex-row sm:justify-between sm:items-end
            gap-5
          "
        >

          {/* Identity */}
          <div
            className="
              flex items-center
              gap-4
            "
          >

            {/* Avatar */}
            <div
              className="
                flex justify-center items-center
                w-24 h-24
                font-bold text-blue-700 text-2xl
                bg-white
                border-4 border-white rounded-2xl
                shadow-lg
              "
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={fullName}
                  className="
                    object-cover
                    w-full h-full
                    rounded-2xl
                  "
                  /
                >
              ) : (
                initials
              )}

            </div>


            <div
              className="
                pt-8 sm:pt-0
              "
            >

              <div
                className="
                  flex items-center
                  gap-2
                "
              >

                <h2
                  className="
                    font-semibold text-slate-900 text-xl
                  "
                >
                  {fullName}
                </h2>


                <VerificationBadge
                type="verified"
                size="sm"
                  />

              </div>


              <p
                className="
                  mt-1
                  text-slate-500 text-sm
                "
              >
                Premium SmartBudget Member
              </p>

            </div>

          </div>


          {/* Edit Button */}
          <button
            onClick={onEdit}
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

            <Edit3 size={16}/>

            Edit Profile

          </button>


        </div>



        {/* Account Information */}

        <div
          className="
            grid grid-cols-1 md:grid-cols-2
            mt-8
            gap-4
          "
        >


          <InfoItem
            icon={<Mail size={18}/>}
            label="Email Address"
            value={user?.email || "Not available"}
          />


          <InfoItem
            icon={<CalendarDays size={18}/>}
            label="Member Since"
            value={
              user?.createdAt
              ?
              new Date(user.createdAt)
                .toLocaleDateString()
              :
              "Recently joined"
            }
          />


          <InfoItem
            icon={<MapPin size={18}/>}
            label="Location"
            value={user?.country || "Nigeria"}
          />


          <InfoItem
            icon={<ShieldCheck size={18}/>}
            label="Account Security"
            value="Protected"
          />


        </div>



        {/* Account Status */}

        <div
          className="
            flex flex-col sm:flex-row sm:justify-between sm:items-center
            mt-6 p-4
            bg-slate-50
            border border-slate-200 rounded-2xl
            gap-3
          "
        >

          <div>

            <p
              className="
                font-medium text-slate-900 text-sm
              "
            >
              Financial Profile Status
            </p>


            <p
              className="
                mt-1
                text-slate-500 text-xs
              "
            >
              Your SmartBudget account is active and secure.
            </p>

          </div>



          <span
            className="
              inline-flex justify-center items-center
              px-4 py-2
              font-medium text-emerald-700 text-sm
              bg-emerald-100
              rounded-full
            "
          >
            Active
          </span>


        </div>


      </div>

    </section>
  );
};



function InfoItem({
  icon,
  label,
  value,
}) {

  return (

    <div
      className="
        flex items-center
        p-4
        border border-slate-200 rounded-2xl
        gap-3
      "
    >

      <div
        className="
          flex justify-center items-center
          w-10 h-10
          text-blue-600
          bg-blue-50
          rounded-xl
        "
      >
        {icon}
      </div>


      <div>

        <p
          className="
            text-slate-500 text-xs
          "
        >
          {label}
        </p>


        <p
          className="
            mt-1
            font-medium text-slate-900 text-sm
          "
        >
          {value}
        </p>


      </div>


    </div>

  );

}


export default ProfileCard;