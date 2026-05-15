
// export const useUser = () => {
//   const {
//     user,
//     loading,
//     error,

//     // core actions from context
//     loadUser,
//     saveProfile,
//     changeAvatar,
//     setUser,
//   } = useUserContext();

//   /* ===============================
//      REFRESH USER (SAFE WRAPPER)
//   ================================= */
//   const refreshUser = useCallback(async () => {
//     try {
//       await loadUser();
//     } catch (err) {
//       console.error("REFRESH_USER_ERROR:", err);
//       throw err;
//     }
//   }, [loadUser]);

//   /* ===============================
//      UPDATE PROFILE (BANK SAFE WRITE)
//   ================================= */
//   const updateProfile = useCallback(
//     async (payload) => {
//       try {
//         const updated = await saveProfile(payload);

//         // Context already updates state,
//         // but we return for chaining if needed
//         return updated;
//       } catch (err) {
//         console.error("UPDATE_PROFILE_ERROR:", err);
//         throw err;
//       }
//     },
//     [saveProfile]
//   );

//   /* ===============================
//      AVATAR UPDATE (ATOMIC OPERATION)
//   ================================= */
//   const updateAvatar = useCallback(
//     async (file) => {
//       try {
//         const result = await changeAvatar(file);

//         return result;
//       } catch (err) {
//         console.error("AVATAR_UPDATE_ERROR:", err);
//         throw err;
//       }
//     },
//     [changeAvatar]
//   );

//   /* ===============================
//      LOCAL PATCH (OPTIMISTIC UI)
//   ================================= */
//   const patchUser = useCallback(
//     (patch) => {
//       setUser((prev) => ({
//         ...prev,
//         ...patch,
//       }));
//     },
//     [setUser]
//   );

//   /* ===============================
//      RESET USER (SESSION SYNC)
//   ================================= */
//   const resetProfile = useCallback(async () => {
//     try {
//       await loadUser(); // re-sync from backend
//     } catch (err) {
//       console.error("RESET_PROFILE_ERROR:", err);
//       throw err;
//     }
//   }, [loadUser]);

//   return {
//     // state
//     user,
//     loading,
//     error,

//     // actions
//     refreshUser,
//     updateProfile,
//     updateAvatar,
//     resetProfile,
//     patchUser,
//   };
// };


import { useCallback } from "react";
import { useUser as useUserContext } from "../../../context/UserContext";

/* ===============================
   BANK-GRADE USER HOOK
================================= */
export const useUser = () => {
  const {
    user,
    loading,
    error,
    loadUser,
    saveProfile,
    changeAvatar,
    setUser,
  } = useUserContext();

  const refreshUser = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  const updateProfile = useCallback(
    async (payload) => {
      return await saveProfile(payload);
    },
    [saveProfile]
  );

  const updateAvatar = useCallback(
    async (file) => {
      return await changeAvatar(file);
    },
    [changeAvatar]
  );

  const patchUser = useCallback(
    (patch) => {
      setUser((prev) => ({
        ...prev,
        ...patch,
      }));
    },
    [setUser]
  );

  const resetProfile = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  return {
    user,
    loading,
    error,
    refreshUser,
    updateProfile,
    updateAvatar,
    resetProfile,
    patchUser,
  };
};