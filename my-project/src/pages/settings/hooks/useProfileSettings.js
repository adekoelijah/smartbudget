import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

// import { useUser } from "../../../context/UserContext";
import { useUser } from "../../../context/useUser";

/*
=========================================
HELPERS
=========================================
*/

const createProfileState = (user = {}) => ({
  firstName: user.firstName ?? "",
  lastName: user.lastName ?? "",
  name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
  email: user.email ?? "",
  phone: user.phone ?? "",
  country: user.country ?? "",
  dateOfBirth: user.dateOfBirth ?? "",
  avatar: user.avatar ?? "",
  createdAt: user.createdAt ?? null,
  emailVerified: Boolean(user.emailVerified),
  phoneVerified: Boolean(user.phoneVerified),
  twoFactorEnabled: Boolean(user.twoFactorEnabled),
});

/*
=========================================
HOOK
=========================================
*/

export const useProfileSettings = () => {
  const {
    user,
    updateProfile,
    updateAvatar,
    updatingProfile,
    updatingAvatar,
    error,
  } = useUser();

  /*
  =========================================
  DERIVED PROFILE
  =========================================
  */

  const initialProfile = useMemo(
    () => createProfileState(user),
    [user]
  );

  /*
  =========================================
  LOCAL UI STATE
  =========================================
  */

  const [profile, setProfile] = useState(initialProfile);

  const [preview, setPreview] = useState(null);

  const [message, setMessage] = useState("");

  /*
  =========================================
  SYNC USER
  =========================================
  */

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  /*
  =========================================
  AVATAR CLEANUP
  =========================================
  */

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  /*
  =========================================
  DIRTY CHECK
  =========================================
  */

  const isDirty = useMemo(() => {
    return Object.keys(initialProfile).some(
      (key) => profile[key] !== initialProfile[key]
    );
  }, [profile, initialProfile]);

  /*
  =========================================
  UPDATE FIELD
  =========================================
  */

  const updateField = useCallback((field, value) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));

    setMessage("");
  }, []);

  /*
  =========================================
  SAVE PROFILE
  =========================================
  */

  const saveProfile = useCallback(async () => {
    const response = await updateProfile(profile);

    if (response.success) {
      setMessage("Profile updated successfully");
    }

    return response;
  }, [profile, updateProfile]);

  /*
  =========================================
  UPLOAD AVATAR
  =========================================
  */

  const uploadAvatar = useCallback(
    async (file) => {
      if (!file) {
        return {
          success: false,
          message: "No file selected",
        };
      }

      if (preview) {
        URL.revokeObjectURL(preview);
      }

      const localPreview = URL.createObjectURL(file);

      setPreview(localPreview);

      const response = await updateAvatar(file);

      if (!response.success) {
        URL.revokeObjectURL(localPreview);
        setPreview(null);
      }

      return response;
    },
    [preview, updateAvatar]
  );

  /*
  =========================================
  RESET
  =========================================
  */

  const reset = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(null);
    setProfile(initialProfile);
    setMessage("");
  }, [preview, initialProfile]);

  /*
  =========================================
  EXPORTS
  =========================================
  */

  return {
    profile,
    preview,
    message,
    error,

    updatingProfile,
    updatingAvatar,

    isDirty,

    updateField,
    saveProfile,
    uploadAvatar,
    reset,
  };
};