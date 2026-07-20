



import { Link } from "react-router-dom";
import {
  ShieldCheck,
  LockKeyhole,
  Activity,
  Globe2,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";


const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-[#030712] text-white">

      {/* =====================================================
          PREMIUM FINTECH BACKGROUND SYSTEM
      ===================================================== */}
      <div className="absolute inset-0 -z-10">

        <div className="
          absolute inset-0
          bg-[radial-gradient(circle_at_top,#1e3a8a_0%,transparent_40%)]
          opacity-40
        "/>


        <div className="
          absolute inset-0
          bg-gradient-to-b
          from-[#020617]
          via-[#050816]
          to-[#02030a]
        "/>


        {/* Financial grid */}
        <div
          className="
          absolute inset-0
          opacity-[0.04]
          bg-[linear-gradient(to_right,#fff_1px,transparent_1px),
          linear-gradient(to_bottom,#fff_1px,transparent_1px)]
          bg-[size:70px_70px]
          "
        />


        {/* Glow Orbs */}
        <div className="
          absolute top-20 left-10
          h-72 w-72
          bg-blue-500/20
          blur-[120px]
          rounded-full
        "/>

        <div className="
          absolute bottom-10 right-20
          h-80 w-80
          bg-cyan-400/10
          blur-[130px]
          rounded-full
        "/>

      </div>



      <div className="max-w-7xl mx-auto px-6 py-24">


        {/* =====================================================
            PREMIUM IDENTITY CARD
        ===================================================== */}

        <motion.div
          initial={{opacity:0,y:20}}
          whileInView={{opacity:1,y:0}}
          className="
          relative
          rounded-3xl
          border border-white/10
          bg-white/[0.04]
          backdrop-blur-xl
          p-8 md:p-10
          overflow-hidden
          "
        >

          {/* shine */}
          <div className="
            absolute inset-0
            bg-gradient-to-r
            from-transparent
            via-white/[0.05]
            to-transparent
            -translate-x-full
            hover:translate-x-full
            transition-transform
            duration-1000
          "/>



          <div className="relative flex flex-col lg:flex-row justify-between gap-10">


            <div className="max-w-xl">


              <div className="
                flex items-center gap-2
                text-blue-400
                text-xs
                font-semibold
                uppercase
                tracking-[0.2em]
              ">
                <Sparkles size={14}/>
                Intelligent Finance Platform
              </div>


              <h2 className="
                mt-5
                text-3xl md:text-4xl
                font-bold
                tracking-tight
              ">
                SmartBudget
                <span className="text-blue-400">
                  {" "}Financial System
                </span>
              </h2>


              <p className="
                mt-5
                text-white/60
                leading-7
              ">
                A next-generation financial intelligence platform built
                to help individuals and businesses understand,
                control, and optimize their money with confidence.
              </p>



              <div className="
                mt-8
                flex flex-wrap gap-3
              ">

                {[
                  {
                    icon:<LockKeyhole size={14}/>,
                    text:"Encrypted Data"
                  },
                  {
                    icon:<Activity size={14}/>,
                    text:"Real-Time Analytics"
                  },
                  {
                    icon:<ShieldCheck size={14}/>,
                    text:"Secure Infrastructure"
                  }
                ].map((item,index)=>(

                  <div
                    key={index}
                    className="
                    flex items-center gap-2
                    rounded-full
                    border border-white/10
                    bg-white/5
                    px-4 py-2
                    text-xs
                    text-white/70
                    "
                  >
                    {item.icon}
                    {item.text}
                  </div>

                ))}

              </div>

            </div>



            {/* TRUST PANEL */}

            <div className="
              lg:w-[340px]
              rounded-2xl
              border border-white/10
              bg-black/20
              p-6
            ">

              <p className="
                text-xs
                uppercase
                tracking-widest
                text-white/40
              ">
                Platform Status
              </p>


              <div className="
                mt-5
                flex items-center gap-3
              ">

                <span className="
                  h-3 w-3
                  rounded-full
                  bg-green-400
                  animate-pulse
                "/>

                <span className="text-sm">
                  Systems Operational
                </span>

              </div>



              <div className="
                mt-6
                grid grid-cols-2
                gap-4
              ">

                <div>
                  <p className="text-2xl font-bold">
                    99.9%
                  </p>
                  <span className="text-xs text-white/40">
                    Reliability
                  </span>
                </div>


                <div>
                  <p className="text-2xl font-bold">
                    24/7
                  </p>
                  <span className="text-xs text-white/40">
                    Monitoring
                  </span>
                </div>


              </div>


            </div>


          </div>


        </motion.div>





        {/* =====================================================
             NAVIGATION
        ===================================================== */}

        <div className="
          mt-20
          grid grid-cols-2
          md:grid-cols-4
          gap-10
        ">


          {[
            {
              title:"Product",
              links:[
                ["Features","/#features"],
                ["Pricing","/#pricing"],
                ["Login","/login"],
                ["Create Account","/signup"]
              ]
            },

            {
              title:"Company",
              links:[
                ["About","/"],
                ["Security","/"],
                ["Engineering","/"]
              ]
            },

            {
              title:"Legal",
              links:[
                ["Privacy","/"],
                ["Terms","/"],
                ["Compliance","/"]
              ]
            },


            {
              title:"Support",
              links:[
                ["Help Center","/"],
                ["System Status","/"],
                ["Security Report","/"]
              ]
            }


          ].map((column,index)=>(

            <div key={index}>

              <h3 className="
                text-sm
                font-semibold
                mb-5
              ">
                {column.title}
              </h3>


              <ul className="space-y-4">

                {column.links.map(([name,url])=>(

                  <li key={name}>

                    <Link
                      to={url}
                      className="
                      group
                      flex items-center gap-1
                      text-sm
                      text-white/50
                      hover:text-white
                      transition
                      "
                    >

                      {name}

                      <ArrowUpRight
                        size={13}
                        className="
                        opacity-0
                        group-hover:opacity-100
                        transition
                        "
                      />

                    </Link>

                  </li>

                ))}

              </ul>

            </div>

          ))}


        </div>





        {/* =====================================================
             FOOTER BAR
        ===================================================== */}


        <div
  className="
    relative
    mt-20
    pt-8
  "
>
  <div
    className="
      absolute
      top-0
      left-0
      w-full
      h-px
      bg-gradient-to-r
      from-transparent
      via-cyan-400/60
      to-transparent
    "
  />

  <div
    className="
      flex
      flex-col
      md:flex-row
      justify-between
      gap-5
      text-xs
      text-white/50
    
    "
  >
    <p >
      © {new Date().getFullYear()} SmartBudget Financial System.
      All rights reserved.
    </p>

    <div className="flex items-center gap-2">
      <Globe2 size={14} />
      Global Financial Intelligence Platform
    </div>
  </div>
</div>



      </div>


    </footer>
  );
};


export default Footer;