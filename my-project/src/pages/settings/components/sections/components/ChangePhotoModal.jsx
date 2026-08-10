
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

const ChangePhotoModal = ({
  isOpen,
  onClose,
  currentPhoto,
  onUpload,
}) => {
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [preview, setPreview] = useState(
    currentPhoto || null
  );

  const [isUploading, setIsUploading] =
    useState(false);

  const [error, setError] = useState("");

  /* =========================================
     SYNC CURRENT PHOTO
  ========================================= */

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSelectedFile(null);
    setError("");
    setPreview(currentPhoto || null);
  }, [isOpen, currentPhoto]);

  /* =========================================
     CLEAN OBJECT URL
  ========================================= */

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(
          previewUrlRef.current
        );
      }
    };
  }, []);

  /* =========================================
     FILE CHANGE
  ========================================= */

  const handleFileChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only JPG, PNG, and WEBP images are supported."
      );

      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Image size must be less than 5MB."
      );

      return;
    }

    setError("");
    setSelectedFile(file);

    if (previewUrlRef.current) {
      URL.revokeObjectURL(
        previewUrlRef.current
      );
    }

    const imageUrl =
      URL.createObjectURL(file);

    previewUrlRef.current = imageUrl;

    setPreview(imageUrl);
  };

  /* =========================================
     UPLOAD
  ========================================= */

  const handleUpload = async () => {
    if (!selectedFile) {
      setError(
        "Please select an image first."
      );

      return;
    }

    if (typeof onUpload !== "function") {
      setError(
        "Profile photo upload is not available."
      );

      return;
    }

    try {
      setIsUploading(true);
      setError("");

      const result =
        await onUpload(selectedFile);

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Unable to update profile photo."
        );
      }

      onClose();
    } catch (error) {
      console.error(
        "PROFILE_PHOTO_UPLOAD_ERROR:",
        error
      );

      setError(
        error?.message ||
          "Unable to update profile photo. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  /* =========================================
     CLOSE
  ========================================= */

  const handleClose = () => {
    if (isUploading) {
      return;
    }

    setSelectedFile(null);
    setError("");

    if (previewUrlRef.current) {
      URL.revokeObjectURL(
        previewUrlRef.current
      );

      previewUrlRef.current = null;
    }

    setPreview(currentPhoto || null);

    onClose();
  };

  /* =========================================
     RENDER
  ========================================= */

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="
        z-50 fixed inset-0 flex justify-center items-center
        px-4
        bg-slate-950/40
        backdrop-blur-sm
      "
    >
      <div
        className="
          w-full max-w-md
          p-6
          bg-white
          border border-slate-200 rounded-3xl
          shadow-xl
        "
      >
        {/* =========================================
            HEADER
        ========================================= */}

        <div
          className="
            flex justify-between items-center
            mb-6
          "
        >
          <div>
            <h2
              className="
                font-semibold text-slate-900 text-lg
              "
            >
              Change Profile Photo
            </h2>

            <p
              className="
                mt-1
                text-slate-500 text-sm
              "
            >
              Upload a professional profile image.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            aria-label="Close"
            className="
              p-2
              text-slate-500
              hover:bg-slate-100
              rounded-xl
              disabled:opacity-50 transition
              disabled:cursor-not-allowed
            "
          >
            <X
              className="
                w-5 h-5
              "
              /
            >
          </button>
        </div>

        {/* =========================================
            PREVIEW
        ========================================= */}

        <div
          className="
            flex justify-center
            mb-6
          "
        >
          <div
            className="
              flex justify-center items-center overflow-hidden
              w-32 h-32
              bg-slate-100
              border border-slate-200 rounded-3xl
            "
          >
            {preview ? (
              <img
                src={preview}
                alt="Profile preview"
                className="
                  object-cover
                  w-full h-full
                "
                /
              >
            ) : (
              <ImageIcon
                className="
                  w-10 h-10
                  text-slate-400
                "
                /
              >
            )}
          </div>
        </div>

        {/* =========================================
            UPLOAD AREA
        ========================================= */}

        <button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          disabled={isUploading}
          className="flex flex-col items-center gap-3 hover:bg-blue-50 disabled:opacity-60 p-6 border-2 border-slate-300 hover:border-blue-500 border-dashed rounded-2xl w-full transition disabled:cursor-not-allowed"
        >
          <UploadCloud
            className="
              w-7 h-7
              text-blue-600
            "
            /
          >

          <span
            className="
              font-medium text-slate-700 text-sm
            "
          >
            Choose new photo
          </span>

          <span
            className="
              text-slate-500 text-xs
            "
          >
            JPG, PNG or WEBP up to 5MB
          </span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={isUploading}
          className="
            hidden
          "
          /
        >

        {/* =========================================
            SUCCESS STATE
        ========================================= */}

        {selectedFile && !error && (
          <div
            className="
              flex items-center
              mt-4 px-4 py-3
              text-emerald-700 text-sm
              bg-emerald-50
              rounded-xl
              gap-2
            "
          >
            <CheckCircle2
              className="
                w-4 h-4
              "
              /
            >

            Image ready for upload
          </div>
        )}

        {/* =========================================
            ERROR
        ========================================= */}

        {error && (
          <p
            role="alert"
            className="
              mt-4 px-4 py-3
              text-red-600 text-sm
              bg-red-50
              rounded-xl
            "
          >
            {error}
          </p>
        )}

        {/* =========================================
            ACTIONS
        ========================================= */}

        <div
          className="
            flex
            mt-6
            gap-3
          "
        >
          <button
            type="button"
            onClick={handleClose}
            disabled={isUploading}
            className="
              flex-1
              py-3
              font-medium text-slate-700 text-sm
              hover:bg-slate-50
              border border-slate-300 rounded-xl
              disabled:opacity-60 transition
              disabled:cursor-not-allowed
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleUpload}
            disabled={
              isUploading ||
              !selectedFile
            }
            className="
              flex-1
              py-3
              font-medium text-white text-sm
              bg-blue-600 hover:bg-blue-700
              rounded-xl
              disabled:opacity-60 transition
              disabled:cursor-not-allowed
            "
          >
            {isUploading
              ? "Uploading..."
              : "Save Photo"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePhotoModal;
