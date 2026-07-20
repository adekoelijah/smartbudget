import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";

const HeroBackground = () => {

  // ===============================
  // MOUSE REACTIVE LIGHT
  // ===============================

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, {
    stiffness: 80,
    damping: 20,
  });

  const springY = useSpring(mouseY, {
    stiffness: 80,
    damping: 20,
  });


  useEffect(() => {

    const handleMouseMove = (e) => {

      const x =
        (e.clientX / window.innerWidth - 0.5) * 100;

      const y =
        (e.clientY / window.innerHeight - 0.5) * 100;


      mouseX.set(x);
      mouseY.set(y);

    };


    window.addEventListener(
      "mousemove",
      handleMouseMove
    );


    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );
    };

  }, [mouseX, mouseY]);



  // ===============================
  // PARTICLES
  // ===============================

  const particles = Array.from(
    { length: 35 }
  );



  return (

    <div
      className="
        absolute
        inset-0
        -z-10
        overflow-hidden
        bg-[#020617]
      "
    >


      {/* =================================
          GRID SYSTEM
      ================================= */}

      <motion.div

        style={{
          x: springX,
          y: springY,
        }}

        className="
          absolute
          inset-[-100px]

          bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),
          linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)]

          bg-[size:80px_80px]

          opacity-40
        "

      />



      {/* =================================
          MAIN AI GLOW
      ================================= */}

      <motion.div

        animate={{
          scale:[1,1.15,1],
          opacity:[0.3,0.5,0.3]
        }}

        transition={{
          duration:8,
          repeat:Infinity,
          ease:"easeInOut"
        }}

        className="
          absolute

          top-[-300px]
          left-1/2

          -translate-x-1/2

          w-[900px]
          h-[900px]

          rounded-full

          bg-emerald-500/20

          blur-[140px]
        "

      />



      {/* =================================
          SIDE CYAN LIGHT
      ================================= */}

      <motion.div

        animate={{
          x:[0,40,0],
          y:[0,-30,0]
        }}

        transition={{
          duration:10,
          repeat:Infinity,
          ease:"easeInOut"
        }}

        className="
          absolute

          right-[-200px]
          top-[150px]

          w-[600px]
          h-[600px]

          rounded-full

          bg-cyan-500/10

          blur-[120px]
        "

      />




      {/* =================================
          FLOATING AI PARTICLES
      ================================= */}


      {
        particles.map((_,index)=> (

          <motion.div

            key={index}

            initial={{
              opacity:0,
              y:100
            }}

            animate={{

              opacity:[
                0,
                1,
                0
              ],

              y:[
                0,
                -150,
                -300
              ]

            }}

            transition={{

              duration:
                5 + Math.random()*5,

              repeat:Infinity,

              delay:
                Math.random()*5,

              ease:"linear"

            }}


            className="
              absolute

              h-1.5
              w-1.5

              rounded-full

              bg-emerald-400

              shadow-[0_0_20px_rgba(16,185,129,0.8)]
            "


            style={{

              left:
                `${Math.random()*100}%`,

              top:
                `${50 + Math.random()*50}%`

            }}

          />

        ))
      }





      {/* =================================
          AI NETWORK NODES
      ================================= */}


      <div
        className="
          absolute
          inset-0
          opacity-30
        "
      >

        {
          [
            [20,30],
            [75,25],
            [85,70],
            [30,80],
          ].map(
            ([x,y],index)=>(

              <motion.div

                key={index}

                animate={{
                  scale:[
                    1,
                    1.4,
                    1
                  ],

                  opacity:[
                    .4,
                    1,
                    .4
                  ]

                }}

                transition={{
                  duration:3,
                  repeat:Infinity,
                  delay:index
                }}

                style={{
                  left:`${x}%`,
                  top:`${y}%`
                }}

                className="
                  absolute

                  h-3
                  w-3

                  rounded-full

                  bg-emerald-400

                  shadow-[0_0_40px_rgba(16,185,129,1)]
                "

              />

            )
          )
        }

      </div>




      {/* =================================
          BOTTOM FADE
      ================================= */}

      <div

        className="
          absolute
          inset-x-0
          bottom-0

          h-[350px]

          bg-gradient-to-t

          from-black

          to-transparent
        "

      />


    </div>

  );

};


export default HeroBackground;