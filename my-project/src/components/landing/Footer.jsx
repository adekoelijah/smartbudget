



import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative bg-[#070A12] text-white overflow-hidden border-t border-white/10">

      {/* =========================
         CONTROLLED FINTECH BACKGROUND
      ========================= */}
      <div className="absolute inset-0 -z-10">

        {/* base layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050814] via-[#070A12] to-[#04060F]" />

        {/* subtle financial grid */}
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.25)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">

        {/* =========================
           IDENTITY BLOCK
        ========================= */}
        <div className="max-w-xl">
          <h2 className="text-xl font-semibold tracking-tight">
            SmartBudget Financial System
          </h2>

          <p className="mt-4 text-sm text-white/60 leading-6">
            A structured financial control system designed to provide
            real-time visibility, disciplined budgeting, and secure
            financial tracking across personal and business accounts.
          </p>

          {/* TRUST SIGNALS */}
          <div className="mt-6 flex flex-wrap gap-3 text-[11px] text-white/50">
            <span className="border border-white/10 px-3 py-1 rounded-full">
              End-to-end encryption
            </span>
            <span className="border border-white/10 px-3 py-1 rounded-full">
              Real-time processing
            </span>
            <span className="border border-white/10 px-3 py-1 rounded-full">
              Audit-ready logs
            </span>
          </div>
        </div>

        {/* =========================
           NAVIGATION GRID
        ========================= */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-10 text-sm">

          {/* PRODUCT */}
          <div>
            <h3 className="text-white font-medium mb-4">Product</h3>
            <ul className="space-y-3 text-white/60">
              <li><Link to="/#features">Features</Link></li>
              <li><Link to="/#pricing">Pricing</Link></li>
              <li><Link to="/login">Access Account</Link></li>
              <li><Link to="/signup">Open Account</Link></li>
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h3 className="text-white font-medium mb-4">Company</h3>
            <ul className="space-y-3 text-white/60">
              <li><a href="#">About System</a></li>
              <li><a href="#">Security Standards</a></li>
              <li><a href="#">Engineering</a></li>
            </ul>
          </div>

          {/* LEGAL */}
          <div>
            <h3 className="text-white font-medium mb-4">Legal</h3>
            <ul className="space-y-3 text-white/60">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Compliance</a></li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h3 className="text-white font-medium mb-4">Support</h3>
            <ul className="space-y-3 text-white/60">
              <li><a href="mailto:support@smartbudget.com">Support Center</a></li>
              <li><a href="#">System Status</a></li>
              <li><a href="#">Security Report</a></li>
            </ul>
          </div>
        </div>

        {/* =========================
           DIVIDER
        ========================= */}
        <div className="mt-16 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between gap-4 text-xs text-white/40">

          <p>
            © {new Date().getFullYear()} SmartBudget Financial System.
            All rights reserved.
          </p>

          <p>
            Not a bank. Financial insights only. User responsibility applies.
          </p>

        </div>

      </div>
    </footer>
  );
};

export default Footer;