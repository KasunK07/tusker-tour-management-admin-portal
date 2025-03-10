import axios from "axios";



const api = axios.create({
    baseURL:"http://localhost:9090",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },  
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
                return api(error.config); 
            }
        }
        return Promise.reject(error);
    }
);

export default api;