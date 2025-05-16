import axios from "axios";

const api = axios.create({
	baseURL: process.env.REACT_APP_BACKEND_URL,
	withCredentials: true,
});

// Variável para controlar se já existe um refresh em andamento
let isRefreshing = false;
// Array para armazenar as requisições que foram realizadas durante o refresh
let failedQueue = [];

const processQueue = (error, token = null) => {
	failedQueue.forEach(prom => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	
	failedQueue = [];
};

// Adiciona um interceptor para logar requisições
api.interceptors.request.use(
	(config) => {
		// Para requisições de logout, garanta que o token esteja sempre presente
		if (config.url === "/auth/logout" && config.method === "delete") {
			console.log("Interceptando requisição de logout");
			const token = localStorage.getItem("token");
			if (token) {
				try {
					const parsedToken = JSON.parse(token);
					config.headers["Authorization"] = `Bearer ${parsedToken}`;
					console.log("Token aplicado à requisição de logout");
				} catch (error) {
					console.error("Erro ao processar token para logout:", error);
				}
			}
			return config;
		}
		
		// Comportamento padrão para outras requisições
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const parsedToken = JSON.parse(token);
				config.headers["Authorization"] = `Bearer ${parsedToken}`;
				console.log("Enviando requisição com token:", `Bearer ${parsedToken.substring(0, 15)}...`);
			} catch (error) {
				console.error("Erro ao processar token na requisição:", error);
			}
		}
		return config;
	},
	(error) => {
		console.error("Erro na requisição:", error);
		return Promise.reject(error);
	}
);

// Interceptor para tratar respostas com erro e tentar atualizar o token quando necessário
api.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		const originalRequest = error.config;
		
		// Ignora erros em requisições de logout
		if (originalRequest?.url === "/auth/logout" && originalRequest?.method === "delete") {
			console.log("Erro na requisição de logout, mas continuando o processo de logout");
			return Promise.reject(error);
		}
		
		// Evita loop infinito tentando refresh no endpoint de refresh
		if (error.response?.status === 401 && !originalRequest._retry && 
			!originalRequest.url.includes('/auth/refresh_token')) {
			
			if (isRefreshing) {
				// Se já estiver em processo de refresh, adiciona a requisição à fila
				try {
					const token = await new Promise((resolve, reject) => {
						failedQueue.push({ resolve, reject });
					});
					
					originalRequest.headers['Authorization'] = `Bearer ${token}`;
					return api(originalRequest);
				} catch (err) {
					return Promise.reject(err);
				}
			}
			
			originalRequest._retry = true;
			isRefreshing = true;
			
			try {
				// Tenta fazer o refresh do token
				const { data } = await api.post("/auth/refresh_token", {}, { _retry: true });
				
				if (data && data.token) {
					localStorage.setItem("token", JSON.stringify(data.token));
					api.defaults.headers.Authorization = `Bearer ${data.token}`;
					originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
					
					// Processa a fila de requisições pendentes
					processQueue(null, data.token);
					return api(originalRequest);
				} else {
					processQueue(new Error('Falha ao renovar token'));
					throw new Error('Falha ao renovar token');
				}
			} catch (refreshError) {
				processQueue(refreshError);
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}
		
		return Promise.reject(error);
	}
);

export const openApi = axios.create({
	baseURL: process.env.REACT_APP_BACKEND_URL
});

export default api;
