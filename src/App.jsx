import AuthPage from "./components/Login/AuthPage.jsx";
import loginImage from "./assets/login_img.jpg";

export default function App() {
  return (
    <div className="flex w-screen h-screen">
      <div className="w-1/2 h-full">
        <img
          src={loginImage}
          alt="Tela de login"
          className="object-cover w-full h-full"
        />
      </div>
      <div className="flex-1 flex items-center justify-center bg-white">
        <AuthPage />
      </div>
    </div>
  );
}