import { createCheckoutSession } from "../../services/billingService";

const plans = [
  {
    name: "Free",
    price: "₦0",
    plan: "free",
    features: ["Basic tracking", "Limited insights"],
  },
  {
    name: "Pro",
    price: "₦5,000/mo",
    plan: "pro",
    features: ["Unlimited tracking", "AI insights", "Reports"],
  },
];

const Pricing = () => {
  const handleCheckout = async (plan) => {
    try {
      const { url } = await createCheckoutSession(plan);
       window.location.assign(url);
    } catch {
      alert("Payment failed");
    }
  };

  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-4 text-center">

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Simple Pricing
        </h2>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          {plans.map((p, i) => (
            <div key={i} className="p-6 border dark:border-gray-800 rounded-2xl">
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="text-2xl font-bold mt-2">{p.price}</p>

              <ul className="mt-4 text-sm text-gray-500 space-y-2">
                {p.features.map((f, idx) => (
                  <li key={idx}>✔ {f}</li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(p.plan)}
                className="mt-6 w-full py-2 rounded-lg bg-black text-white"
              >
                Choose Plan
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Pricing;