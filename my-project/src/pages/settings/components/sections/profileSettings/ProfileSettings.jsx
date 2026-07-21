// src/pages/ProfileSettings.jsx

import { useState } from "react";

import IdentityHero from "../components/profile/IdentityHero";
import ProfileAvatar from "../components/profile/ProfileAvatar";
import PersonalInfoForm from "../components/profile/PersonalInfoForm";
import PreferenceCards from "../components/profile/PreferenceCards";
import SecurityCenter from "../components/profile/SecurityCenter";
import SaveBar from "../components/profile/SaveBar";

import {
  ShieldCheck,
  WalletCards,
} from "lucide-react";


const ProfileSettings = () => {

  /*
  ===============================
  PROFILE STATE
  ===============================
  */

  const [profile, setProfile] = useState({
    fullName: "Adeko Ayomide",
    email: "user@email.com",
    phone: "",
    location: "",
    avatar: "",
  });


  const [preferences, setPreferences] = useState({
    notifications: true,
    securityAlerts: true,
  });


  const [securityData] = useState({
    passwordStatus: "Strong",
    twoFactorEnabled: false,
    deviceCount: 2,
  });



  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);



  /*
  ===============================
  PROFILE HANDLERS
  ===============================
  */


  const handleProfileChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));


    setHasChanges(true);
  };



  const handlePreferenceToggle = (id) => {

    setPreferences((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));


    setHasChanges(true);
  };



  const handleSave = async () => {

    try {

      setSaving(true);


      /*
        API example:

        await updateProfile(profile)
        await updatePreferences(preferences)

      */


      await new Promise(
        (resolve) =>
          setTimeout(resolve, 800)
      );


      setHasChanges(false);


    } finally {

      setSaving(false);

    }

  };



  const handleCancel = () => {

    /*
      Replace with:
      refetchProfile()
      restore initial state
    */

    setHasChanges(false);

  };



  const handleSecurityAction = (action) => {

    switch(action){

      case "password":
        console.log("Open password modal");
        break;


      case "twoFactor":
        console.log("Open 2FA setup");
        break;


      case "devices":
        console.log("Open devices");
        break;


      case "activity":
        console.log("Open login activity");
        break;


      default:
        break;

    }

  };



  const handleLogout = () => {

    /*
      Replace with:

      logout()
      navigate("/login")

    */

    console.log("Logging out");

  };



  return (

    <main
      className="
        min-h-screen
        bg-gradient-to-br
        from-slate-50
        via-blue-50/40
        to-white
        px-4
        py-6
        md:px-8
        lg:px-12
      "
    >


      <div
        className="
          max-w-7xl
          mx-auto
          space-y-8
        "
      >



        {/* 
          ==================================
          IDENTITY SECTION
          ==================================
        */}


        <section
          className="
            rounded-3xl
            bg-white/70
            backdrop-blur-xl
            border
            border-white/70
            shadow-[0_30px_80px_rgba(15,23,42,0.08)]
            p-6
            md:p-8
          "
        >

          <IdentityHero
            name={profile.fullName}
            email={profile.email}
          />


          <div
            className="
              mt-8
              flex
              justify-center
            "
          >

            <ProfileAvatar
              src={profile.avatar}
              name={profile.fullName}
              verified
              editable
              onCameraClick={() =>
                console.log("Upload avatar")
              }
            />

          </div>


        </section>





        {/* 
          ==================================
          PERSONAL INFORMATION
          ==================================
        */}


        <PersonalInfoForm

          formData={profile}

          onChange={handleProfileChange}

          onSubmit={(e)=>{
            e.preventDefault();
            handleSave();
          }}

          loading={saving}

        />





        {/* 
          ==================================
          USER PREFERENCES
          ==================================
        */}


        <PreferenceCards

          preferences={preferences}

          onToggle={
            handlePreferenceToggle
          }

          onNavigate={(item)=>{

            console.log(
              "Preference:",
              item
            );

          }}

        />





        {/* 
          ==================================
          SECURITY
          ==================================
        */}


        <SecurityCenter

          securityData={securityData}

          onAction={
            handleSecurityAction
          }

          onLogout={
            handleLogout
          }

        />





        {/* 
          ==================================
          SAVE ACTION
          ==================================
        */}


        <SaveBar

          hasChanges={hasChanges}

          loading={saving}

          onSave={handleSave}

          onCancel={handleCancel}

        />



      </div>


    </main>

  );
};



export default ProfileSettings;