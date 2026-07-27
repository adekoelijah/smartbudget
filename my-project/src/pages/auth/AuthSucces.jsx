// import { useEffect } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";

// const AuthSuccess = () => {
//   const [params] = useSearchParams();
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = params.get("token");

//     if (token) {
//       localStorage.setItem("token", token);
//       navigate("/app");
//     } else {
//       navigate("/login");
//     }
//   }, []);

//   return <p>Authenticating...</p>;
// };

// export default AuthSuccess;


import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const AuthSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {

    const token = params.get("token");

    if (token) {

      localStorage.setItem(
        "token",
        token
      );

      navigate("/app", {
        replace: true,
      });

    } else {

      navigate("/login", {
        replace: true,
      });

    }

  }, [params, navigate]);


  return (
    <p>
      Authenticating...
    </p>
  );
};

export default AuthSuccess;