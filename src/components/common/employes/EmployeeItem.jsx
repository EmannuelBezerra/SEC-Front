import { useState } from "react";
import ConfirmModal from "../../common/modals/ConfirmarMudancaCargo";
import ListItem from "../ListItem";
import EditButton from "../buttons/EditButton";
import { ArrowDownUp } from "lucide-react";

export default function EmployeeItem({ funcionario, onPromote, onDemote, onEdit }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const { nome, email, telefone, perfil, id } = funcionario;
  const usuarioAtual = JSON.parse(localStorage.getItem("user"));
  const perfilAtual = usuarioAtual?.perfil || "FUNCIONARIO_COMUM";

  const isComum = perfil === "FUNCIONARIO_COMUM";
  const isJunior = perfil === "SUPERVISOR_JUNIOR";
  const podeAlterarNivel = perfilAtual === "SUPERVISOR_SENIOR" && (isComum || isJunior);

  const acaoTexto = isComum ? "promover para Supervisor Júnior" : "rebaixar para Funcionário Comum";
  const corBotao = isComum ? "bg-blue-500 hover:bg-blue-600" : "bg-yellow-500 hover:bg-yellow-600";

  const handleConfirm = () => {
    if (isComum && typeof onPromote === "function") {
      onPromote(funcionario);
    } else if (isJunior && typeof onDemote === "function") {
      onDemote(funcionario);
    }
  };

  const handleEdit = () => {
    if (typeof onEdit === "function") {
      onEdit(funcionario);
    }
  };

  return (
    <>
      <ListItem
        actions={
          <div className="flex flex-col gap-2 px-4">
            <EditButton onClick={handleEdit} />
            <button
              className={`flex gap-1 items-center text-white text-sm px-3 py-1 rounded w-full disabled:opacity-50 hover:cursor-pointer ${corBotao}`}
              onClick={() => setShowConfirm(true)}
              disabled={!podeAlterarNivel}
            >
              <ArrowDownUp size={16}/>

              {isComum ? "Promover" : "Rebaixar"}
            </button>
          </div>
        }
      >
        <div className="flex w-full justify-between px-4 items-center mr-4">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xl font-semibold">{nome}</p>
              <p className="text-sm text-gray-500 mt-1">
                Perfil:{" "}
                <span className="font-semibold text-black bg-gray-100 px-1 py-0.5 rounded">
                  {perfil.replace("_", " ").toLowerCase()}
                </span>
              </p>
            </div>
            <p className="text-xs text-gray-400">{id}</p>
          </div>
          <div className="text-left">
            <p className="text-sm text-gray-600">{email}</p>
            <p className="text-sm text-gray-600">{telefone}</p>
          </div>
        </div>
      </ListItem>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        message={`Tem certeza que deseja ${acaoTexto}?`}
      />
    </>
  );
}
