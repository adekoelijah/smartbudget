export const getCurrentUser = async (req, res) => {
  if (!req.user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ user: req.user });
};
