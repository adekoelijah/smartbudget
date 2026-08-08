
import {
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  useCallback,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { useUser } from "../../../../context/useUser";

import {
  useProfileSettings,
} from "../../hooks/useProfileSettings";

import ProfileCard from "./components/ProfileCard";
import PersonalInformation from "./components/PersonalInformation";
import ProfileCompletion from "./components/ProfileCompletion";
import ChangePhotoModal from "./components/ChangePhotoModal";

import SectionCard from "./components/SectionCard";
import LoadingSkeleton from "./components/LoadingSkeleton";
import EmptyState from "./components/EmptyState";

/*
============================================================
PROFILE SETTINGS
============================================================

Responsibilities:

- Display profile overview
- Manage profile photo
- Display profile completion
- Manage personal information
- Route completion actions
- Keep profile UI synchronized with user state

Business logic remains inside hooks/context.
============================================================
*/

const ProfileSettings = () => {
  /*
  ============================================================
  NAVIGATION
  ============================================================
  */

  const navigate = useNavigate();

  /*
  ============================================================
  GLOBAL USER STATE
  ============================================================
  */

  const {
    user,
    updateProfile,
    updatingProfile,
    loading,
  } = useUser();

  /*
  ============================================================
  PROFILE SETTINGS STATE
  ============================================================
  */

  const {
    profile,
    preview,
    uploading,
    uploadAvatar,
  } = useProfileSettings();

  /*
  ============================================================
  LOCAL UI STATE
  ============================================================
  */

  const [
    showPhotoModal,
    setShowPhotoModal,
  ] = useState(false);

  /*
  ============================================================
  OPEN PHOTO MODAL
  ============================================================
  */

  const handleOpenPhotoModal = useCallback(() => {
    setShowPhotoModal(true);
  }, []);

  /*
  ============================================================
  CLOSE PHOTO MODAL
  ============================================================
  */

  const handleClosePhotoModal = useCallback(() => {
    if (uploading) {
      return;
    }

    setShowPhotoModal(false);
  }, [uploading]);

  /*
  ============================================================
  PROFILE COMPLETION ACTIONS
  ============================================================

  ProfileCompletion only tells us WHICH action was clicked.

  This component decides WHAT should happen.
  ============================================================
  */

  const handleProfileCompletionAction = useCallback(
    (action) => {
      if (!action) {
        return;
      }

      switch (action) {
        /*
        ======================================================
        PROFILE PHOTO
        ======================================================
        */

        case "photo": {
          setShowPhotoModal(true);
          break;
        }

        /*
        ======================================================
        PERSONAL INFORMATION
        ======================================================
        */

        case "personal": {
          requestAnimationFrame(() => {
            const element =
              document.getElementById(
                "personal-information"
              );

            if (element) {
              element.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
          });

          break;
        }

        /*
        ======================================================
        EMAIL VERIFICATION
        ======================================================
        */

        case "email": {
          requestAnimationFrame(() => {
            const element =
              document.getElementById(
                "email-verification"
              );

            if (element) {
              element.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });

              return;
            }

            /*
            If there is no email verification
            section on the profile page, navigate
            to the security/settings page.
            */

            navigate(
              "/settings/security"
            );
          });

          break;
        }

        /*
        ======================================================
        PHONE VERIFICATION
        ======================================================
        */

        case "phone": {
          requestAnimationFrame(() => {
            const element =
              document.getElementById(
                "phone-verification"
              );

            if (element) {
              element.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });

              return;
            }

            navigate(
              "/settings/security"
            );
          });

          break;
        }

        /*
        ======================================================
        SECURITY
        ======================================================
        */

        case "security": {
          requestAnimationFrame(() => {
            const element =
              document.getElementById(
                "security-settings"
              );

            if (element) {
              element.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });

              return;
            }

            navigate(
              "/settings/security"
            );
          });

          break;
        }

        /*
        ======================================================
        FIRST BUDGET
        ======================================================
        */

        case "budget": {
          navigate("/budgets");
          break;
        }

        /*
        ======================================================
        FINANCIAL GOALS
        ======================================================
        */

        case "goal": {
          navigate("/goals");
          break;
        }

        /*
        ======================================================
        UNKNOWN ACTION
        ======================================================
        */

        default: {
          console.warn(
            `Unknown profile completion action: ${action}`
          );
        }
      }
    },
    [navigate]
  );

  /*
  ============================================================
  AVATAR UPLOAD
  ============================================================
  */

  const handleAvatarUpload = useCallback(
    async (file) => {
      if (!file) {
        return;
      }

      try {
        const response =
          await uploadAvatar(file);

        /*
        Close modal only after successful upload.
        */

        if (response?.success) {
          setShowPhotoModal(false);
        }
      } catch (error) {
        console.error(
          "PROFILE_AVATAR_UPLOAD_ERROR:",
          error
        );

        /*
        Do not close the modal when upload fails.
        This allows the user to retry.
        */
      }
    },
    [uploadAvatar]
  );

  /*
  ============================================================
  LOADING STATE
  ============================================================
  */

  if (loading) {
    return (
      <LoadingSkeleton />
    );
  }

  /*
  ============================================================
  EMPTY USER STATE
  ============================================================
  */

  if (!user) {
    return (
      <EmptyState
        icon={
          <UserRound
            size={24}
          />
        }
        title="Profile unavailable"
        description="
          We couldn't load your account information.
          Please refresh and try again.
        "
        actionLabel="Reload"
        onAction={() =>
          window.location.reload()
        }
      />
    );
  }

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <div
      className="
        w-full min-w-0
        space-y-6 pb-8
      "
    >
      {/* ==================================================
          PROFILE OVERVIEW
      ================================================== */}

      <section
        id="profile-overview"
        className="
          scroll-mt-24
        "
      >
        <SectionCard
          icon={
            <UserRound
              size={22}
            />
          }
          title="Profile Overview"
          description="
            Manage your identity, account details,
            and financial preferences.
          "
        >
          <ProfileCard
            user={user}
            onChangePhoto={
              handleOpenPhotoModal
            }
          />
        </SectionCard>
      </section>

      {/* ==================================================
          PROFILE COMPLETION
      ================================================== */}

      <section
        id="profile-completion"
        className="
          scroll-mt-24
        "
      >
        <ProfileCompletion
          user={user}
          onAction={
            handleProfileCompletionAction
          }
        />
      </section>

      {/* ==================================================
          PERSONAL INFORMATION
      ================================================== */}

      <section
        id="personal-information"
        className="
          scroll-mt-24
        "
      >
        <PersonalInformation
          icon={
            <UserRound
              size={20}
            />
          }
          user={user}
          onUpdate={updateProfile}
          isSaving={
            updatingProfile
          }
        />
      </section>

      {/* ==================================================
          SECURITY ANCHOR
      ==================================================

      This anchor allows ProfileCompletion to locate
      the security section if SecuritySettings is rendered
      on this page in the future.
      ================================================== */}

      <div
        id="security-settings"
        className="
          flex items-center
          px-1
          scroll-mt-24
          gap-3
        "
      >
        <ShieldCheck
          size={18}
          className="
            text-blue-600
          "
          aria-hidden="true"
        /
        >

        <span
          className="
            font-medium text-slate-700 text-sm
          "
        >
          Account security
        </span>
      </div>

      {/* ==================================================
          PROFILE PHOTO MODAL
      ================================================== */}

      <ChangePhotoModal
        open={showPhotoModal}
        currentImage={
          preview ||
          profile?.avatar ||
          user?.avatar ||
          ""
        }
        loading={uploading}
        onClose={
          handleClosePhotoModal
        }
        onUpload={
          handleAvatarUpload
        }
      />
    </div>
  );
};

export default ProfileSettings;