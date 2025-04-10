import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

const AuthProvider = ({ children }) => {
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isAuth, setIsAuth] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem("token");
		const user = localStorage.getItem("user");

		if (token && user) {
			api.defaults.headers.Authorization = `Bearer ${token}`;
			setUser(JSON.parse(user));
			setIsAuth(true);
		}
		setLoading(false);
	}, []);

	const handleLogin = async (email, password) => {
		setLoading(true);
		try {
			const { data } = await api.post("/auth/login", { email, password });
			localStorage.setItem("token", data.token);
			localStorage.setItem("user", JSON.stringify(data.user));
			api.defaults.headers.Authorization = `Bearer ${data.token}`;
			setUser(data.user);
			setIsAuth(true);
			navigate("/tickets");
		} catch (err) {
			toast.error("Erro ao realizar login. Verifique suas credenciais.");
			setLoading(false);
		}
	};

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		api.defaults.headers.Authorization = undefined;
		setUser(null);
		setIsAuth(false);
		navigate("/login");
	};

	return (
		<AuthContext.Provider
			value={{
				loading,
				user,
				isAuth,
				handleLogin,
				handleLogout
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export { AuthContext, AuthProvider };
