import {
  X,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

/*
============================================================
CHANGE PHOTO MODAL
============================================================

Responsibilities:
- Display current profile photo
- Allow user to select a new image
- Validate image type and size
- Show local preview
- Send selected file to parent
- Keep modal open when upload fails
- Close only through the parent's success flow

The actual API upload remains outside this component.
============================================================
*/

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ChangePhotoModal = ({
  open,
  currentImage = "",
  loading = false,
  onClose,
  onUpload,
}) => {
  /* ============================================================
     REFS
  ============================================================ */

  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);

  /* ============================================================
     STATE
  ============================================================ */

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(currentImage || "");
  const [error, setError] = useState("");

  /* ============================================================
     CLEAN PREVIEW URL
  ============================================================ */

  const revokePreviewUrl = useCallback(() => {
    if (!previewUrlRef.current) {
      return;
    }

    URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
  }, []);

  /* ============================================================
     RESET MODAL
  ============================================================ */

  const resetModal = useCallback(() => {
    revokePreviewUrl();

    setSelectedFile(null);
    setError("");
    setPreview(currentImage || "");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [currentImage, revokePreviewUrl]);

  /* ============================================================
     SYNC CURRENT IMAGE
  ============================================================ */

  useEffect(() => {
    if (!open) {
      return;
    }

    resetModal();
  }, [open, resetModal]);

  /* ============================================================
     COMPONENT CLEANUP
  ============================================================ */

  useEffect(() => {
    return () => {
      revokePreviewUrl();
    };
  }, [revokePreviewUrl]);

  /* ============================================================
     CLOSE MODAL
  ============================================================ */

  const handleClose = useCallback(() => {
    if (loading) {
      return;
    }

    resetModal();

    onClose?.();
  }, [loading, onClose, resetModal]);

  /* ============================================================
     FILE VALIDATION
  ============================================================ */

  const validateFile = useCallback((file) => {
    if (!file) {
      return "Please select an image.";
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "Only JPG, PNG, and WEBP images are supported.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "Image size must be less than 5MB.";
    }

    return "";
  }, []);

  /* ============================================================
     FILE SELECTION
  ============================================================ */

  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];

      if (!file) {
        return;
      }

      const validationError = validateFile(file);

      if (validationError) {
        revokePreviewUrl();

        setSelectedFile(null);
        setError(validationError);

        return;
      }

      revokePreviewUrl();

      const objectUrl = URL.createObjectURL(file);

      previewUrlRef.current = objectUrl;

      setSelectedFile(file);
      setPreview(objectUrl);
      setError("");
    },
    [revokePreviewUrl, validateFile]
  );

  /* ============================================================
     OPEN FILE PICKER
  ============================================================ */

  const handleChoosePhoto = useCallback(() => {
    if (loading) {
      return;
    }

    fileInputRef.current?.click();
  }, [loading]);

  /* ============================================================
     UPLOAD
  ============================================================ */

  const handleUpload = useCallback(async () => {
    if (loading) {
      return;
    }

    if (!selectedFile) {
      setError("Please select an image first.");
      return;
    }

    if (typeof onUpload !== "function") {
      setError(
        "Profile photo upload is not available."
      );

      return;
    }

    try {
      setError("");

      const result = await onUpload(selectedFile);

      /*
      Parent should return:

      {
        success: true,
        user: updatedUser
      }

      The parent controls the successful modal-close flow.
      */

      if (!result?.success) {
        setError(
          result?.message ||
            "Unable to update profile photo."
        );
      }
    } catch (uploadError) {
      console.error(
        "CHANGE_PHOTO_UPLOAD_ERROR:",
        uploadError
      );

      setError(
        uploadError?.message ||
          "Unable to update profile photo. Please try again."
      );
    }
  }, [loading, onUpload, selectedFile]);

  /* ============================================================
     ESCAPE KEY
  ============================================================ */

  useEffect(() => {
    if (!open || loading) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [open, loading, handleClose]);

  /* ============================================================
     RENDER
  ============================================================ */

  if (!open) {
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
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-photo-title"
    >
      <div
        className="
          overflow-y-auto
          w-full max-w-md max-h-[90vh]
          p-6
          bg-white
          border border-slate-200 rounded-3xl
          shadow-2xl
        "
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          className="
            flex justify-between items-start
            mb-6
            gap-4
          "
        >
          <div
            className="
              min-w-0
            "
          >
            <h2
              id="change-photo-title"
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
            disabled={loading}
            aria-label="Close profile photo modal"
            className="
              p-2
              text-slate-500
              hover:bg-slate-100
              rounded-xl
              disabled:opacity-50 transition
              disabled:cursor-not-allowed
              shrink-0
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

        {/* ==================================================
            IMAGE PREVIEW
        ================================================== */}

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

          </div>
        </div>

        {/* ==================================================
            FILE PICKER
        ================================================== */}

        <button
          type="button"
          onClick={handleChoosePhoto}
          disabled={loading}
          className="
            flex flex-col items-center
            w-full
            p-6
            hover:bg-blue-50
            border-2 border-slate-300 hover:border-blue-500 border-dashed
            rounded-2xl
            disabled:opacity-60 transition
            disabled:cursor-not-allowed
            gap-3
          "
        >
          <UploadCloud
            className="
              w-7 h-7
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
          disabled={loading}
          className="
            hidden
          "
          /
        >

        {/* ==================================================
            SELECTED FILE
        ================================================== */}

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
                shrink-0
              "
              aria-hidden="true"
            /
            >

            <span
              className="
                truncate
              "
            >
              {selectedFile.name}
            </span>
          </div>
        )}

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div
            role="alert"
            className="
              mt-4 px-4 py-3
              text-red-600 text-sm
              bg-red-50
              border border-red-100 rounded-xl
            "
          >
            {error}
          </div>
        )}

        {/* ==================================================
            ACTIONS
        ================================================== */}

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
            disabled={loading}
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
            disabled={loading || !selectedFile}
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
            {loading
              ? "Uploading..."
              : "Save Photo"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePhotoModal;