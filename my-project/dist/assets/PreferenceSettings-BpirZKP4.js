import{t as e}from"./jsx-runtime-BwJb0T-f.js";import{t}from"./createLucideIcon-DfMeEbqo.js";import{t as n}from"./globe-DQ5SRHEq.js";import{t as r}from"./save-Bpk6HQDW.js";import{t as i}from"./shield-check-BM7qxmGv.js";import{t as a}from"./wallet-Cftc2-An.js";import{t as o}from"./usePreferences-D6x-Wlcc.js";var s=t(`clock-3`,[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`path`,{d:`M12 6v6h4`,key:`135r8i`}]]),c=t(`languages`,[[`path`,{d:`m5 8 6 6`,key:`1wu5hv`}],[`path`,{d:`m4 14 6-6 2-3`,key:`1k1g8d`}],[`path`,{d:`M2 5h12`,key:`or177f`}],[`path`,{d:`M7 2h1`,key:`1t2jsx`}],[`path`,{d:`m22 22-5-10-5 10`,key:`don7ne`}],[`path`,{d:`M14 18h6`,key:`1m8k6r`}]]),l=t(`layout-grid`,[[`rect`,{width:`7`,height:`7`,x:`3`,y:`3`,rx:`1`,key:`1g98yp`}],[`rect`,{width:`7`,height:`7`,x:`14`,y:`3`,rx:`1`,key:`6d4xhi`}],[`rect`,{width:`7`,height:`7`,x:`14`,y:`14`,rx:`1`,key:`nxv5o0`}],[`rect`,{width:`7`,height:`7`,x:`3`,y:`14`,rx:`1`,key:`1bb6yr`}]]),u=e(),d=({icon:e,label:t,description:n,children:r})=>(0,u.jsxs)(`div`,{className:`flex flex-col gap-3 py-5 border-b border-slate-200 last:border-b-0`,children:[(0,u.jsxs)(`div`,{className:`flex items-start gap-3`,children:[(0,u.jsx)(`div`,{className:`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 shrink-0`,children:(0,u.jsx)(e,{size:18})}),(0,u.jsxs)(`div`,{className:`min-w-0`,children:[(0,u.jsx)(`p`,{className:`text-sm font-semibold text-slate-900`,children:t}),(0,u.jsx)(`p`,{className:`text-xs text-slate-500 leading-relaxed break-words`,children:n})]})]}),(0,u.jsx)(`div`,{className:`w-full md:flex md:justify-end`,children:(0,u.jsx)(`div`,{className:`w-full md:w-[220px]`,children:r})})]}),f=()=>{let{prefs:e,loading:t,message:f,updatePref:p,savePreferences:m}=o(),h=e=>{p(`language`,e),localStorage.setItem(`app_language`,e),document.documentElement.lang=e,document.documentElement.dir=`ltr`};return(0,u.jsxs)(`div`,{className:`space-y-6`,children:[(0,u.jsxs)(`div`,{className:`\r
          relative overflow-hidden\r
          rounded-3xl\r
          border border-slate-200\r
          bg-white\r
          p-6\r
          shadow-sm\r
        `,children:[(0,u.jsx)(`div`,{className:`\r
            absolute right-0 top-0\r
            h-40 w-40\r
            rounded-full\r
            bg-emerald-100/40\r
            blur-3xl\r
          `}),(0,u.jsxs)(`div`,{className:`relative z-10 flex gap-4`,children:[(0,u.jsx)(`div`,{className:`\r
              flex h-14 w-14\r
              items-center justify-center\r
              rounded-2xl\r
              bg-slate-900\r
              text-white\r
              shadow-lg\r
            `,children:(0,u.jsx)(i,{size:24})}),(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`h2`,{className:`\r
                text-xl font-bold\r
                tracking-tight\r
                text-slate-900\r
              `,children:`Preferences Center`}),(0,u.jsx)(`p`,{className:`\r
                mt-2 max-w-2xl\r
                text-sm leading-relaxed\r
                text-slate-500\r
              `,children:`Personalize how SmartBudget behaves across billing, analytics, reports, notifications, and account experiences.`})]})]})]}),(0,u.jsxs)(`div`,{className:`\r
          rounded-3xl\r
          border border-slate-200\r
          bg-white\r
          p-6\r
          shadow-sm\r
        `,children:[(0,u.jsx)(`div`,{className:`mb-3`,children:(0,u.jsx)(`h3`,{className:`\r
              text-xs font-semibold\r
              uppercase tracking-[0.2em]\r
              text-slate-400\r
            `,children:`Display Settings`})}),(0,u.jsx)(d,{icon:l,label:`Layout Density`,description:`\r
            Controls spacing and component\r
            sizing across the dashboard,\r
            reports, billing and analytics pages.\r
          `,children:(0,u.jsxs)(`select`,{value:e.density,onChange:e=>p(`density`,e.target.value),className:`\r
              h-11 w-full md:w-[220px]\r
              rounded-2xl\r
              border border-slate-200\r
              bg-slate-50\r
              px-4\r
              text-sm\r
              font-medium\r
              text-slate-800\r
              outline-none\r
              transition\r
              focus:border-slate-400\r
              focus:bg-white\r
            `,children:[(0,u.jsx)(`option`,{value:`comfortable`,children:`Comfortable`}),(0,u.jsx)(`option`,{value:`compact`,children:`Compact`})]})})]}),(0,u.jsxs)(`div`,{className:`\r
          rounded-3xl\r
          border border-slate-200\r
          bg-white\r
          p-6\r
          shadow-sm\r
        `,children:[(0,u.jsx)(`div`,{className:`mb-3`,children:(0,u.jsx)(`h3`,{className:`\r
              text-xs font-semibold\r
              uppercase tracking-[0.2em]\r
              text-slate-400\r
            `,children:`Regional & Localization`})}),(0,u.jsx)(d,{icon:a,label:`Currency`,description:`\r
            Sets the default financial\r
            display format used across\r
            transactions, reports,\r
            invoices and billing.\r
          `,children:(0,u.jsxs)(`select`,{value:e.currency,onChange:e=>p(`currency`,e.target.value),className:`\r
              h-11 w-full md:w-[220px]\r
              rounded-2xl\r
              border border-slate-200\r
              bg-slate-50\r
              px-4\r
              text-sm\r
              font-medium\r
              text-slate-800\r
              outline-none\r
              transition\r
              focus:border-slate-400\r
              focus:bg-white\r
            `,children:[(0,u.jsx)(`option`,{value:`NGN`,children:`₦ NGN`}),(0,u.jsx)(`option`,{value:`USD`,children:`$ USD`}),(0,u.jsx)(`option`,{value:`EUR`,children:`€ EUR`}),(0,u.jsx)(`option`,{value:`GBP`,children:`£ GBP`})]})}),(0,u.jsx)(d,{icon:s,label:`Timezone`,description:`\r
            Used for analytics timing,\r
            transaction records,\r
            reports and scheduled\r
            financial activities.\r
          `,children:(0,u.jsxs)(`select`,{value:e.timezone,onChange:e=>p(`timezone`,e.target.value),className:`\r
              h-11 w-full md:w-[220px]\r
              rounded-2xl\r
              border border-slate-200\r
              bg-slate-50\r
              px-4\r
              text-sm\r
              font-medium\r
              text-slate-800\r
              outline-none\r
              transition\r
              focus:border-slate-400\r
              focus:bg-white\r
            `,children:[(0,u.jsx)(`option`,{value:`Africa/Lagos`,children:`Africa/Lagos`}),(0,u.jsx)(`option`,{value:`UTC`,children:`UTC`}),(0,u.jsx)(`option`,{value:`Europe/London`,children:`Europe/London`}),(0,u.jsx)(`option`,{value:`America/New_York`,children:`America/New_York`})]})}),(0,u.jsx)(d,{icon:c,label:`Language`,description:`\r
            Controls the global application\r
            language across all pages,\r
            components, billing flows,\r
            notifications and dashboards.\r
          `,children:(0,u.jsxs)(`select`,{value:e.language,onChange:e=>h(e.target.value),className:`\r
              h-11 w-full md:w-[220px]\r
              rounded-2xl\r
              border border-slate-200\r
              bg-slate-50\r
              px-4\r
              text-sm\r
              font-medium\r
              text-slate-800\r
              outline-none\r
              transition\r
              focus:border-slate-400\r
              focus:bg-white\r
            `,children:[(0,u.jsx)(`option`,{value:`en`,children:`English`}),(0,u.jsx)(`option`,{value:`yo`,children:`Yoruba`})]})}),(0,u.jsx)(d,{icon:n,label:`Regional Experience`,description:`\r
            Syncs localization settings\r
            with taxes, billing format,\r
            receipts and financial reporting.\r
          `,children:(0,u.jsx)(`div`,{className:`\r
              inline-flex items-center\r
              gap-2 rounded-2xl\r
              border border-emerald-100\r
              bg-emerald-50\r
              px-4 py-2\r
              text-xs font-semibold\r
              text-emerald-700\r
            `,children:`Smart Regional Sync Active`})})]}),(0,u.jsx)(`div`,{className:`flex justify-end`,children:(0,u.jsxs)(`button`,{onClick:async()=>{try{await m(),localStorage.setItem(`smartbudget_preferences`,JSON.stringify(e))}catch(e){console.error(`SAVE_PREFERENCES_ERROR:`,e)}},disabled:t,className:`\r
            inline-flex items-center\r
            gap-2\r
            rounded-2xl\r
            bg-slate-900\r
            px-6 py-3\r
            text-sm font-semibold\r
            text-white\r
            transition-all\r
            hover:bg-black\r
            disabled:cursor-not-allowed\r
            disabled:opacity-60\r
          `,children:[(0,u.jsx)(r,{size:18}),t?`Saving...`:`Save Preferences`]})}),f&&(0,u.jsx)(`div`,{className:`\r
            rounded-2xl\r
            border border-emerald-100\r
            bg-emerald-50\r
            px-4 py-3\r
            text-center\r
            text-sm font-medium\r
            text-emerald-700\r
          `,children:f})]})};export{f as default};