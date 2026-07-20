


// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import { ShieldCheck, Lock, Activity, Database } from "lucide-react";

// const CTA = () => {
//   return (
//     <section className="relative py-32 bg-[#05070D] text-white overflow-hidden">

//       {/* =========================
//          BACKGROUND SYSTEM (CONTROLLED DEPTH)
//       ========================= */}
//       <div className="absolute inset-0 -z-10">

//         {/* Base layer */}
//         <div className="absolute inset-0 bg-gradient-to-b from-[#05070D] via-[#040611] to-black" />

//         {/* Structural grid (financial system feel) */}
//         <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:80px_80px]" />

//         {/* Controlled institutional glow */}
//         <div className="absolute top-[-240px] left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-indigo-500/10 blur-3xl rounded-full" />
//       </div>

//       <div className="max-w-5xl mx-auto px-6 text-center">

//         {/* =========================
//            SYSTEM LABEL (NOT MARKETING)
//         ========================= */}
//         <motion.div
//           initial={{ opacity: 0, y: 8 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           className="
//             inline-flex items-center gap-2
//             px-4 py-2
//             rounded-full
//             border border-white/10
//             bg-white/[0.03]
//             text-[11px]
//             tracking-[0.2em]
//             uppercase
//             text-slate-300
//           "
//         >
//           <ShieldCheck size={14} className="text-emerald-400" />
//           Financial Control System Active
//         </motion.div>

//         {/* =========================
//            CORE STATEMENT (AUTHORITY-FIRST)
//         ========================= */}
//         <motion.h2
//           initial={{ opacity: 0, y: 18 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.5 }}
//           className="
//             mt-8
//             text-[38px]
//             md:text-[54px]
//             font-semibold
//             tracking-tight
//             leading-[1.1]
//             text-white
//           "
//         >
//           Activate structured financial
//           <br />
//           control infrastructure
//         </motion.h2>

//         {/* =========================
//            SYSTEM DESCRIPTION
//         ========================= */}
//         <motion.p
//           initial={{ opacity: 0, y: 14 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ delay: 0.1 }}
//           className="
//             mt-6
//             max-w-2xl
//             mx-auto
//             text-slate-400
//             text-[15px]
//             leading-7
//           "
//         >
//           SmartBudget operates as a financial governance layer that enforces
//           discipline, provides real-time cashflow visibility, and structures
//           user financial activity into measurable systems.
//         </motion.p>

//         {/* =========================
//            TRUST INFRASTRUCTURE BLOCKS
//         ========================= */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           whileInView={{ opacity: 1 }}
//           viewport={{ once: true }}
//           transition={{ delay: 0.2 }}
//           className="
//             mt-10
//             grid
//             grid-cols-1
//             sm:grid-cols-3
//             gap-4
//             text-left
//           "
//         >
//           <div className="border border-white/10 bg-white/[0.03] rounded-2xl p-4">
//             <div className="flex items-center gap-2 text-slate-300 text-xs">
//               <Lock size={14} className="text-emerald-400" />
//               Encrypted financial layer
//             </div>
//           </div>

//           <div className="border border-white/10 bg-white/[0.03] rounded-2xl p-4">
//             <div className="flex items-center gap-2 text-slate-300 text-xs">
//               <Activity size={14} className="text-cyan-400" />
//               Real-time transaction engine
//             </div>
//           </div>

//           <div className="border border-white/10 bg-white/[0.03] rounded-2xl p-4">
//             <div className="flex items-center gap-2 text-slate-300 text-xs">
//               <Database size={14} className="text-indigo-400" />
//               Structured budget governance
//             </div>
//           </div>
//         </motion.div>

//         {/* =========================
//            PRIMARY ACTION (SINGLE GATE)
//         ========================= */}
//         <motion.div
//           initial={{ opacity: 0, scale: 0.98 }}
//           whileInView={{ opacity: 1, scale: 1 }}
//           viewport={{ once: true }}
//           transition={{ delay: 0.25 }}
//           className="mt-12 flex justify-center"
//         >
//           <Link
//             to="/signup"
//             className="
//               group
//               relative
//               inline-flex
//               items-center
//               justify-center
//               px-8 py-4
//               rounded-xl
//               bg-white
//               text-black
//               font-semibold
//               text-sm
//               transition
//               hover:bg-slate-200
//             "
//           >
//             Initialize Financial Account

//             <span className="ml-2 transition-transform group-hover:translate-x-1">
//               →
//             </span>
//           </Link>
//         </motion.div>

//         {/* =========================
//            COMPLIANCE FOOTNOTE
//         ========================= */}
//         <p className="mt-10 text-[11px] text-slate-500">
//           System access governed by standard financial security protocols.
//           No banking license required.
//         </p>
//       </div>
//     </section>
//   );
// };

// export default CTA;


import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  TrendingUp,
  Sparkles,
  Wallet,
  CheckCircle2,
} from "lucide-react";


