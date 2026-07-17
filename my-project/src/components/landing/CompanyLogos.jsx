const logos = ["Google", "Stripe", "Shopify", "GitHub", "PayPal"];

const CompanyLogos = () => {
  return (
    <div className="py-10 border-y dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 flex flex-wrap justify-center gap-10 text-gray-500 text-sm">
        {logos.map((logo, i) => (
          <span key={i} className="opacity-70 hover:opacity-100 transition">
            {logo}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CompanyLogos;