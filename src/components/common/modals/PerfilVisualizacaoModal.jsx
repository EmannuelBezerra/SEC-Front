import { useState, useEffect } from "react";
import { X, User, Mail, Phone, Shield } from "lucide-react";

export default function PerfilVisualizacaoModal({ isOpen, onClose, userData, onSave }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  // Preencher os campos quando o modal abrir
  useEffect(() => {
    if (userData) {
      setNome(userData.nome || "");
      setEmail(userData.email || "");
      setTelefone(userData.telefone || "");
    }
  }, [userData]);

  const handleSubmit = () => {
    const updatedData = {
      ...userData,
      nome,
      email,
      telefone,
    };
    onSave(updatedData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-green-700">Perfil do Usuário</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-500 hover:cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 text-sm text-gray-800">
          <div className="flex items-center gap-2">
            <User size={18} className="text-green-600" />
            <span className="font-medium w-20">Nome:</span>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-2 py-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <Mail size={18} className="text-green-600" />
            <span className="font-medium w-20">Email:</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-2 py-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <Phone size={18} className="text-green-600" />
            <span className="font-medium w-20">Telefone:</span>
            <input
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="flex-1 border border-gray-300 rounded px-2 py-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <Shield size={18} className="text-green-600" />
            <span className="font-medium w-20">Perfil:</span>
            <span>{userData.perfil}</span>
          </div>
        </div>

        <div className="pt-6 flex flex-col gap-2">
          <button
            onClick={handleSubmit}
            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded hover:cursor-pointer"
          >
            Salvar Alterações
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded hover:cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
