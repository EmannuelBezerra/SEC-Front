// src/components/common/PhoneField.jsx
import { Controller } from "react-hook-form";

const formatTelefone = (value) => {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length < 11) return numbers;
  const ddd = numbers.slice(0, 2);
  const primeiro = numbers.slice(2, 3);
  const meio = numbers.slice(3, 7);
  const fim = numbers.slice(7);
  return `(${ddd}) ${primeiro} ${meio}-${fim}`;
};

export default function PhoneField({ control, name, errorMessage, setValue }) {
  return (
    <div>
      <Controller
        name={name}
        control={control}
        rules={{
          required: "Formaro de telefone inválido.",
          validate: (value) =>
            value.replace(/\D/g, "").length === 11 || "O número de telefone deve ter 10 ou 11 dígitos com DDD.",
        }}
        render={({ field: { onChange, value } }) => (
          <input
            type="tel"
            placeholder="Contato (88) 9 9999-9999"
            value={value || ""}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "");
              const formatted = formatTelefone(raw);
              setValue(name, formatted); 
              onChange(formatted);
            }}
            maxLength={15}
            className={`w-full px-3 py-2 rounded-xl bg-gray-100 placeholder-gray-500 text-gray-800 focus:outline-none border ${
              errorMessage
                ? "border-red-600 focus:ring-red-500 focus:ring-2"
                : "border-gray-400 focus:ring-green-500 focus:ring-2"
            }`}
          />
        )}
      />
      {errorMessage && <p className="text-red-600 mt-1 text-sm">{errorMessage}</p>}
    </div>
  );
}
