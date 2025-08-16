
import { useState } from "react";
import { Eye, EyeClosed } from "lucide-react";

export default function PasswordField({ errorMessage, ...props }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        placeholder="senha, no mínimo 8 dígitos"
        className={`w-full px-3 py-2 rounded-xl bg-gray-100 placeholder-gray-500 text-gray-800 pr-10 border focus:outline-none ${
          errorMessage
            ? "border-red-600 focus:ring-red-500 focus:ring-2"
            : "border-gray-400 focus:ring-green-500 focus:ring-2"
        }`}
        {...props}
      />

      <span
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-2.5 cursor-pointer"
      >
        {showPassword ? (
          <Eye className="text-gray-500" />
        ) : (
          <EyeClosed className="text-gray-400" />
        )}
      </span>

      {errorMessage && <p className="text-red-600 mt-2 text-sm">{errorMessage}</p>}
    </div>
    
  );
}
