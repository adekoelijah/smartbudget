import{a as e}from"./chunk-BEqpzyXh.js";import{n as t,t as n}from"./jsx-runtime-BwJb0T-f.js";import{t as r}from"./createLucideIcon-DfMeEbqo.js";import{t as i}from"./credit-card-DLfNn8OF.js";import{t as a}from"./shield-check-BM7qxmGv.js";import{t as o}from"./sparkles-DZ5-Y4oI.js";import{t as s}from"./usePreferences-D6x-Wlcc.js";var c=r(`check`,[[`path`,{d:`M20 6 9 17l-5-5`,key:`1gmf2c`}]]),l=r(`receipt`,[[`path`,{d:`M12 17V7`,key:`pyj7ub`}],[`path`,{d:`M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8`,key:`1elt7d`}],[`path`,{d:`M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z`,key:`ycz6yz`}]]),u=e(t(),1),d=n(),f={en:{currentPlan:`Current Plan`,active:`Active`,plans:`Plans`,monthly:`monthly`,yearly:`yearly`,recommended:`Recommended`,free:`Free`,currentPlanBtn:`Current Plan`,processing:`Processing...`,upgrade:`Upgrade`,paymentMethod:`Payment Method`,addPaymentMethod:`Add Payment Method`,noPaymentMethod:`No payment method added yet`,billingHistory:`Billing History`,noInvoices:`No invoices yet`,starter:`Starter`,pro:`Premium`,business:`Business`,starterDesc:`Basic budgeting & expense tracking`,proDesc:`Advanced fintech analytics & automation`,businessDesc:`Enterprise-grade finance management`,securePayments:`Secure bank-grade billing`,yearlyDiscount:`Save more yearly`},yo:{currentPlan:`Ètò Tó Wà Lọ́wọ́`,active:`Ń Ṣiṣẹ́`,plans:`Àwọn Ètò`,monthly:`oṣooṣu`,yearly:`lọ́dọọdún`,recommended:`A Ṣeduro`,free:`Ọfẹ`,currentPlanBtn:`Ètò Tó Wà`,processing:`Ń Ṣiṣẹ́...`,upgrade:`Ṣe Igbesoke`,paymentMethod:`Ọ̀nà Ìsanwó`,addPaymentMethod:`Fi Ọ̀nà Ìsanwó Kún`,noPaymentMethod:`Kò sí ọ̀nà ìsanwó tí a fi kún`,billingHistory:`Ìtàn Ìsanwó`,noInvoices:`Kò sí invoice kankan`,starter:`Básíkì`,pro:`Pírémíọ́mù`,business:`Iṣòwò`,starterDesc:`Ìṣàkóso inawo ipilẹ`,proDesc:`Ìtúpalẹ̀ fintech tó gíga`,businessDesc:`Ìṣàkóso owó ipele ilé-ifowopamọ`,securePayments:`Ìsanwó tó ni aabo bi banki`,yearlyDiscount:`Fipamọ diẹ sii lọ́dọọdún`}},p=()=>{let{prefs:e}=s(),t=e?.language||`en`,n=e?.currency||`NGN`,r=f[t],[p,m]=(0,u.useState)(`monthly`),[h,g]=(0,u.useState)(`starter`),[_,v]=(0,u.useState)(!1),y=(0,u.useMemo)(()=>[{id:`starter`,name:r.starter,description:r.starterDesc,priceMonthly:0,priceYearly:0,highlight:!1,features:[`Budget tracking`,`Expense monitoring`,`Basic reports`]},{id:`pro`,name:r.pro,description:r.proDesc,priceMonthly:1e3,priceYearly:1e4,highlight:!0,features:[`AI financial insights`,`Unlimited budgets`,`Advanced analytics`,`Priority notifications`]},{id:`business`,name:r.business,description:r.businessDesc,priceMonthly:2e3,priceYearly:2e4,highlight:!1,features:[`Team collaboration`,`Bank-grade reports`,`Priority support`,`Enterprise analytics`]}],[r]),b=e=>e===0?r.free:new Intl.NumberFormat(t===`yo`?`yo-NG`:`en-NG`,{style:`currency`,currency:n,maximumFractionDigits:0}).format(e),x=async e=>{if(e!==h)try{v(!0),setTimeout(()=>{g(e),window.location.assign(`/checkout`)},800)}finally{v(!1)}};return(0,d.jsxs)(`div`,{className:`space-y-8 text-white`,children:[(0,d.jsx)(`div`,{className:`\r
          rounded-3xl\r
          border border-white/10\r
          bg-[#0f172a]\r
          p-6\r
          shadow-xl\r
        `,children:(0,d.jsxs)(`div`,{className:`flex items-center justify-between`,children:[(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`h2`,{className:`text-lg font-semibold`,children:r.currentPlan}),(0,d.jsxs)(`p`,{className:`mt-1 text-sm text-slate-400`,children:[t===`yo`?`O wa lori eto`:`You are currently on the`,` `,(0,d.jsx)(`span`,{className:`font-semibold text-white capitalize`,children:h})]})]}),(0,d.jsxs)(`div`,{className:`\r
              flex items-center gap-2\r
              rounded-full\r
              border border-emerald-500/20\r
              bg-emerald-500/10\r
              px-3 py-2\r
              text-sm text-emerald-400\r
            `,children:[(0,d.jsx)(o,{size:16}),r.active]})]})}),(0,d.jsxs)(`div`,{className:`flex items-center justify-between`,children:[(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`h2`,{className:`text-xl font-semibold`,children:r.plans}),(0,d.jsx)(`p`,{className:`mt-1 text-sm text-slate-400`,children:r.securePayments})]}),(0,d.jsx)(`div`,{className:`\r
            flex items-center\r
            rounded-2xl\r
            border border-white/10\r
            bg-[#0f172a]\r
            p-1\r
          `,children:[`monthly`,`yearly`].map(e=>(0,d.jsx)(`button`,{onClick:()=>m(e),className:`
                px-4 py-2 rounded-xl text-sm transition-all
                ${p===e?`bg-emerald-500 text-black font-semibold`:`text-slate-400 hover:text-white`}
              `,children:e===`monthly`?r.monthly:r.yearly},e))})]}),(0,d.jsx)(`div`,{className:`grid gap-6 lg:grid-cols-3`,children:y.map(e=>{let t=h===e.id,n=p===`monthly`?e.priceMonthly:e.priceYearly;return(0,d.jsxs)(`div`,{className:`
                relative overflow-hidden
                rounded-3xl
                border border-white/10
                bg-[#0f172a]
                p-6
                transition-all duration-300
                hover:-translate-y-1
                hover:border-emerald-500/30
                hover:shadow-2xl
                ${e.highlight?`ring-2 ring-emerald-500/30`:``}
              `,children:[e.highlight&&(0,d.jsx)(`div`,{className:`\r
                    absolute left-5 top-5\r
                    rounded-full\r
                    bg-emerald-500\r
                    px-3 py-1\r
                    text-xs font-semibold\r
                    text-black\r
                  `,children:r.recommended}),(0,d.jsxs)(`div`,{className:`pt-8`,children:[(0,d.jsx)(`h3`,{className:`text-2xl font-bold`,children:e.name}),(0,d.jsx)(`p`,{className:`mt-2 text-sm text-slate-400`,children:e.description}),(0,d.jsxs)(`div`,{className:`mt-6`,children:[(0,d.jsx)(`h2`,{className:`text-4xl font-bold tracking-tight`,children:b(n)}),(0,d.jsxs)(`p`,{className:`mt-1 text-sm text-slate-400`,children:[`/`,p===`monthly`?r.monthly:r.yearly]})]}),(0,d.jsx)(`ul`,{className:`mt-6 space-y-3`,children:e.features.map((e,t)=>(0,d.jsxs)(`li`,{className:`\r
                          flex items-start gap-3\r
                          text-sm text-slate-300\r
                        `,children:[(0,d.jsx)(c,{size:16,className:`\r
                            mt-0.5\r
                            text-emerald-400\r
                          `}),(0,d.jsx)(`span`,{children:e})]},t))}),(0,d.jsx)(`button`,{onClick:()=>x(e.id),disabled:_||t,className:`
                    mt-8
                    w-full
                    rounded-2xl
                    py-3
                    text-sm
                    font-semibold
                    transition-all
                    ${t?`
                          cursor-not-allowed
                          bg-white/10
                          text-slate-500
                        `:e.highlight?`
                          bg-emerald-500
                          text-black
                          hover:opacity-90
                        `:`
                          bg-white/5
                          text-white
                          hover:bg-white/10
                        `}
                  `,children:t?r.currentPlanBtn:_?r.processing:r.upgrade})]})]},e.id)})}),(0,d.jsxs)(`div`,{className:`grid gap-6 md:grid-cols-2`,children:[(0,d.jsxs)(`div`,{className:`\r
            rounded-3xl\r
            border border-white/10\r
            bg-[#0f172a]\r
            p-6\r
          `,children:[(0,d.jsxs)(`div`,{className:`mb-5 flex items-center gap-3`,children:[(0,d.jsx)(`div`,{className:`\r
                rounded-xl\r
                bg-white/5\r
                p-3\r
              `,children:(0,d.jsx)(i,{size:18,className:`text-slate-300`})}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`h2`,{className:`font-semibold`,children:r.paymentMethod}),(0,d.jsx)(`p`,{className:`text-sm text-slate-400`,children:r.securePayments})]})]}),(0,d.jsxs)(`div`,{className:`\r
              rounded-2xl\r
              border border-dashed border-white/10\r
              bg-white/[0.02]\r
              p-5\r
            `,children:[(0,d.jsx)(`p`,{className:`text-sm text-slate-400`,children:r.noPaymentMethod}),(0,d.jsx)(`button`,{className:`\r
                mt-5\r
                w-full\r
                rounded-2xl\r
                bg-white/5\r
                py-3\r
                text-sm font-medium\r
                transition\r
                hover:bg-white/10\r
              `,children:r.addPaymentMethod})]})]}),(0,d.jsxs)(`div`,{className:`\r
            rounded-3xl\r
            border border-white/10\r
            bg-[#0f172a]\r
            p-6\r
          `,children:[(0,d.jsxs)(`div`,{className:`mb-5 flex items-center gap-3`,children:[(0,d.jsx)(`div`,{className:`\r
                rounded-xl\r
                bg-white/5\r
                p-3\r
              `,children:(0,d.jsx)(l,{size:18,className:`text-slate-300`})}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`h2`,{className:`font-semibold`,children:r.billingHistory}),(0,d.jsx)(`p`,{className:`text-sm text-slate-400`,children:`Transaction invoices & receipts`})]})]}),(0,d.jsx)(`div`,{className:`\r
              flex min-h-[140px]\r
              items-center justify-center\r
              rounded-2xl\r
              border border-dashed border-white/10\r
              bg-white/[0.02]\r
            `,children:(0,d.jsxs)(`div`,{className:`text-center`,children:[(0,d.jsx)(a,{size:26,className:`\r
                  mx-auto mb-3\r
                  text-emerald-400\r
                `}),(0,d.jsx)(`p`,{className:`text-sm text-slate-400`,children:r.noInvoices})]})})]})]})]})};export{p as default};