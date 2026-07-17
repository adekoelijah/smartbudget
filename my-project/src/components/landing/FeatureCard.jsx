const features = [
  {
    title: "Smart Budgeting",
    desc: "Create budgets and track spending in real-time.",
  },
  {
    title: "AI Insights",
    desc: "Get intelligent financial recommendations.",
  },
  {
    title: "Analytics Dashboard",
    desc: "Visualize your financial trends clearly.",
  },
  {
    title: "Secure & Private",
    desc: "Your data is encrypted and protected.",
  },
];

const Features = () => {
  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl border dark:border-gray-800 hover:shadow-lg transition"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {f.title}
            </h3>
            <p className="text-sm text-gray-500 mt-2">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;