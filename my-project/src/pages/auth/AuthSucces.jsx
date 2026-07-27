import { useEffect } from "react";
import { useNavigate,useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const AuthSuccess =()=>{

const [params]=useSearchParams();
const navigate=useNavigate();
const {hydrateUser}=useAuth();


useEffect(()=>{

const token=params.get("token");


if(token){

localStorage.setItem(
"token",
token
);


hydrateUser();


navigate("/app");


}else{

navigate("/login");

}


},[hydrateUser,navigate,params]);


return <p>Authenticating...</p>;

};


export default AuthSuccess;