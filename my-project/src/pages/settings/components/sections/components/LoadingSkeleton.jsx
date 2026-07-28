const LoadingSkeleton = ({
  variant = "card",
  className = "",
}) => {


  const variants = {


    text: (

      <div
        className="
          w-32 h-4
          bg-slate-200
          rounded-lg
          animate-pulse
        "
        /
      >

    ),





    title: (

      <div
        className="
          w-48 h-6
          bg-slate-200
          rounded-lg
          animate-pulse
        "
        /
      >

    ),






    avatar: (

      <div
        className="
          w-20 h-20
          bg-slate-200
          rounded-2xl
          animate-pulse
        "
        /
      >

    ),






    input: (

      <div
        className="
          w-full h-12
          bg-slate-200
          rounded-xl
          animate-pulse
        "
        /
      >

    ),






    button: (

      <div
        className="
          w-32 h-10
          bg-slate-200
          rounded-xl
          animate-pulse
        "
        /
      >

    ),






    profile: (

      <div
        className="
          space-y-5
        "
      >

        <div
          className="
            flex items-center
            gap-4
          "
        >

          <div
            className="
              w-24 h-24
              bg-slate-200
              rounded-3xl
              animate-pulse
            "
            /
          >


          <div
            className="
              space-y-3
            "
          >

            <div
              className="
                w-40 h-5
                bg-slate-200
                rounded-lg
                animate-pulse
              "
              /
            >


            <div
              className="
                w-28 h-4
                bg-slate-200
                rounded-lg
                animate-pulse
              "
              /
            >

          </div>


        </div>



        <div
          className="
            grid grid-cols-1 md:grid-cols-2
            gap-4
          "
        >

          {
            Array.from({
              length:4
            }).map((_,index)=>(

              <div
                key={index}
                className="
                  h-20
                  bg-slate-200
                  rounded-2xl
                  animate-pulse
                "
                /
              >

            ))
          }


        </div>


      </div>

    ),








    card: (

      <div
        className="
          space-y-5 p-6
          bg-white
          border border-slate-200 rounded-3xl
        "
      >

        <div
          className="
            w-44 h-6
            bg-slate-200
            rounded-lg
            animate-pulse
          "
          /
        >


        <div
          className="
            w-64 h-4
            bg-slate-200
            rounded-lg
            animate-pulse
          "
          /
        >



        <div
          className="
            w-full h-32
            bg-slate-200
            rounded-2xl
            animate-pulse
          "
          /
        >

      </div>

    ),







    list: (

      <div
        className="
          space-y-3
        "
      >

        {
          Array.from({
            length:5
          }).map((_,index)=>(

            <div
              key={index}
              className="
                flex items-center
                p-4
                border border-slate-200 rounded-2xl
                gap-4
              "
            >

              <div
                className="
                  w-10 h-10
                  bg-slate-200
                  rounded-xl
                  animate-pulse
                "
                /
              >


              <div
                className="
                  flex-1
                  space-y-2
                "
              >

                <div
                  className="
                    w-40 h-4
                    bg-slate-200
                    rounded-lg
                    animate-pulse
                  "
                  /
                >


                <div
                  className="
                    w-56 h-3
                    bg-slate-200
                    rounded-lg
                    animate-pulse
                  "
                  /
                >


              </div>


            </div>

          ))
        }

      </div>

    ),




  };





  return (

    <div
      className={className}
    >

      {
        variants[variant]
      }

    </div>

  );

};



export default LoadingSkeleton;