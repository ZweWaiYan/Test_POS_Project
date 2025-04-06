import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser } from "react-icons/fa6";
import { RiLockPasswordFill } from "react-icons/ri";
import { jwtDecode } from "jwt-decode";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");


        try {
            const res = await axios.post("/api/login", { username, password });
        
            if (res.data && res.data.token) {
              const token = res.data.token;
              localStorage.setItem("token", token);
        
              const decodedToken = jwtDecode(token);
        
              if (decodedToken && decodedToken.branch) {
                localStorage.setItem("branch", decodedToken.branch);
              } else {
                console.error("Branch not found in token.");
              }
              navigate("/dashboard");
            } else {
              console.error("Token not found in the response.");
            }
        } catch (err) {
            console.error("Login Error:", err.response?.data || err.message);
            setError(err.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-[800px] h-full max-h-[900px] grid md:grid-cols-2 rounded-lg overflow-hidden">
                {/* Left Side */}
                <div className="relative bg-blue-500 p-8 text-white flex flex-col items-center justify-center rounded-tr-full">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold mb-4">Hello, Welcome!</h1>
                        <p className="mb-4 text-sm opacity-90 flex justify-center">Don't have an account?</p>
                        <button onClick={() => navigate("/register")} className="w-full h-[45px] font-semibold text-white hover:border-2 border rounded-lg">
                            Register
                        </button>
                        <button onClick={() => navigate("/adminRegister")} className="w-full h-[45px] font-semibold text-white hover:border-2 border rounded-lg mt-4">
                            Admin Register
                        </button>
                    </div>
                    <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-blue-400 rounded-tl-full" />
                </div>
                
                {/* Right Side */}
                <div className="p-8 bg-white">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold flex justify-center items-center">Login</h2>

                        {error && <p className="text-red-500 text-center">{error}</p>}

                        <form onSubmit={handleLogin} className="space-y-4 flex flex-col items-center justify-center w-full">
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    placeholder="Username"
                                    className="bg-gray-50 h-[45px] w-full pl-5"
                                    autoComplete="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                <FaUser className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                            </div>

                            <div className="relative w-full">
                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="h-[45px] w-full pl-5 bg-gray-50"
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <RiLockPasswordFill className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                            </div>

                            <button type="submit" className="w-full bg-blue-500 font-semibold hover:bg-blue-600 h-[45px] text-white rounded-lg">
                                Login
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
