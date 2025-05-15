import axios from "axios";

const api = axios.create({
	baseURL: process.env.REACT_APP_BACKEND_URL,
	withCredentials: true,
});

// Adiciona um interceptor para logar requisições
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		if (token) {
			const parsedToken = JSON.parse(token);
			config.headers["Authorization"] = `Bearer ${parsedToken}`;
			console.log("Enviando requisição com token:", `Bearer ${parsedToken.substring(0, 15)}...`);
		}
		return config;
	},
	(error) => {
		console.error("Erro na requisição:", error);
		return Promise.reject(error);
	}
);

export const openApi = axios.create({
	baseURL: process.env.REACT_APP_BACKEND_URL
});

export default api;
