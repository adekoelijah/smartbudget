import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t dark:border-gray-800 bg-white dark:bg-gray-900">

      {/* 🌈 SOFT BACKGROUND GLOW */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-300/20 via-blue-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-14">

        {/* BRAND */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            SmartBudget
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-md">
            AI-powered budgeting system that helps you track expenses,
            optimize savings, and gain financial clarity.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* PRODUCT */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Product
            </h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><Link to="/#features">Features</Link></li>
              <li><Link to="/#pricing">Pricing</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/signup">Get Started</Link></li>
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Company
            </h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><a href="#">About</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>

          {/* LEGAL */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Legal
            </h3>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms</a></li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Contact
            </h3>

            <div className="space-y-3 text-sm text-gray-500 dark:text-gray-400">

              {/* EMAIL */}
              <a
                href="mailto:support@smartbudget.com"
                className="flex items-center gap-2 hover:text-black dark:hover:text-white transition"
              >
                {/* MAIL ICON */}
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="12" height="8" rx="2" />
                  <path d="M2 4l6 4 6-4" />
                </svg>
                support@smartbudget.com
              </a>

              {/* SOCIALS */}
              <div className="flex items-center gap-4 pt-2">

                {/* GITHUB ICON */}
                <a className="hover:text-black dark:hover:text-white transition">
                  <svg width="18" height="18" fill="currentColor">
                    <path d="M9 0a9 9 0 00-2.85 17.54c.45.08.62-.2.62-.44v-1.53c-2.52.55-3.05-1.08-3.05-1.08-.41-1.03-1-1.3-1-1.3-.82-.56.06-.55.06-.55.9.06 1.38.92 1.38.92.8 1.37 2.1.98 2.61.75.08-.58.31-.98.56-1.2-2.01-.23-4.12-1-4.12-4.46 0-.99.35-1.8.92-2.43-.09-.23-.4-1.17.09-2.43 0 0 .75-.24 2.46.92a8.6 8.6 0 014.48 0c1.7-1.16 2.45-.92 2.45-.92.5 1.26.19 2.2.1 2.43.57.63.92 1.44.92 2.43 0 3.47-2.12 4.23-4.14 4.45.32.28.6.83.6 1.68v2.49c0 .24.17.52.63.43A9 9 0 009 0z"/>
                  </svg>
                </a>

                {/* TWITTER ICON */}
                <a className="hover:text-black dark:hover:text-white transition">
                  <svg width="18" height="18" fill="currentColor">
                    <path d="M17 3a7.5 7.5 0 01-2.12.58A3.7 3.7 0 0016.5 1.6a7.4 7.4 0 01-2.34.9A3.7 3.7 0 007.88 6a10.5 10.5 0 01-7.64-3.87A3.7 3.7 0 001.4 7.3 3.6 3.6 0 01.8 7v.04a3.7 3.7 0 002.97 3.63c-.32.09-.66.14-1 .14-.25 0-.5-.02-.73-.07a3.7 3.7 0 003.45 2.56A7.4 7.4 0 010 15.5 10.4 10.4 0 005.65 17c6.78 0 10.49-5.62 10.49-10.49v-.48A7.4 7.4 0 0017 3z"/>
                  </svg>
                </a>

              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="mt-12 pt-6 border-t dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} SmartBudget. All rights reserved.
          </p>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Built for modern SaaS experiences.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;