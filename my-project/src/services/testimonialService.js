export const getTestimonials = async () => {
  const res = await fetch("/api/testimonials");

  if (!res.ok) throw new Error("Failed to fetch testimonials");

  return res.json();
};