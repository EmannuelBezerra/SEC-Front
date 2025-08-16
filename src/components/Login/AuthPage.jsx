import { useLocation, useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm";
import Register from "../../pages/Register/Register";

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Login se estiver na rota "/" (página inicial), Cadastro se estiver em "/usuario"
  const isLogin = location.pathname === "/";

  const handleTabChange = (tab) => {
    if (tab === "login") navigate("/");
    else navigate("/usuario");
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full h-full">
      <div className="p-4 rounded w-full max-w-sm">
        <h2 className="text-xl font-semibold text-center mb-4">
          Acesse sua Conta ou Cadastre-se
        </h2>

        <div className="box-border border-2 border-zinc-300 rounded-3xl">
          <div className="flex justify-between mb-2 p-2 bg-gray-300 rounded-2xl overflow-hidden">
            <button
              onClick={() => handleTabChange("login")}
              className={`w-1/2 py-2 rounded-2xl font-medium transition ${
                isLogin ? "bg-white text-black" : "bg-gray-300 text-gray-600 hover:cursor-pointer"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => handleTabChange("register")}
              className={`w-1/2 py-2 rounded-2xl font-medium transition ${
                !isLogin ? "bg-white text-black" : "bg-gray-300 text-gray-600 hover:cursor-pointer"
              }`}
            >
              Cadastro
            </button>
          </div>
          <div className="p-4">
            {isLogin ? <LoginForm /> : <Register />}
          </div>
        </div>
      </div>
    </div>
  );
}
