export const createCheckoutSession = async (plan) => {
  const res = await fetch("/api/billing/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });

  if (!res.ok) throw new Error("Checkout failed");

  return res.json();
};