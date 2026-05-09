

export const getPublicStats = async () => {
  const res = await fetch("/api/public/stats");

  if (!res.ok) {
    throw new Error("Failed to fetch stats");
  }

  return res.json();
};

