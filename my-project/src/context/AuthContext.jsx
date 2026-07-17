import { createContext } from "react";

// ✅ Auth Context
// Use AuthProvider for wrapping app
// Use useAuth hook to consume context
const AuthContext = createContext(null);

export default AuthContext;