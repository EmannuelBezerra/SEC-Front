import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  List,
  Book,
  Boxes,
  Users,
  FileText,
  LogOut,
  Plus,
  UserCircle,
} from "lucide-react";
import PerfilVisualizacaoModal from "../../components/common/modals/PerfilVisualizacaoModal";
import OrderModal from "../../components/common/modals/OrderModal";

// Receitas simuladas para exemplo
const receitasMock = [
  { id: 1, nome: "Bolo de Chocolate", custo_producao: 10 },
  { id: 2, nome: "Torta de Limão", custo_producao: 12 },
  { id: 3, nome: "Pão de Queijo", custo_producao: 5 },
];

export default function Sidebar({ onLogout }) {
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });

  const perfil = usuarioLogado?.perfil || "FUNCIONARIO_COMUM";

  const menu = [
    { to: "/app/home", icon: Home, label: "Home" },
    { to: "/app/orders", icon: List, label: "Pedidos" },
    ...(perfil === "FUNCIONARIO_COMUM"
      ? []
      : [{ to: "/app/revenues", icon: Book, label: "Receitas" }]),
    { to: "/app/stock", icon: Boxes, label: "Estoque" },
    ...(perfil === "SUPERVISOR_SENIOR"
      ? [
          { to: "/app/employees", icon: Users, label: "Funcionários" },
          { to: "/app/reports", icon: FileText, label: "Relatórios" },
        ]
      : []),
  ];

  const handleSalvarPerfil = (dadosAtualizados) => {
    localStorage.setItem("user", JSON.stringify(dadosAtualizados));
    setUsuarioLogado(dadosAtualizados);
    console.log("Dados atualizados:", dadosAtualizados);
  };

  const handleSalvarPedido = (novoPedido) => {
    console.log("Pedido cadastrado:", novoPedido);
    // Aqui você pode adicionar lógica para enviar para a API ou atualizar o estado global
  };

  return (
    <>
      <aside className="w-64 bg-green-800 p-4 flex flex-col justify-between shadow-lg">
        <div className="flex flex-col gap-2 mt-4">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPerfilModal(true)}
                className="text-white hover:text-green-200 hover:cursor-pointer"
                title="Visualizar Perfil"
              >
                <UserCircle size={40} />
              </button>
              <div>
                <p className="text-lg font-semibold text-gray-100">{usuarioLogado?.nome || "Usuário"}</p>
                <p className="text-xs text-zinc-100">{perfil}</p>
              </div>
            </div>

            <button
              onClick={() => setShowOrderModal(true)}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-green-600 hover:cursor-pointer hover:bg-green-700 text-white py-2 rounded"
            >
              <Plus size={16} /> Novo Pedido
            </button>
          </div>

          <nav className="space-y-1">
            {menu.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded text-lg ${
                    isActive
                      ? "bg-gray-50 text-green-700 font-semibold"
                      : "text-white hover:bg-gray-100 hover:text-green-700"
                  }`
                }
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-sm text-white hover:underline hover:cursor-pointer"
        >
          <LogOut size={16} /> Sair
        </button>
      </aside>

      {/* Modal de Perfil */}
      <PerfilVisualizacaoModal
        isOpen={showPerfilModal}
        onClose={() => setShowPerfilModal(false)}
        userData={usuarioLogado}
        onSave={handleSalvarPerfil}
      />

      {/* Modal de Pedido */}
      <OrderModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        receitasDisponiveis={receitasMock} // Substitua pelo que vier da API no futuro
        onSave={handleSalvarPedido}
      />
    </>
  );
}
