import axios from "axios";
const client=axios.create({
    baseURL:"https://ai-resume-builder-backend-m3v3.onrender.com"
});
export function setAuthToken(token) {
    if(token)
    {
        client.defaults.headers.common["Authorization"]=`Bearer ${token}`;
    }else{
        delete client.defaults.headers.common["Authorization"];
    }
}
export default client