


// import { useState } from "react";

// const ProfileSettings = () => {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     avatar: "",
//   });

//   const [preview, setPreview] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   const handleAvatar = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const url = URL.createObjectURL(file);
//     setPreview(url);

//     setForm((prev) => ({ ...prev, avatar: file }));
//   };

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");

//     if (!form.name || !form.email) {
//       return setMessage("Name and email are required");
//     }

//     try {
//       setLoading(true);

//       await new Promise((res) => setTimeout(res, 800));

//       setMessage("Profile updated successfully");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6 text-white">

//       {/* PROFILE HEADER CARD */}
//       <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-6">

//         <h2 className="text-lg font-semibold">
//           Profile Vault
//         </h2>

//         <p className="text-sm text-slate-400 mt-1">
//           Manage your identity and account security
//         </p>

//       </div>

//       {/* PROFILE EDIT CARD */}
//       <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-6 space-y-6">

//         {/* AVATAR SECTION */}
//         <div className="flex items-center gap-5">

//           <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-white/10 bg-white/5">

//             {preview ? (
//               <img
//                 src={preview}
//                 alt="avatar"
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <div className="flex items-center justify-center h-full text-xs text-slate-400">
//                 Avatar
//               </div>
//             )}

//           </div>

//           <label className="text-sm text-emerald-400 cursor-pointer hover:opacity-80">
//             Upload New Avatar
//             <input
//               type="file"
//               accept="image/*"
//               hidden
//               onChange={handleAvatar}
//             />
//           </label>

//         </div>

//         {/* FORM */}
//         <form onSubmit={handleSubmit} className="space-y-5">

//           {/* NAME */}
//           <div>
//             <label className="text-xs text-slate-400">
//               Full Name
//             </label>

//             <input
//               name="name"
//               value={form.name}
//               onChange={handleChange}
//               placeholder="John Doe"
//               className="
//                 mt-2 w-full px-4 py-3 rounded-2xl
//                 bg-white/5 border border-white/10
//                 text-white outline-none
//                 focus:border-emerald-500
//               "
//             />
//           </div>

//           {/* EMAIL */}
//           <div>
//             <label className="text-xs text-slate-400">
//               Email Address
//             </label>

//             <input
//               name="email"
//               type="email"
//               value={form.email}
//               onChange={handleChange}
//               placeholder="you@example.com"
//               className="
//                 mt-2 w-full px-4 py-3 rounded-2xl
//                 bg-white/5 border border-white/10
//                 text-white outline-none
//                 focus:border-emerald-500
//               "
//             />
//           </div>

//           {/* SAVE BUTTON */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="
//               w-full py-3 rounded-2xl text-sm font-medium
//               bg-emerald-500 text-black
//               hover:opacity-90 transition
//               disabled:opacity-50
//             "
//           >
//             {loading ? "Updating Profile..." : "Save Changes"}
//           </button>

//         </form>

//       </div>

//       {/* ACCOUNT INFO */}
//       <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-6 space-y-2">

//         <h3 className="text-sm font-semibold">
//           Account Security
//         </h3>

//         <div className="text-xs text-slate-400 space-y-1">
//           <p>Account ID: 8F3A-92JK-USER</p>
//           <p>Member since: 2026</p>
//           <p>Status: Active Secure Account</p>
//         </div>

//       </div>

//       {/* FEEDBACK */}
//       {message && (
//         <p className="text-center text-sm text-slate-400">
//           {message}
//         </p>
//       )}

//     </div>
//   );
// };

// export default ProfileSettings;


//import { useProfileSettings } from "../../../hooks/useProfileSettings";
import { useProfileSettings } from "../../hooks/useProfileSettings";

/**
 * 🧱 Profile Settings (UI ONLY - SaaS CLEAN ARCHITECTURE)
 */
const ProfileSettings = () => {
  const {
    profile,
    preview,
    loading,
    message,
    updateField,
    setAvatar,
    saveProfile,
  } = useProfileSettings();

  /**
   * FORM SUBMIT
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveProfile();
  };

  return (
    <div className="space-y-6 text-white">

      {/* HEADER CARD */}
      <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-6">
        <h2 className="text-lg font-semibold">Profile Vault</h2>
        <p className="text-sm text-slate-400 mt-1">
          Manage identity and account information
        </p>
      </div>

      {/* PROFILE CARD */}
      <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-6 space-y-6">

        {/* AVATAR */}
        <div className="flex items-center gap-5">

          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
            {preview ? (
              <img
                src={preview}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                Avatar
              </div>
            )}
          </div>

          <label className="text-sm text-emerald-400 cursor-pointer hover:opacity-80">
            Upload Avatar
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setAvatar(e.target.files[0])}
            />
          </label>

        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* NAME */}
          <div>
            <label className="text-xs text-slate-400">Full Name</label>
            <input
              value={profile.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="John Doe"
              className="
                mt-2 w-full px-4 py-3 rounded-2xl
                bg-white/5 border border-white/10
                text-white outline-none
                focus:border-emerald-500
              "
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-xs text-slate-400">Email Address</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="you@example.com"
              className="
                mt-2 w-full px-4 py-3 rounded-2xl
                bg-white/5 border border-white/10
                text-white outline-none
                focus:border-emerald-500
              "
            />
          </div>

          {/* SAVE */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 rounded-2xl text-sm font-medium
              bg-emerald-500 text-black
              hover:opacity-90 transition
              disabled:opacity-50
            "
          >
            {loading ? "Updating Profile..." : "Save Changes"}
          </button>

        </form>
      </div>

      {/* ACCOUNT INFO */}
      <div className="rounded-3xl border border-white/10 bg-[#0f172a] p-6 space-y-2">
        <h3 className="text-sm font-semibold">Account Security</h3>

        <div className="text-xs text-slate-400 space-y-1">
          <p>Account ID: 8F3A-92JK-USER</p>
          <p>Member since: 2026</p>
          <p>Status: Active Secure Account</p>
        </div>
      </div>

      {/* FEEDBACK */}
      {message && (
        <p className="text-center text-sm text-slate-400">
          {message}
        </p>
      )}

    </div>
  );
};

export default ProfileSettings;