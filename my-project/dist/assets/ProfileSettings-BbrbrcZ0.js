import{a as e}from"./chunk-BEqpzyXh.js";import{n as t,t as n}from"./jsx-runtime-BwJb0T-f.js";import{t as r}from"./createLucideIcon-DfMeEbqo.js";import{n as i,t as a}from"./user-D9fxW-9b.js";import{t as o}from"./circle-check--AfZ0xG1.js";import{t as s}from"./globe-DQ5SRHEq.js";import{t as c}from"./landmark-QyHPK_HO.js";import{t as l}from"./loader-circle-BlHdMQQK.js";import{t as u}from"./mail-C7cJ7Jyn.js";import{t as d}from"./shield-check-BM7qxmGv.js";import{t as f}from"./sparkles-DZ5-Y4oI.js";import{t as p}from"./wallet-Cftc2-An.js";import{t as m}from"./proxy-D0cttOaj.js";import{t as h}from"./AnimatePresence-CKVGuK5w.js";import{n as g}from"./UserContext-B2K8n0Ac.js";import{t as _}from"./usePreferences-D6x-Wlcc.js";var v=r(`bell-ring`,[[`path`,{d:`M10.268 21a2 2 0 0 0 3.464 0`,key:`vwvbt9`}],[`path`,{d:`M22 8c0-2.3-.8-4.3-2-6`,key:`5bb3ad`}],[`path`,{d:`M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326`,key:`11g9vi`}],[`path`,{d:`M4 2C2.8 3.7 2 5.7 2 8`,key:`tap9e0`}]]),y=r(`camera`,[[`path`,{d:`M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z`,key:`18u6gg`}],[`circle`,{cx:`12`,cy:`13`,r:`3`,key:`1vg3eu`}]]),b=r(`upload`,[[`path`,{d:`M12 3v12`,key:`1x0j5s`}],[`path`,{d:`m17 8-5-5-5 5`,key:`7q97r8`}],[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`,key:`ih7n3h`}]]),x=e(t(),1),S=()=>{let{user:e,loading:t,saveProfile:n,changeAvatar:r}=g(),[i,a]=(0,x.useState)({name:``,email:``,avatar:``}),[o,s]=(0,x.useState)(null),[c,l]=(0,x.useState)(``);return(0,x.useEffect)(()=>{e&&a(t=>{let n={name:e.name||``,email:e.email||``,avatar:e.avatar||``};return t.name===n.name&&t.email===n.email&&t.avatar===n.avatar?t:n})},[e?._id]),{profile:i,preview:o,loading:t,message:c,updateField:(e,t)=>{a(n=>({...n,[e]:t}))},setAvatar:async e=>{s(URL.createObjectURL(e)),await r(e)},saveProfile:async()=>{await n(i),l(`Profile synced successfully`)}}},C=n(),w={en:{connecting:`Connecting to secure banking server...`,personalInfo:`Personal Information`,syncDesc:`Real-time profile synchronization with banking infrastructure`,fullName:`Full Name`,email:`Email Address`,enterName:`Enter your full legal name`,enterEmail:`Enter secure email address`,secureProfile:`Secure Financial Profile`,secureDesc:`All profile updates are encrypted and synchronized securely with your SmartBudget banking identity infrastructure in real-time.`,ready:`Ready for secure synchronization`,syncing:`Syncing Securely...`,save:`Save & Sync Profile`,verified:`KYC Verified`,security:`Bank-Level Security`,active:`Active`,accountStatus:`Account Status`,securityLevel:`Security Level`,vault:`Financial Identity Vault`,secureCore:`SmartBudget Secure Core`,infrastructure:`Banking Security Infrastructure`,infrastructureDesc:`AES-256 encryption • Real-time sync • Device protection`,encrypted:`Encrypted`,protected:`Protected`,synced:`Synced`,language:`Language`,currency:`Currency`,notifications:`Notifications`},yo:{connecting:`N so pọ mọ olupin ifowopamọ to ni aabo...`,personalInfo:`Alaye Ara Ẹni`,syncDesc:`Ìmúdójúìwọ̀n profaili lẹ́sẹ̀kẹsẹ̀ pẹlu amáyédẹrùn ifowopamọ`,fullName:`Orukọ Kikun`,email:`Adirẹsi Imeeli`,enterName:`Tẹ orukọ rẹ ni kikun sii`,enterEmail:`Tẹ imeeli aabo sii`,secureProfile:`Profaili Inawo Aabo`,secureDesc:`Gbogbo imudojuiwọn profaili ni a pa mọ́ ati muuṣiṣẹpọ ni aabo pẹlu amáyédẹrùn idanimọ SmartBudget rẹ.`,ready:`Ṣetan fun imuṣiṣẹpọ aabo`,syncing:`N muuṣiṣẹpọ ni aabo...`,save:`Fipamọ & Muuṣiṣẹpọ`,verified:`A ti Jẹrisi KYC`,security:`Aabo Ipele Banki`,active:`Nṣiṣẹ`,accountStatus:`Ipo Account`,securityLevel:`Ipele Aabo`,vault:`Ile Ipamọ Idanimọ Inawo`,secureCore:`SmartBudget Secure Core`,infrastructure:`Amáyédẹrùn Aabo Ifowopamọ`,infrastructureDesc:`Ìfipamọ AES-256 • Muuṣiṣẹpọ lẹsẹkẹsẹ • Idaabobo ẹrọ`,encrypted:`Ti Pa Mọ`,protected:`Ni Idaabobo`,synced:`Ti Muuṣiṣẹpọ`,language:`Ede`,currency:`Owo`,notifications:`Ìfitónilétí`}},T=()=>{let{profile:e,preview:t,loading:n,message:r,updateField:T,setAvatar:E,saveProfile:D}=S(),{prefs:O}=_(),{user:k}=g(),[A,j]=(0,x.useState)(``),M=O?.language||`en`,N=O?.currency||`NGN`,P=w[M];(0,x.useEffect)(()=>{k&&(k.name!==e?.name&&T(`name`,k.name||``),k.email!==e?.email&&T(`email`,k.email||``))},[k]);let F=(0,x.useMemo)(()=>n||!e?.name?.trim()||!e?.email?.trim(),[n,e]),I=(0,x.useMemo)(()=>e?.name?e.name.split(` `).map(e=>e[0]).join(``).slice(0,2).toUpperCase():`SB`,[e]);return e?(0,C.jsxs)(`div`,{className:`space-y-8`,children:[(0,C.jsxs)(m.div,{initial:{opacity:0,y:12},animate:{opacity:1,y:0},className:`\r
          relative overflow-hidden\r
          rounded-[32px]\r
          border border-slate-800\r
          bg-gradient-to-br\r
          from-slate-950\r
          via-slate-900\r
          to-indigo-950\r
          p-8\r
          shadow-[0_20px_80px_rgba(0,0,0,0.45)]\r
        `,children:[(0,C.jsx)(`div`,{className:`\r
            absolute -top-20 right-0\r
            h-72 w-72\r
            rounded-full\r
            bg-cyan-500/10\r
            blur-3xl\r
          `}),(0,C.jsx)(`div`,{className:`\r
            absolute bottom-0 left-0\r
            h-56 w-56\r
            rounded-full\r
            bg-emerald-500/10\r
            blur-3xl\r
          `}),(0,C.jsxs)(`div`,{className:`\r
            relative z-10\r
            flex flex-col gap-8\r
            xl:flex-row\r
            xl:items-center\r
            xl:justify-between\r
          `,children:[(0,C.jsxs)(`div`,{className:`\r
              flex flex-col gap-6\r
              md:flex-row md:items-center\r
            `,children:[(0,C.jsxs)(`div`,{className:`relative`,children:[(0,C.jsx)(m.div,{whileHover:{scale:1.02},className:`\r
                  h-24 w-24 overflow-hidden\r
                  rounded-3xl\r
                  border border-white/10\r
                  bg-gradient-to-br\r
                  from-slate-800\r
                  to-slate-900\r
                  shadow-2xl\r
                `,children:t||e.avatar?(0,C.jsx)(`img`,{src:t||e.avatar,alt:`avatar`,className:`\r
                      h-full w-full\r
                      object-cover\r
                    `}):(0,C.jsx)(`div`,{className:`\r
                      flex h-full w-full\r
                      items-center justify-center\r
                      text-2xl font-bold\r
                      text-white\r
                    `,children:I})}),(0,C.jsxs)(`label`,{className:`\r
                  absolute -bottom-2 -right-2\r
                  flex h-10 w-10\r
                  cursor-pointer\r
                  items-center justify-center\r
                  rounded-2xl\r
                  border border-white/10\r
                  bg-black text-white\r
                  shadow-lg\r
                  transition\r
                  hover:scale-105\r
                `,children:[(0,C.jsx)(y,{size:16}),(0,C.jsx)(`input`,{type:`file`,accept:`image/*`,hidden:!0,onChange:e=>{e.target.files?.[0]&&E(e.target.files[0])}})]})]}),(0,C.jsxs)(`div`,{className:`space-y-3`,children:[(0,C.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,C.jsx)(`h2`,{className:`\r
                    text-2xl\r
                    font-bold\r
                    text-white\r
                  `,children:e?.name||`SmartBudget User`}),(0,C.jsx)(i,{size:18,className:`\r
                    text-emerald-400\r
                  `})]}),(0,C.jsx)(`p`,{className:`text-sm text-slate-400`,children:e?.email}),(0,C.jsxs)(`div`,{className:`\r
                  flex flex-wrap\r
                  items-center gap-3\r
                `,children:[(0,C.jsxs)(`div`,{className:`\r
                    flex items-center gap-2\r
                    rounded-full\r
                    border border-cyan-500/20\r
                    bg-cyan-500/10\r
                    px-3 py-1.5\r
                    text-xs font-semibold\r
                    text-cyan-400\r
                  `,children:[(0,C.jsx)(s,{size:13}),P.language,`:`,` `,(0,C.jsx)(`span`,{className:`capitalize`,children:M===`yo`?`Yorùbá`:`English`})]}),(0,C.jsxs)(`div`,{className:`\r
                    flex items-center gap-2\r
                    rounded-full\r
                    border border-emerald-500/20\r
                    bg-emerald-500/10\r
                    px-3 py-1.5\r
                    text-xs font-semibold\r
                    text-emerald-400\r
                  `,children:[(0,C.jsx)(p,{size:13}),P.currency,`:`,` `,N]}),(0,C.jsxs)(`div`,{className:`\r
                    flex items-center gap-2\r
                    rounded-full\r
                    border border-violet-500/20\r
                    bg-violet-500/10\r
                    px-3 py-1.5\r
                    text-xs font-semibold\r
                    text-violet-400\r
                  `,children:[(0,C.jsx)(v,{size:13}),P.notifications]})]}),(0,C.jsxs)(`div`,{className:`\r
                  flex flex-wrap\r
                  items-center gap-3\r
                  pt-2\r
                `,children:[(0,C.jsxs)(`div`,{className:`\r
                    flex items-center gap-2\r
                    rounded-full\r
                    border border-emerald-500/20\r
                    bg-emerald-500/10\r
                    px-3 py-1.5\r
                    text-xs font-semibold\r
                    text-emerald-400\r
                  `,children:[(0,C.jsx)(o,{size:13}),P.verified]}),(0,C.jsxs)(`div`,{className:`\r
                    flex items-center gap-2\r
                    rounded-full\r
                    border border-cyan-500/20\r
                    bg-cyan-500/10\r
                    px-3 py-1.5\r
                    text-xs font-semibold\r
                    text-cyan-400\r
                  `,children:[(0,C.jsx)(d,{size:13}),P.security]})]})]})]}),(0,C.jsxs)(`div`,{className:`\r
              rounded-3xl\r
              border border-white/10\r
              bg-white/[0.03]\r
              p-5\r
              backdrop-blur-xl\r
            `,children:[(0,C.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,C.jsx)(`div`,{className:`\r
                  flex h-12 w-12\r
                  items-center justify-center\r
                  rounded-2xl\r
                  bg-emerald-500/10\r
                  text-emerald-400\r
                `,children:(0,C.jsx)(c,{size:22})}),(0,C.jsxs)(`div`,{children:[(0,C.jsx)(`p`,{className:`\r
                    text-xs uppercase\r
                    tracking-widest\r
                    text-slate-500\r
                  `,children:P.secureCore}),(0,C.jsx)(`h3`,{className:`\r
                    text-lg font-semibold\r
                    text-white\r
                  `,children:P.vault})]})]}),(0,C.jsxs)(`div`,{className:`\r
                mt-5 grid\r
                grid-cols-2 gap-4\r
              `,children:[(0,C.jsxs)(`div`,{className:`\r
                  rounded-2xl\r
                  bg-black/30 p-4\r
                `,children:[(0,C.jsx)(`p`,{className:`\r
                    text-xs text-slate-500\r
                  `,children:P.accountStatus}),(0,C.jsxs)(`div`,{className:`\r
                    mt-2 flex\r
                    items-center gap-2\r
                  `,children:[(0,C.jsx)(`span`,{className:`\r
                      h-2 w-2\r
                      rounded-full\r
                      bg-emerald-400\r
                      animate-pulse\r
                    `}),(0,C.jsx)(`p`,{className:`\r
                      text-sm font-semibold\r
                      text-emerald-400\r
                    `,children:P.active})]})]}),(0,C.jsxs)(`div`,{className:`\r
                  rounded-2xl\r
                  bg-black/30 p-4\r
                `,children:[(0,C.jsx)(`p`,{className:`\r
                    text-xs text-slate-500\r
                  `,children:P.securityLevel}),(0,C.jsx)(`p`,{className:`\r
                    mt-1 text-sm\r
                    font-semibold\r
                    text-cyan-400\r
                  `,children:`Tier IV`})]})]})]})]})]}),(0,C.jsxs)(m.div,{initial:{opacity:0,y:12},animate:{opacity:1,y:0},transition:{delay:.05},className:`\r
          rounded-[32px]\r
          border border-slate-800\r
          bg-[#020617]\r
          shadow-[0_20px_60px_rgba(0,0,0,0.35)]\r
        `,children:[(0,C.jsx)(`div`,{className:`\r
            border-b border-slate-800\r
            p-6\r
          `,children:(0,C.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,C.jsx)(`div`,{className:`\r
                rounded-2xl\r
                bg-emerald-500/10\r
                p-3\r
                text-emerald-400\r
              `,children:(0,C.jsx)(f,{size:18})}),(0,C.jsxs)(`div`,{children:[(0,C.jsx)(`h3`,{className:`\r
                  text-lg font-semibold\r
                  text-white\r
                `,children:P.personalInfo}),(0,C.jsx)(`p`,{className:`\r
                  mt-1 text-sm\r
                  text-slate-400\r
                `,children:P.syncDesc})]})]})}),(0,C.jsxs)(`form`,{onSubmit:async e=>{e.preventDefault(),await D()},className:`space-y-6 p-6`,children:[(0,C.jsxs)(`div`,{className:`space-y-2`,children:[(0,C.jsxs)(`label`,{className:`\r
                flex items-center gap-2\r
                text-xs font-medium\r
                uppercase tracking-wider\r
                text-slate-500\r
              `,children:[(0,C.jsx)(a,{size:14}),P.fullName]}),(0,C.jsx)(`div`,{className:`
                rounded-2xl border
                bg-slate-950
                transition-all
                ${A===`name`?`
                      border-emerald-500
                      shadow-[0_0_0_4px_rgba(16,185,129,0.08)]
                    `:`border-slate-800`}
              `,children:(0,C.jsx)(`input`,{value:e.name||``,onFocus:()=>j(`name`),onBlur:()=>j(``),onChange:e=>T(`name`,e.target.value),className:`\r
                  w-full bg-transparent\r
                  px-5 py-4\r
                  text-white\r
                  outline-none\r
                  placeholder:text-slate-600\r
                `,placeholder:P.enterName})})]}),(0,C.jsxs)(`div`,{className:`space-y-2`,children:[(0,C.jsxs)(`label`,{className:`\r
                flex items-center gap-2\r
                text-xs font-medium\r
                uppercase tracking-wider\r
                text-slate-500\r
              `,children:[(0,C.jsx)(u,{size:14}),P.email]}),(0,C.jsx)(`div`,{className:`
                rounded-2xl border
                bg-slate-950
                transition-all
                ${A===`email`?`
                      border-cyan-500
                      shadow-[0_0_0_4px_rgba(6,182,212,0.08)]
                    `:`border-slate-800`}
              `,children:(0,C.jsx)(`input`,{type:`email`,value:e.email||``,onFocus:()=>j(`email`),onBlur:()=>j(``),onChange:e=>T(`email`,e.target.value),className:`\r
                  w-full bg-transparent\r
                  px-5 py-4\r
                  text-white\r
                  outline-none\r
                  placeholder:text-slate-600\r
                `,placeholder:P.enterEmail})})]}),(0,C.jsxs)(`div`,{className:`\r
              flex items-start gap-3\r
              rounded-2xl\r
              border border-amber-500/10\r
              bg-amber-500/5\r
              p-4\r
            `,children:[(0,C.jsx)(d,{size:18,className:`\r
                mt-0.5 text-amber-400\r
              `}),(0,C.jsxs)(`div`,{children:[(0,C.jsx)(`p`,{className:`\r
                  text-sm font-semibold\r
                  text-amber-300\r
                `,children:P.secureProfile}),(0,C.jsx)(`p`,{className:`\r
                  mt-1 text-xs\r
                  leading-relaxed\r
                  text-slate-400\r
                `,children:P.secureDesc})]})]}),(0,C.jsxs)(`div`,{className:`\r
              flex flex-col gap-4\r
              pt-2\r
              md:flex-row\r
              md:items-center\r
              md:justify-between\r
            `,children:[(0,C.jsx)(h,{mode:`wait`,children:(0,C.jsx)(m.div,{initial:{opacity:0,y:5},animate:{opacity:1,y:0},exit:{opacity:0,y:-5},className:`text-sm`,children:r?(0,C.jsxs)(`div`,{className:`\r
                      flex items-center\r
                      gap-2\r
                      text-emerald-400\r
                    `,children:[(0,C.jsx)(o,{size:16}),r]}):(0,C.jsxs)(`div`,{className:`\r
                      flex items-center\r
                      gap-2\r
                      text-slate-500\r
                    `,children:[(0,C.jsx)(b,{size:15}),P.ready]})},r||`default`)}),(0,C.jsx)(`button`,{type:`submit`,disabled:F,className:`\r
                group relative\r
                overflow-hidden\r
                rounded-2xl\r
                bg-gradient-to-r\r
                from-emerald-400\r
                via-cyan-400\r
                to-teal-400\r
                px-7 py-4\r
                text-sm font-semibold\r
                text-black\r
                shadow-[0_10px_40px_rgba(45,212,191,0.25)]\r
                transition-all duration-300\r
                hover:scale-[1.02]\r
                active:scale-[0.98]\r
                disabled:cursor-not-allowed\r
                disabled:opacity-40\r
              `,children:(0,C.jsx)(`span`,{className:`\r
                  relative z-10\r
                  flex items-center gap-2\r
                `,children:n?(0,C.jsxs)(C.Fragment,{children:[(0,C.jsx)(l,{size:16,className:`\r
                        animate-spin\r
                      `}),P.syncing]}):(0,C.jsxs)(C.Fragment,{children:[(0,C.jsx)(d,{size:16}),P.save]})})})]})]})]}),(0,C.jsx)(`div`,{className:`\r
          rounded-[28px]\r
          border border-slate-800\r
          bg-gradient-to-r\r
          from-slate-950\r
          to-slate-900\r
          p-6\r
        `,children:(0,C.jsxs)(`div`,{className:`\r
            flex flex-col gap-5\r
            lg:flex-row\r
            lg:items-center\r
            lg:justify-between\r
          `,children:[(0,C.jsxs)(`div`,{children:[(0,C.jsx)(`h3`,{className:`\r
                text-sm font-semibold\r
                text-white\r
              `,children:P.infrastructure}),(0,C.jsx)(`p`,{className:`\r
                mt-1 text-sm\r
                text-slate-400\r
              `,children:P.infrastructureDesc})]}),(0,C.jsx)(`div`,{className:`\r
              grid grid-cols-2 gap-4\r
              md:grid-cols-4\r
            `,children:[P.encrypted,P.verified,P.protected,P.synced].map(e=>(0,C.jsxs)(`div`,{className:`\r
                  rounded-2xl\r
                  border border-white/5\r
                  bg-white/[0.03]\r
                  px-4 py-3\r
                  text-center\r
                `,children:[(0,C.jsx)(`p`,{className:`\r
                    text-xs text-slate-500\r
                  `,children:`Status`}),(0,C.jsx)(`p`,{className:`\r
                    mt-1 text-sm\r
                    font-semibold\r
                    text-emerald-400\r
                  `,children:e})]},e))})]})})]}):(0,C.jsx)(`div`,{className:`flex items-center justify-center py-24`,children:(0,C.jsxs)(`div`,{className:`\r
            flex items-center gap-3\r
            rounded-2xl\r
            border border-slate-800\r
            bg-slate-900\r
            px-6 py-4\r
            text-slate-300\r
          `,children:[(0,C.jsx)(l,{className:`animate-spin`,size:18}),(0,C.jsx)(`span`,{children:P.connecting})]})})};export{T as default};