import { useState } from "react";
import PasswordField from "./PasswordField"; 

export default function ConfirmacaoModal({
  pendingCargo,
  onConfirm,
  onCancel,
  modalError,
  setModalError,
}) {
  const [senhaInput, setSenhaInput] = useState("");

  const handleChange = (e) => {
    setSenhaInput(e.target.value);
    if (modalError) setModalError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(senhaInput.trim());
  };

  return (
    <div>
      <dialog
        className="fixed inset-0 overflow-y-auto h-full w-full flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        <form
          method="dialog"
          onSubmit={handleSubmit}
          className="w-[90vw] max-w-md p-6 bg-white rounded-xl shadow-xl flex flex-col space-y-4 text-center"
        >
          <h3 className="font-bold text-lg">Digite a senha de validação de Cargo:</h3>
          <p className="text-sm text-gray-600">
            Digite a senha para confirmar o cargo{" "}
            <strong>
              {pendingCargo === "Junior"
                ? "Supervisor Júnior"
                : "Supervisor Sênior"}
            </strong>
            :
          </p>

          {/* Campo de senha com ícone de visibilidade */}
          <PasswordField
            value={senhaInput}
            onChange={handleChange}
            errorMessage={modalError}
            name="senhaConfirmacao"
            autoFocus
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setSenhaInput("");
                setModalError("");
                onCancel();
              }}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!senhaInput.trim()}
              className={`px-4 py-2 rounded text-white transition-colors ${
                senhaInput.trim()
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-green-400 cursor-not-allowed"
              }`}
            >
              Confirmar
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
