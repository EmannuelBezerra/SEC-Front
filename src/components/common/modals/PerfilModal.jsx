import { useEffect, useState } from "react";

export default function PerfilModal({ isOpen, onClose, onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    perfil: "FUNCIONARIO_COMUM",
  });

  const [errors, setErrors] = useState({});
  const perfilLogado = JSON.parse(localStorage.getItem("user"))?.perfil;
  const podeEditarPerfil = perfilLogado === "SUPERVISOR_SENIOR";

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório.";
    if (!formData.email.trim()) newErrors.email = "Email é obrigatório.";
    if (!formData.telefone.trim()) newErrors.telefone = "Telefone é obrigatório.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md">
        <h2 className="text-xl font-bold mb-4">Editar Perfil</h2>

        <form onSubmit={handleSubmit} className="space-y-3 text-sm text-black">
          {/* Nome */}
          <div>
            <label>Nome:</label>
            <input
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full px-3 py-1.5 rounded border border-gray-300"
              placeholder="Nome do funcionário"
            />
            {errors.nome && <p className="text-red-500 text-xs">{errors.nome}</p>}
          </div>

          {/* Email */}
          <div>
            <label>Email:</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-1.5 rounded border border-gray-300"
              placeholder="Email"
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>

          {/* Telefone */}
          <div>
            <label>Telefone:</label>
            <input
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              className="w-full px-3 py-1.5 rounded border border-gray-300"
              placeholder="(xx) xxxxx-xxxx"
            />
            {errors.telefone && <p className="text-red-500 text-xs">{errors.telefone}</p>}
          </div>

          {/* Perfil (somente para SUPERVISOR_SENIOR) */}
          <div>
            <label>Cargo:</label>
            <select
              name="perfil"
              value={formData.perfil}
              onChange={handleChange}
              disabled={!podeEditarPerfil}
              className="w-full px-3 py-1.5 rounded border border-gray-300 disabled:opacity-50"
            >
              <option value="FUNCIONARIO_COMUM">Funcionário Comum</option>
              <option value="SUPERVISOR_JUNIOR">Supervisor Júnior</option>
              <option value="SUPERVISOR_SENIOR">Supervisor Sênior</option>
            </select>
          </div>

          {/* Botões */}
          <div className="flex gap-4 justify-between pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-orange-500 text-white py-2 rounded hover:bg-orange-60 hover:cursor-pointer"
            >
              VOLTAR
            </button>
            <button
              type="submit"
              className="w-1/2 bg-green-600 text-white py-2 rounded hover:bg-green-700 hover:cursor-pointer"
            >
              SALVAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
