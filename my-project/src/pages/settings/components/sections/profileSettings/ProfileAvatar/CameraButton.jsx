import { Camera } from "lucide-react";

const CameraButton = ({
  onChange,
  accept = "image/*",
  disabled = false,
  className = "",
}) => {
  return (
    <label
      className={`
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
        border-white/10
        bg-white/10
        text-slate-200
        backdrop-blur-2xl
        shadow-lg
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-cyan-400/40
        hover:bg-cyan-500/10
        hover:text-cyan-300
        active:scale-95
        ${disabled ? "pointer-events-none opacity-50" : ""}
        ${className}
      `}
      aria-label="Upload profile picture"
    >
      <Camera size={18} strokeWidth={2} />

      <input
        type="file"
        accept={accept}
        hidden
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (!file) return;

          onChange?.(file);

          // Allow selecting the same file again
          e.target.value = "";
        }}
      />
    </label>
  );
};

export default CameraButton;