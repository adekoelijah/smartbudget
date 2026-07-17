

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";

import { AuthProvider } from "./context/AuthProvider";


import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { UserProvider } from "./context/UserContext";

import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 min
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        
          <QueryClientProvider client={queryClient}>
         <UserProvider>
      <App />
    </UserProvider>
        </QueryClientProvider>
       
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);