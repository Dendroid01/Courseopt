import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import AuthLayout from "../components/Layout/AuthLayout.jsx"; // отдельный layout для auth
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:5200/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data?.message || "Ошибка авторизации");
            }

            const data = await res.json();
            login(data); 
            navigate("/dashboard"); 
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <AuthLayout>
            <div className="w-full max-w-sm bg-white p-6 rounded shadow">
                <h1 className="text-2xl font-bold mb-4 text-center">Вход</h1>
                {error && <div className="text-red-500 mb-2">{error}</div>}
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="border p-2 rounded"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="border p-2 rounded"
                    />
                    <button type="submit" className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                        Войти
                    </button>
                </form>
            </div>
        </AuthLayout>
    );
};

export default Login;