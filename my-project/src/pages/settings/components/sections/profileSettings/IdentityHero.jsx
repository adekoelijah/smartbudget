import { motion } from "framer-motion";
import {
  BadgeCheck,
  Camera,
  ShieldCheck,
  CloudCheck,
  LockKeyhole,
  Smartphone,
  Activity,
} from "lucide-react";
import { useMemo } from "react";

const IdentityHero = ({
  profile,
  preview,
  loading,
  onAvatarChange,
}) => {
  const initials = useMemo(() => {
    if (!profile?.name) return "SB";

    return profile.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }, [profile]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="
      relative
      overflow-hidden
      rounded-[36px]
      border border-white/10
      bg-white/[0.05]
      backdrop-blur-3xl
      shadow-[0_30px_80px_rgba(0,0,0,.45)]
      "
    >
      {/* Background Glow */}

      <div className="absolute inset-0">

        <div className="
        absolute
        -top-28
        -right-20
        h-72
        w-72
        rounded-full
        bg-cyan-500/20
        blur-[120px]
        " />

        <div className="
        absolute
        bottom-0
        left-0
        h-80
        w-80
        rounded-full
        bg-blue-600/15
        blur-[140px]
        " />

        <div
          className="
          absolute
          inset-0
          bg-[linear-gradient(135deg,rgba(255,255,255,.08),transparent)]
        "
        />
      </div>

      <div className="relative z-10 p-8 lg:p-10">

        <div className="grid lg:grid-cols-[1.6fr_420px] gap-10">

          {/* LEFT */}

          <div className="flex flex-col md:flex-row gap-8">

            {/* Avatar */}

            <div className="relative">

              <motion.div
                whileHover={{
                  rotate: 2,
                  scale: 1.03,
                }}
                className="
                relative
                h-36
                w-36
                rounded-full
                p-[3px]
                bg-gradient-to-br
                from-cyan-400
                via-blue-500
                to-indigo-600
                shadow-[0_0_50px_rgba(59,130,246,.35)]
                "
              >
                <div
                  className="
                  h-full
                  w-full
                  rounded-full
                  overflow-hidden
                  bg-slate-900
                  border
                  border-white/10
                "
                >
                  {preview || profile?.avatar ? (
                    <img
                      src={preview || profile.avatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="
                    flex
                    h-full
                    items-center
                    justify-center
                    text-4xl
                    font-bold
                    text-white
                    ">
                      {initials}
                    </div>
                  )}
                </div>
              </motion.div>

              <label
                className="
                absolute
                bottom-2
                right-2
                flex
                h-12
                w-12
                cursor-pointer
                items-center
                justify-center
                rounded-full
                border
                border-white/15
                bg-black/50
                backdrop-blur-xl
                transition
                hover:scale-110
              "
              >
                <Camera size={18} />

                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      onAvatarChange(e.target.files[0]);
                    }
                  }}
                />
              </label>

              <span
                className="
                absolute
                right-3
                top-4
                h-4
                w-4
                rounded-full
                bg-emerald-400
                ring-4
                ring-slate-900
                animate-pulse
              "
              />
            </div>

            {/* Identity */}

            <div className="flex flex-col justify-center">

              <div className="flex items-center gap-3">

                <h1 className="text-4xl font-bold text-white">
                  {profile?.name}
                </h1>

                <BadgeCheck
                  className="text-cyan-400"
                  size={24}
                />

              </div>

              <p className="mt-2 text-slate-400">
                {profile?.email}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">

                <GlassBadge
                  icon={<ShieldCheck size={14} />}
                  label="Premium Verified"
                />

                <GlassBadge
                  icon={<Activity size={14} />}
                  label="Live Secure Sync"
                />

              </div>

              <p className="mt-8 max-w-xl text-slate-400 leading-relaxed">
                Your financial identity is protected with
                enterprise-grade encryption and synchronized
                securely across all trusted devices.
              </p>

            </div>

          </div>

          {/* RIGHT */}

          <div
            className="
            rounded-[30px]
            border
            border-white/10
            bg-white/[0.04]
            backdrop-blur-xl
            p-7
          "
          >
            <p className="text-xs tracking-[.3em] uppercase text-slate-500">
              ACCOUNT TRUST
            </p>

            <div className="mt-3 flex items-end gap-3">

              <span className="text-6xl font-bold text-white">
                99
              </span>

              <span className="pb-2 text-cyan-400 text-xl">
                %
              </span>

            </div>

            <div className="mt-8 space-y-5">

              <Metric
                icon={<LockKeyhole size={18} />}
                title="AES-256 Encryption"
                status="Active"
              />

              <Metric
                icon={<Smartphone size={18} />}
                title="Trusted Device"
                status="Verified"
              />

              <Metric
                icon={<CloudCheck size={18} />}
                title="Cloud Sync"
                status={loading ? "Syncing..." : "Connected"}
              />

            </div>

          </div>

        </div>

      </div>

    </motion.section>
  );
};

function GlassBadge({ icon, label }) {
  return (
    <div
      className="
      flex
      items-center
      gap-2
      rounded-full
      border
      border-cyan-400/20
      bg-cyan-500/10
      px-4
      py-2
      text-sm
      text-cyan-300
    "
    >
      {icon}
      {label}
    </div>
  );
}

function Metric({ icon, title, status }) {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        <div
          className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-2xl
          bg-cyan-500/10
          text-cyan-400
        "
        >
          {icon}
        </div>

        <div>

          <h4 className="text-white font-medium">
            {title}
          </h4>

          <p className="text-sm text-slate-400">
            {status}
          </p>

        </div>

      </div>

      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />

    </div>
  );
}

export default IdentityHero;