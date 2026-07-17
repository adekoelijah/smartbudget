import{a as e}from"./chunk-BEqpzyXh.js";import{n as t,t as n}from"./jsx-runtime-BwJb0T-f.js";import{c as r,i,s as a}from"./chunk-OE4NN4TA-Dfh5oRGJ.js";import{t as o}from"./createLucideIcon-DfMeEbqo.js";import{t as s}from"./activity-CZETiZ4u.js";import{n as c,t as l}from"./user-D9fxW-9b.js";import{t as u}from"./bell-BggAvpVi.js";import{n as d,t as f}from"./wifi-BxO5ysp1.js";import{t as p}from"./credit-card-DLfNn8OF.js";import{t as m}from"./loader-circle-BlHdMQQK.js";import{t as h}from"./lock-keyhole-Dper9q1U.js";import{t as g}from"./menu-D3AL7_u-.js";import{t as _}from"./save-Bpk6HQDW.js";import{t as v}from"./shield-check-BM7qxmGv.js";import{t as y}from"./x-By25Nysu.js";import{t as b}from"./proxy-D0cttOaj.js";import{t as x}from"./AnimatePresence-CKVGuK5w.js";import{n as S}from"./UserContext-B2K8n0Ac.js";var C=o(`sliders-horizontal`,[[`path`,{d:`M10 5H3`,key:`1qgfaw`}],[`path`,{d:`M12 19H3`,key:`yhmn1j`}],[`path`,{d:`M14 3v4`,key:`1sua03`}],[`path`,{d:`M16 17v4`,key:`1q0r14`}],[`path`,{d:`M21 12h-9`,key:`1o4lsq`}],[`path`,{d:`M21 19h-5`,key:`1rlt1p`}],[`path`,{d:`M21 5h-7`,key:`1oszz2`}],[`path`,{d:`M8 10v4`,key:`tgpxqk`}],[`path`,{d:`M8 12H3`,key:`a7s4jb`}]]),w=e(t(),1),T=()=>{let{user:e,loading:t,error:n,loadUser:r,saveProfile:i,changeAvatar:a,setUser:o}=S(),s=(0,w.useCallback)(async()=>{await r()},[r]),c=(0,w.useCallback)(async e=>await i(e),[i]),l=(0,w.useCallback)(async e=>await a(e),[a]),u=(0,w.useCallback)(e=>{o(t=>({...t,...e}))},[o]);return{user:e,loading:t,error:n,refreshUser:s,updateProfile:c,updateAvatar:l,resetProfile:(0,w.useCallback)(async()=>{await r()},[r]),patchUser:u}},E=n(),D=()=>{let e=a(),[t,n]=(0,w.useState)(!1),{user:r,loading:i,updateProfile:o,refreshUser:g}=T(),y=(0,w.useMemo)(()=>{let t=e.pathname.split(`/`).pop(),n={profile:{label:`Profile Settings`,icon:l,desc:`Manage verified banking identity and personal information`},security:{label:`Security Center`,icon:v,desc:`Authentication, session protection and account defense`},notifications:{label:`Notifications`,icon:u,desc:`Transaction alerts, activities and system communication`},preferences:{label:`Preferences`,icon:C,desc:`Customize your financial workspace experience`},billing:{label:`Billing & Cards`,icon:p,desc:`Manage subscriptions, payment methods and card settings`}};return n[t]||n.profile},[e.pathname]),x=y.icon;return(0,E.jsxs)(b.section,{initial:{opacity:0,y:-12},animate:{opacity:1,y:0},transition:{duration:.35},className:`\r
        relative overflow-hidden\r
        rounded-[32px]\r
        border border-slate-200/80\r
        bg-white\r
        shadow-[0_20px_80px_rgba(15,23,42,0.08)]\r
      `,children:[(0,E.jsx)(`div`,{className:`absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r from-slate-950 via-indigo-700 to-emerald-500`}),(0,E.jsx)(`div`,{className:`absolute inset-0 opacity-[0.03]`,children:(0,E.jsx)(`div`,{className:`absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:72px_72px]`})}),(0,E.jsx)(`div`,{className:`relative p-5 sm:p-7 lg:p-8`,children:(0,E.jsxs)(`div`,{className:`\r
          flex flex-col\r
          xl:flex-row xl:items-center xl:justify-between\r
          gap-8\r
        `,children:[(0,E.jsxs)(`div`,{className:`flex-1`,children:[(0,E.jsx)(`div`,{className:`\r
              flex flex-col\r
              lg:flex-row lg:items-center\r
              gap-6\r
            `,children:(0,E.jsxs)(`div`,{className:`\r
                flex items-center gap-4\r
                min-w-0\r
              `,children:[(0,E.jsxs)(`div`,{className:`\r
                  relative\r
                  h-16 w-16\r
                  rounded-2xl\r
                  overflow-hidden\r
                  border border-slate-200\r
                  bg-slate-100\r
                  shadow-[0_10px_25px_rgba(15,23,42,0.08)]\r
                `,children:[r?.avatar?(0,E.jsx)(`img`,{src:r.avatar,alt:r?.name||`User`,className:`h-full w-full object-cover`}):(0,E.jsx)(`div`,{className:`\r
                      h-full w-full\r
                      flex items-center justify-center\r
                      bg-slate-100\r
                    `,children:(0,E.jsx)(l,{size:24,className:`text-slate-500`})}),(0,E.jsx)(`div`,{className:`\r
                    absolute bottom-1.5 right-1.5\r
                    h-3 w-3 rounded-full\r
                    bg-emerald-500\r
                    ring-2 ring-white\r
                  `})]}),(0,E.jsxs)(`div`,{className:`min-w-0`,children:[(0,E.jsxs)(`div`,{className:`flex items-center gap-2 flex-wrap`,children:[(0,E.jsx)(`h2`,{className:`\r
                      text-[18px]\r
                      font-semibold\r
                      tracking-[-0.02em]\r
                      text-slate-950\r
                      truncate\r
                    `,children:i?`Loading...`:r?.name||`SmartBudget User`}),(0,E.jsxs)(`div`,{className:`\r
                      flex items-center gap-1\r
                      rounded-full\r
                      border border-emerald-200\r
                      bg-emerald-50\r
                      px-2 py-1\r
                    `,children:[(0,E.jsx)(c,{size:13,className:`text-emerald-600`}),(0,E.jsx)(`span`,{className:`\r
                        text-[11px]\r
                        font-semibold\r
                        text-emerald-700\r
                      `,children:`VERIFIED`})]})]}),(0,E.jsx)(`p`,{className:`\r
                    mt-1\r
                    text-sm\r
                    text-slate-500\r
                    truncate\r
                  `,children:r?.email||`No email linked`}),(0,E.jsxs)(`div`,{className:`\r
                    mt-3\r
                    flex flex-wrap items-center gap-3\r
                  `,children:[(0,E.jsxs)(`div`,{className:`\r
                      flex items-center gap-2\r
                      rounded-full\r
                      bg-slate-100\r
                      px-3 py-1.5\r
                    `,children:[(0,E.jsx)(f,{size:13,className:`text-emerald-600`}),(0,E.jsx)(`span`,{className:`\r
                        text-[11px]\r
                        font-medium\r
                        text-slate-700\r
                      `,children:`Real-time Sync`})]}),(0,E.jsxs)(`div`,{className:`\r
                      flex items-center gap-2\r
                      rounded-full\r
                      bg-slate-100\r
                      px-3 py-1.5\r
                    `,children:[(0,E.jsx)(s,{size:13,className:`text-indigo-600`}),(0,E.jsx)(`span`,{className:`\r
                        text-[11px]\r
                        font-medium\r
                        text-slate-700\r
                      `,children:`System Operational`})]})]})]})]})}),(0,E.jsx)(`div`,{className:`\r
              mt-8\r
              rounded-3xl\r
              border border-slate-200\r
              bg-slate-50/80\r
              p-5 sm:p-6\r
            `,children:(0,E.jsxs)(`div`,{className:`\r
                flex flex-col\r
                lg:flex-row lg:items-center lg:justify-between\r
                gap-5\r
              `,children:[(0,E.jsxs)(`div`,{className:`flex items-start gap-4`,children:[(0,E.jsx)(`div`,{className:`\r
                    flex h-14 w-14\r
                    items-center justify-center\r
                    rounded-2xl\r
                    bg-slate-950\r
                    text-white\r
                    shadow-[0_10px_25px_rgba(15,23,42,0.2)]\r
                  `,children:(0,E.jsx)(x,{size:22})}),(0,E.jsxs)(`div`,{children:[(0,E.jsxs)(`div`,{className:`\r
                      flex items-center gap-2\r
                      text-[12px]\r
                      uppercase tracking-[0.18em]\r
                      font-semibold\r
                      text-slate-400\r
                    `,children:[`SETTINGS MODULE`,(0,E.jsx)(d,{size:13}),`ACTIVE`]}),(0,E.jsx)(`h3`,{className:`\r
                      mt-2\r
                      text-[24px]\r
                      leading-none\r
                      font-semibold\r
                      tracking-[-0.03em]\r
                      text-slate-950\r
                    `,children:y.label}),(0,E.jsx)(`p`,{className:`\r
                      mt-3\r
                      max-w-2xl\r
                      text-sm leading-7\r
                      text-slate-500\r
                    `,children:y.desc})]})]}),(0,E.jsx)(`div`,{className:`\r
                  w-full lg:w-auto\r
                  rounded-2xl\r
                  border border-emerald-200\r
                  bg-white\r
                  px-5 py-4\r
                `,children:(0,E.jsxs)(`div`,{className:`flex items-start gap-3`,children:[(0,E.jsx)(`div`,{className:`\r
                      mt-0.5\r
                      flex h-10 w-10\r
                      items-center justify-center\r
                      rounded-xl\r
                      bg-emerald-50\r
                    `,children:(0,E.jsx)(h,{size:18,className:`text-emerald-600`})}),(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`p`,{className:`\r
                        text-sm\r
                        font-semibold\r
                        text-slate-900\r
                      `,children:`Enterprise Security Active`}),(0,E.jsx)(`p`,{className:`\r
                        mt-1\r
                        text-xs leading-6\r
                        text-slate-500\r
                      `,children:`Encrypted sessions, protected API layers, and secured financial infrastructure enabled.`})]})]})})]})})]}),(0,E.jsxs)(`div`,{className:`\r
            flex flex-col\r
            sm:flex-row\r
            xl:flex-col\r
            gap-4\r
            xl:w-[240px]\r
          `,children:[(0,E.jsxs)(`button`,{onClick:async()=>{try{n(!0),await o({name:r?.name||``,avatar:r?.avatar||``}),await g()}catch(e){console.error(`SAVE_SETTINGS_ERROR:`,e)}finally{n(!1)}},disabled:t||i,className:`\r
                group\r
                relative overflow-hidden\r
                h-[58px]\r
                rounded-2xl\r
                bg-slate-950\r
                px-6\r
                text-white\r
                shadow-[0_20px_40px_rgba(15,23,42,0.18)]\r
                transition-all duration-300\r
                hover:-translate-y-[2px]\r
                hover:bg-black\r
                disabled:opacity-60\r
                disabled:cursor-not-allowed\r
              `,children:[(0,E.jsx)(`div`,{className:`\r
                absolute inset-0\r
                opacity-0 group-hover:opacity-100\r
                transition-opacity duration-300\r
                bg-gradient-to-r from-white/0 via-white/10 to-white/0\r
              `}),(0,E.jsx)(`div`,{className:`\r
                relative\r
                flex items-center justify-center gap-2\r
              `,children:t?(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(m,{size:17,className:`animate-spin`}),`Saving Changes...`]}):(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(_,{size:17}),`Save Changes`]})})]}),(0,E.jsxs)(`div`,{className:`\r
              flex-1\r
              rounded-2xl\r
              border border-slate-200\r
              bg-white\r
              p-5\r
            `,children:[(0,E.jsxs)(`div`,{className:`\r
                flex items-center gap-2\r
                text-slate-900\r
              `,children:[(0,E.jsx)(v,{size:16,className:`text-emerald-600`}),(0,E.jsx)(`span`,{className:`\r
                  text-sm\r
                  font-semibold\r
                `,children:`Protection Status`})]}),(0,E.jsxs)(`div`,{className:`\r
                mt-4\r
                flex items-end gap-2\r
              `,children:[(0,E.jsx)(`h4`,{className:`\r
                  text-3xl\r
                  font-semibold\r
                  tracking-[-0.04em]\r
                  text-slate-950\r
                `,children:`99.99%`}),(0,E.jsx)(`span`,{className:`\r
                  pb-1\r
                  text-xs\r
                  font-medium\r
                  text-emerald-600\r
                `,children:`SECURE`})]}),(0,E.jsx)(`p`,{className:`\r
                mt-2\r
                text-xs leading-6\r
                text-slate-500\r
              `,children:`Banking infrastructure integrity operating normally.`})]})]})]})})]})},O=[{id:`profile`,label:`Profile`,icon:l},{id:`security`,label:`Security`,icon:v},{id:`notifications`,label:`Notifications`,icon:u},{id:`preferences`,label:`Preferences`,icon:C},{id:`billing`,label:`Billing`,icon:p}],k=({activeTab:e,onNavigate:t})=>(0,E.jsxs)(`aside`,{className:`\r
        w-full\r
        lg:w-[320px]\r
        xl:w-[340px]\r
\r
        rounded-[26px]\r
        border border-slate-200/70\r
        bg-white\r
        shadow-[0_18px_60px_rgba(15,23,42,0.10)]\r
\r
        overflow-hidden\r
        sticky top-6\r
      `,children:[(0,E.jsx)(`div`,{className:`bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-5 py-4`,children:(0,E.jsxs)(`div`,{className:`flex items-center justify-between`,children:[(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`p`,{className:`text-[10px] font-semibold tracking-[0.24em] uppercase text-slate-400`,children:`SmartBudget`}),(0,E.jsx)(`h2`,{className:`text-lg font-semibold text-white mt-2`,children:`Settings`})]}),(0,E.jsxs)(`div`,{className:`hidden sm:flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1`,children:[(0,E.jsx)(`span`,{className:`h-2 w-2 rounded-full bg-emerald-400 animate-pulse`}),(0,E.jsx)(`span`,{className:`text-[10px] font-semibold text-emerald-300`,children:`Secure`})]})]})}),(0,E.jsx)(`div`,{className:`hidden sm:flex flex-col gap-2 p-3`,children:O.map((n,r)=>{let i=n.icon,a=e===n.id;return(0,E.jsxs)(b.button,{onClick:()=>t?.(n.id),initial:{opacity:0,y:6},animate:{opacity:1,y:0},transition:{duration:.2,delay:r*.03},className:`
                relative flex items-center gap-3
                px-4 py-3 rounded-2xl
                border transition-all duration-300

                ${a?`bg-slate-900 text-white border-slate-900 shadow-lg`:`bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300`}
              `,children:[a&&(0,E.jsx)(`span`,{className:`absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-full bg-indigo-400`}),(0,E.jsx)(`div`,{className:`
                  h-10 w-10 flex items-center justify-center rounded-xl
                  ${a?`bg-white/10 text-white`:`bg-slate-100 text-slate-700`}
                `,children:(0,E.jsx)(i,{size:18})}),(0,E.jsx)(`span`,{className:`text-sm font-semibold`,children:n.label})]},n.id)})}),(0,E.jsx)(`div`,{className:`sm:hidden flex flex-col p-3 gap-2`,children:O.map(n=>{let r=n.icon,i=e===n.id;return(0,E.jsxs)(`button`,{onClick:()=>t?.(n.id),className:`
                flex items-center gap-3
                px-4 py-3 rounded-2xl
                border transition-all

                ${i?`bg-slate-900 text-white border-slate-900`:`bg-white text-slate-700 border-slate-200`}
              `,children:[(0,E.jsx)(`div`,{className:`
                  h-9 w-9 flex items-center justify-center rounded-xl
                  ${i?`bg-white/10`:`bg-slate-100`}
                `,children:(0,E.jsx)(r,{size:18})}),(0,E.jsx)(`span`,{className:`text-sm font-medium`,children:n.label})]},n.id)})}),(0,E.jsx)(`div`,{className:`border-t border-slate-100 bg-slate-50 px-5 py-3`,children:(0,E.jsxs)(`div`,{className:`flex items-center justify-between`,children:[(0,E.jsxs)(`div`,{children:[(0,E.jsx)(`p`,{className:`text-[11px] text-slate-500`,children:`Bank Security`}),(0,E.jsx)(`p`,{className:`text-xs font-semibold text-slate-900`,children:`End-to-end encrypted`})]}),(0,E.jsx)(`span`,{className:`text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold`,children:`Active`})]})})]}),A=()=>{let[e,t]=(0,w.useState)(!1),n=a(),o=r(),s=n.pathname.split(`/`).filter(Boolean).pop()||`profile`;(0,w.useEffect)(()=>{n.pathname===`/app/settings`&&o(`/app/settings/profile`,{replace:!0})},[n.pathname,o]);let c=e=>{o(`/app/settings/${e}`),t(!1)};return(0,E.jsxs)(`div`,{className:`min-h-screen bg-slate-50 text-slate-900 px-4 md:px-6 py-6`,children:[(0,E.jsxs)(`div`,{className:`max-w-7xl mx-auto space-y-6`,children:[(0,E.jsx)(D,{}),(0,E.jsx)(`div`,{className:`xl:hidden`,children:(0,E.jsxs)(`button`,{onClick:()=>t(!0),className:`w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm`,children:[(0,E.jsxs)(`span`,{className:`font-medium capitalize`,children:[s,` Settings`]}),(0,E.jsx)(g,{size:18})]})}),(0,E.jsxs)(`div`,{className:`grid grid-cols-1 xl:grid-cols-12 gap-6`,children:[(0,E.jsx)(`aside`,{className:`hidden xl:block xl:col-span-3`,children:(0,E.jsxs)(`div`,{className:`sticky top-6 space-y-5`,children:[(0,E.jsxs)(`div`,{className:`rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden`,children:[(0,E.jsxs)(`div`,{className:`px-5 py-4 border-b border-slate-200`,children:[(0,E.jsx)(`p`,{className:`text-xs uppercase tracking-[0.22em] text-slate-500`,children:`Account Center`}),(0,E.jsx)(`h3`,{className:`mt-1 font-semibold`,children:`Manage Settings`})]}),(0,E.jsx)(`div`,{className:`p-3`,children:(0,E.jsx)(k,{activeTab:s,onNavigate:c})})]}),(0,E.jsxs)(`div`,{className:`rounded-3xl border border-slate-200 bg-white p-5`,children:[(0,E.jsx)(`p`,{className:`text-xs text-slate-500 uppercase tracking-wider`,children:`System Status`}),(0,E.jsx)(`h4`,{className:`mt-1 font-semibold`,children:`All systems operational`}),(0,E.jsx)(`p`,{className:`text-sm text-slate-500 mt-2`,children:`Settings sync instantly with your account backend.`})]})]})}),(0,E.jsx)(b.main,{initial:{opacity:0,y:12},animate:{opacity:1,y:0},className:`xl:col-span-9`,children:(0,E.jsx)(`div`,{className:`rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden`,children:(0,E.jsx)(`div`,{className:`p-5 md:p-7`,children:(0,E.jsx)(i,{})})})})]})]}),(0,E.jsx)(x,{children:e&&(0,E.jsxs)(E.Fragment,{children:[(0,E.jsx)(b.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:()=>t(!1),className:`fixed inset-0 bg-black/40 z-40 xl:hidden`}),(0,E.jsxs)(b.div,{initial:{x:`-100%`},animate:{x:0},exit:{x:`-100%`},className:`fixed top-0 left-0 h-full w-[86%] max-w-sm bg-white z-50 shadow-2xl xl:hidden`,children:[(0,E.jsxs)(`div`,{className:`p-5 border-b border-slate-200 flex items-center justify-between`,children:[(0,E.jsx)(`h3`,{className:`font-semibold`,children:`Settings`}),(0,E.jsx)(`button`,{onClick:()=>t(!1),children:(0,E.jsx)(y,{size:20})})]}),(0,E.jsx)(`div`,{className:`p-4`,children:(0,E.jsx)(k,{activeTab:s,onNavigate:c})})]})]})})]})};export{A as default};