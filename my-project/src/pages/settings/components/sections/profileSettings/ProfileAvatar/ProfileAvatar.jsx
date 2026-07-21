// src/components/profile/ProfileAvatar.jsx

import PropTypes from "prop-types";
import GradientRing from "./GradientRing";
import CameraButton from "./CameraButton";
import { UserRound } from "lucide-react";

const ProfileAvatar = ({
  src,
  name = "User",
  size = "large",
  verified = false,
  editable = true,
  onCameraClick,
}) => {
  const sizes = {
    small: {
      container: "w-20 h-20",
      icon: "w-8 h-8",
      text: "text-xl",
    },
    medium: {
      container: "w-28 h-28",
      icon: "w-10 h-10",
      text: "text-3xl",
    },
    large: {
      container: "w-36 h-36",
      icon: "w-14 h-14",
      text: "text-4xl",
    },
  };

  const currentSize = sizes[size];

  const initials = name
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative flex items-center justify-center">
      {/* Premium Gradient Border */}
      <GradientRing size={size}>
        <div
          className={`
            ${currentSize.container}
            rounded-full
            overflow-hidden
            flex
            items-center
            justify-center
            bg-white/80
            backdrop-blur-xl
            border
            border-white/60
            shadow-[0_20px_50px_rgba(0,0,0,0.12)]
            relative
          `}
        >
          {src ? (
            <img
              src={src}
              alt={`${name} profile`}
              className="w-full h-full object-cover"
            />
          ) : initials ? (
            <span
              className={`
                ${currentSize.text}
                font-semibold
                text-slate-700
                tracking-wide
              `}
            >
              {initials}
            </span>
          ) : (
            <UserRound
              className={`${currentSize.icon} text-slate-400`}
            />
          )}
        </div>
      </GradientRing>

      {/* Camera Upload Action */}
      {editable && (
        <CameraButton
          onClick={onCameraClick}
          size={size}
        />
      )}

      {/* Verification Badge */}
      {verified && (
        <div
          className="
            absolute
            bottom-1
            right-1
            w-8
            h-8
            rounded-full
            bg-white
            flex
            items-center
            justify-center
            shadow-lg
            border
            border-slate-100
          "
        >
          <div
            className="
              w-6
              h-6
              rounded-full
              bg-blue-600
              flex
              items-center
              justify-center
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-4 h-4 text-white"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path
                d="M5 12.5L9.5 17L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

ProfileAvatar.propTypes = {
  src: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  verified: PropTypes.bool,
  editable: PropTypes.bool,
  onCameraClick: PropTypes.func,
};

export default ProfileAvatar;