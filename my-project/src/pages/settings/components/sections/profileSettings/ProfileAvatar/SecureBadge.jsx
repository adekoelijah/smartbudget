import { ShieldCheck, BadgeCheck, LockKeyhole } from "lucide-react";

const variants = {
  verified: {
    icon: BadgeCheck,
    label: "Premium Verified",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
  },

  secure: {
    icon: ShieldCheck,
    label: "Secure Identity",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    text: "text-cyan-400",
  },

  encrypted: {
    icon: LockKeyhole,
    label: "AES-256 Encrypted",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    text: "text-indigo-400",
  },
};

const SecureBadge = ({
  type = "verified",
  label,
  className = "",
}) => {
  const badge = variants[type] || variants.verified;
  const Icon = badge.icon;

  return (
    <div
      className={`
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        px-4
        py-2
        text-sm
        font-medium
        backdrop-blur-xl
        ${badge.bg}
        ${badge.border}
        ${badge.text}
        ${className}
      `}
    >
      <Icon size={15} strokeWidth={2} />

      <span>{label || badge.label}</span>
    </div>
  );
};

export default SecureBadge;