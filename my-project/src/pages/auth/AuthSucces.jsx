import { useEffect } from "react";
import { useNavigate,useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const AuthSuccess =()=>{

const [params]=useSearchParams();
const navigate=useNavigate();
const {hydrateUser}=useAuth();

useEffect(() => {

  const completeAuth = async () => {

    const token = params.get("token");

    if (!token) {
      navigate("/login", { replace:true });
      return;
    }


    try {

      localStorage.setItem(
        "token",
        token
      );


      await hydrateUser();


      navigate("/app", {
        replace:true,
      });


    } catch(error) {

      console.error(
        "GOOGLE AUTH HYDRATION ERROR:",
        error
      );


      localStorage.removeItem("token");

      navigate("/login", {
        replace:true,
      });

    }

  };


  completeAuth();


}, [hydrateUser, navigate, params]);

return <p>Authenticating...</p>;

};

export default AuthSuccess;