const CTA = () => {

  return (

    <section
      className="
      relative
      overflow-hidden
      py-32
      bg-[#040812]
      text-white
      "
    >


      {/* =========================
          PREMIUM BACKGROUND SYSTEM
      ========================== */}

      <div className="absolute inset-0">


        <div
          className="
          absolute inset-0
          bg-gradient-to-b
          from-[#07111F]
          via-[#040812]
          to-black
          "
        />


        {/* Financial network glow */}

        <div
          className="
          absolute
          top-[-250px]
          left-1/2
          -translate-x-1/2
          w-[850px]
          h-[850px]
          rounded-full
          bg-cyan-500/10
          blur-[150px]
          "
        />


        <div
          className="
          absolute
          bottom-[-200px]
          right-[-100px]
          w-[500px]
          h-[500px]
          rounded-full
          bg-emerald-500/10
          blur-[120px]
          "
        />


        {/* System grid */}

        <div
          className="
          absolute
          inset-0
          opacity-[0.04]
          bg-[linear-gradient(to_right,#fff_1px,transparent_1px),
          linear-gradient(to_bottom,#fff_1px,transparent_1px)]
          bg-[size:70px_70px]
          "
        />

      </div>





      <div
        className="
        relative
        max-w-6xl
        mx-auto
        px-6
        "
      >



        <div
          className="
          grid
          lg:grid-cols-2
          gap-16
          items-center
          "
        >





          {/* =========================
              LEFT CONTENT
          ========================== */}


          <div>


            <motion.div

              initial={{
                opacity:0,
                y:15
              }}

              whileInView={{
                opacity:1,
                y:0
              }}

              viewport={{
                once:true
              }}

              className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-full
              border
              border-emerald-400/20
              bg-emerald-400/10
              text-xs
              text-emerald-300
              "

            >

              <ShieldCheck size={14}/>

              Enterprise financial security enabled


            </motion.div>





            <motion.h2

              initial={{
                opacity:0,
                y:20
              }}

              whileInView={{
                opacity:1,
                y:0
              }}

              viewport={{
                once:true
              }}

              className="
              mt-8
              text-4xl
              md:text-6xl
              font-bold
              leading-[1.05]
              tracking-tight
              "

            >

              Take control of your money
              before money controls you.


            </motion.h2>





            <motion.p

              initial={{
                opacity:0
              }}

              whileInView={{
                opacity:1
              }}

              viewport={{
                once:true
              }}

              className="
              mt-6
              max-w-xl
              text-slate-400
              leading-7
              "

            >

              SmartBudget gives you a complete financial command
              center to track spending, manage budgets, understand
              cash flow and build better money habits.

            </motion.p>






            {/* FEATURES */}

            <div
              className="
              mt-8
              space-y-4
              "
            >


              {[
                "Real-time expense visibility",
                "Smart budget management",
                "Secure financial tracking"
              ].map((item)=>(


                <div

                key={item}

                className="
                flex
                items-center
                gap-3
                text-sm
                text-slate-300
                "

                >

                  <CheckCircle2
                    size={17}
                    className="text-emerald-400"
                  />

                  {item}

                </div>


              ))}


            </div>






            {/* CTA BUTTON */}


            <motion.div

              whileHover={{
                scale:1.03
              }}

              whileTap={{
                scale:.98
              }}

              className="
              mt-10
              "

            >

              <Link

                to="/signup"

                className="
                inline-flex
                items-center
                gap-3
                px-9
                py-4
                rounded-2xl
                bg-gradient-to-r
                from-cyan-400
                to-emerald-400
                text-black
                font-semibold
                shadow-xl
                shadow-cyan-500/20
                transition
                "

              >

                Start Building Wealth

                <span>
                  →
                </span>


              </Link>


            </motion.div>






            <p
              className="
              mt-5
              text-xs
              text-slate-500
              "
            >

              Free account creation • Secure encryption • No hidden charges

            </p>



          </div>









          {/* =========================
              RIGHT FINANCIAL PANEL
          ========================== */}



          <motion.div

            initial={{
              opacity:0,
              scale:.95
            }}

            whileInView={{
              opacity:1,
              scale:1
            }}

            viewport={{
              once:true
            }}

            className="
            relative
            "

          >


            <div

              className="
              rounded-[30px]
              border
              border-white/10
              bg-white/[0.06]
              backdrop-blur-xl
              p-8
              shadow-[0_30px_100px_rgba(0,0,0,.5)]
              "

            >



              <div
                className="
                flex
                justify-between
                items-center
                "
              >


                <div>


                  <p
                    className="
                    text-xs
                    text-slate-400
                    "
                  >

                    Financial Overview

                  </p>


                  <h3
                    className="
                    mt-2
                    text-3xl
                    font-bold
                    "
                  >

                    ₦245,800

                  </h3>


                </div>



                <div
                  className="
                  h-12
                  w-12
                  rounded-xl
                  bg-cyan-400/10
                  flex
                  items-center
                  justify-center
                  "
                >

                  <Wallet
                    className="text-cyan-300"
                  />

                </div>


              </div>






              <div
                className="
                mt-10
                h-32
                rounded-2xl
                bg-gradient-to-r
                from-cyan-400/20
                to-emerald-400/20
                border
                border-white/10
                flex
                items-end
                p-5
                "
              >


                <TrendingUp
                  size={45}
                  className="text-emerald-300"
                />


              </div>





              <div
                className="
                mt-8
                grid
                grid-cols-2
                gap-4
                "
              >


                <div
                  className="
                  rounded-xl
                  bg-white/5
                  border
                  border-white/10
                  p-4
                  "
                >

                  <Lock
                    size={16}
                    className="text-emerald-400"
                  />

                  <p
                    className="
                    mt-3
                    text-xs
                    text-slate-400
                    "
                  >

                    Protected

                  </p>


                </div>



                <div
                  className="
                  rounded-xl
                  bg-white/5
                  border
                  border-white/10
                  p-4
                  "
                >

                  <Sparkles
                    size={16}
                    className="text-cyan-400"
                  />

                  <p
                    className="
                    mt-3
                    text-xs
                    text-slate-400
                    "
                  >

                    Smart Insights

                  </p>


                </div>



              </div>




            </div>



          </motion.div>




        </div>


      </div>


    </section>

  );

};


export default CTA;