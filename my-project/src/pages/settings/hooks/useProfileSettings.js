import { useEffect, useState } from "react";
import { useUser } from "../../../context/UserContext";

export const useProfileSettings = () => {
  const {
    user,
    loading,
    saveProfile,
    changeAvatar,
  } = useUser();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    avatar: "",
  });


  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  /* ================= SYNC GLOBAL USER ================= */
  // useEffect(() => {
  //   if (!user) return;

  //   setProfile({
  //     name: user.name || "",
  //     email: user.email || "",
  //     avatar: user.avatar || "",
  //   });
  // }, [user]);
  useEffect(() => {
  if (!user) return;

  setProfile((prev) => {
    const next = {
      name: user.name || "",
      email: user.email || "",
      avatar: user.avatar || "",
    };

    // 🔥 prevent unnecessary re-render loop
    if (
      prev.name === next.name &&
      prev.email === next.email &&
      prev.avatar === next.avatar
    ) {
      return prev;
    }

    return next;
  });
}, [user?._id]); // 🔥 IMPORTANT: depend on stable field, not full object

  /* ================= FIELD UPDATE ================= */
  const updateField = (key, value) => {
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /* ================= AVATAR ================= */
  const setAvatar = async (file) => {
    const local = URL.createObjectURL(file);
    setPreview(local);

    await changeAvatar(file); // 🔥 updates global state automatically
  };

  /* ================= SAVE ================= */
  const save = async () => {
    await saveProfile(profile); // 🔥 updates global state
    setMessage("Profile synced successfully");
  };

  return {
    profile,
    preview,
    loading,
    message,
    updateField,
    setAvatar,
    saveProfile: save,
  };
};


// import { useEffect, useRef, useState, useCallback } from "react";
// import { useUser } from "../../../context/UserContext";

// export const useProfileSettings = () => {
//   const { user, loading, saveProfile, changeAvatar } = useUser();

//   const [profile, setProfile] = useState({
//     name: "",
//     email: "",
//     avatar: "",
//   });

//   const [preview, setPreview] = useState(null);
//   const [message, setMessage] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [uploading, setUploading] = useState(false);

//   const initialized = useRef(false);

//   /* =========================
//      INITIAL SYNC ONLY ONCE
//   ========================= */
//   useEffect(() => {
//     if (!user || initialized.current) return;

//     setProfile({
//       name: user.name || "",
//       email: user.email || "",
//       avatar: user.avatar || "",
//     });

//     initialized.current = true;
//   }, [user]);

//   /* =========================
//      FIELD UPDATE
//   ========================= */
//   const updateField = useCallback((key, value) => {
//     setProfile((prev) => ({
//       ...prev,
//       [key]: value,
//     }));
//   }, []);

//   /* =========================
//      AVATAR
//   ========================= */
//   const setAvatar = useCallback(
//     async (file) => {
//       if (!file) return;

//       try {
//         setUploading(true);

//         if (preview) URL.revokeObjectURL(preview);

//         const local = URL.createObjectURL(file);
//         setPreview(local);

//         const res = await changeAvatar(file);

//         setProfile((prev) => ({
//           ...prev,
//           avatar: res?.url || prev.avatar,
//         }));
//       } finally {
//         setUploading(false);
//       }
//     },
//     [changeAvatar, preview]
//   );

//   /* =========================
//      SAVE
//   ========================= */
//   const save = useCallback(async () => {
//     try {
//       setSaving(true);
//       setMessage("");

//       await saveProfile(profile);

//       setMessage("Profile synced successfully");
//     } catch (err) {
//       setMessage("Failed to sync profile");
//     } finally {
//       setSaving(false);
//     }
//   }, [profile, saveProfile]);

//   return {
//     profile,
//     preview,
//     loading,
//     saving,
//     uploading,
//     message,
//     updateField,
//     setAvatar,
//     saveProfile: save,
//   };
// };
