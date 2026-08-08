import { createContext,useContext,useState } from "react";
import client,{setAuthToken  } from "../api/client";
const AuthContext=createContext(null);
export function AuthProvider({children}) {
    const[token,setToken]=useState(null);
    const[user,setUser]=useState(null);
    async function login(email,password) {
        const res=await client.post("/auth/login",{email,password});
        setToken(res.data.access_token);
        setAuthToken(res.data.access_token);
    }
    async function signup(email,password,fullName) {
        await client.post("/auth/signup",{
            email,
            password,
            full_name:fullName,
        });
    }
    function logout() {
        setToken(null);
        setAuthToken(null);
        setUser(null);
    }
    return(
        <AuthContext.Provider value={{token,user,login,signup,logout}}>
            {children}
         </AuthContext.Provider>
    );
}
export function  useAuth() {
    return useContext(AuthContext);
}