export const sendOverspendingAlert = async (payload) => {
  try {
    await fetch("/api/notify/overspending", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("Email notification failed", err);
  }
};