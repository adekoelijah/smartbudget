import {
  X,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";

import {
  useState,
  useRef,
} from "react";



const ChangePhotoModal = ({
  isOpen,
  onClose,
  currentPhoto,
  onUpload,
}) => {


  const fileInputRef = useRef(null);


  const [selectedFile, setSelectedFile] = useState(null);

  const [preview, setPreview] = useState(
    currentPhoto || null
  );

  const [isUploading, setIsUploading] = useState(false);

  const [error, setError] = useState("");




  if (!isOpen) return null;




  const handleFileChange = (event) => {

    const file =
      event.target.files?.[0];


    if (!file) return;



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



    if (file.size > 5 * 1024 * 1024) {

      setError(
        "Image size must be less than 5MB."
      );

      return;

    }



    setError("");

    setSelectedFile(file);



    const imageUrl =
      URL.createObjectURL(file);


    setPreview(imageUrl);

  };





  const handleUpload = async () => {

    if (!selectedFile) {

      setError(
        "Please select an image first."
      );

      return;

    }



    try {

      setIsUploading(true);

      setError("");



      await onUpload?.(selectedFile);



      onClose();



    } catch(error){

      setError(
        "Unable to update profile photo. Please try again.", error
      );

    }
    finally{

      setIsUploading(false);

    }

  };





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


        {/* Header */}

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
            onClick={onClose}
            className="
              p-2
              text-slate-500
              hover:bg-slate-100
              rounded-xl
            "
          >

            <X size={20}/>

          </button>


        </div>





        {/* Preview */}

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

            {
              preview
              ?

              <img
                src={preview}
                alt="Profile preview"
                className="
                  object-cover
                  w-full h-full
                "
                /
              >

              :

              <ImageIcon
                size={40}
                className="
                  text-slate-400
                "
                /
              >

            }


          </div>


        </div>





        {/* Upload Area */}

        <button
          onClick={() =>
            fileInputRef.current?.click()
          }
          className="flex flex-col items-center gap-3 hover:bg-blue-50 p-6 border-2 border-slate-300 hover:border-blue-500 border-dashed rounded-2xl w-full transition"
        >

          <UploadCloud
            size={28}
            className="
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
          className="
            hidden
          "
          /
        >





        {/* Success Preview */}

        {
          selectedFile && !error && (

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

              <CheckCircle2 size={16}/>

              Image ready for upload

            </div>

          )

        }





        {/* Error */}

        {
          error && (

            <p
              className="
                mt-4 px-4 py-3
                text-red-600 text-sm
                bg-red-50
                rounded-xl
              "
            >
              {error}
            </p>

          )
        }






        {/* Actions */}

        <div
          className="
            flex
            mt-6
            gap-3
          "
        >

          <button
            onClick={onClose}

            disabled={isUploading}
            className="
              flex-1
              py-3
              font-medium text-slate-700 text-sm
              hover:bg-slate-50
              border border-slate-300 rounded-xl
            "
          >

            Cancel

          </button>




          <button
            onClick={handleUpload}

            disabled={isUploading}
            className="
              flex-1
              py-3
              font-medium text-white text-sm
              bg-blue-600 hover:bg-blue-700
              rounded-xl
              disabled:opacity-60
            "
          >

            {
              isUploading
              ?
              "Uploading..."
              :
              "Save Photo"
            }


          </button>


        </div>



      </div>


    </div>

  );

};


export default ChangePhotoModal;