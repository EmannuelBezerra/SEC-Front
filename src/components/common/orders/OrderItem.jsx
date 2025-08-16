import { SquarePen, Trash2 } from "lucide-react";
import ListItem from "../ListItem";
import DetailsButton from "../buttons/DetailsButton";
import EditButton from "../buttons/EditButton";
import DeleteButton from "../buttons/DeleteButton";

export default function OrderItem({
  id = "d35R4TT89-T7_g",
  date = "00/00/0000",
  clientName = "nome do cliente",
  total = 100.0,
  status = "PENDENTE",
  onViewDetails,
  onEdit,
  onDelete,
  onChangeStatus,

  disableEdit = false,
  disableDelete = false,
  disableStatusChange = false,
}) {

  // Permissões com base nos props recebidos
  const podeEditar = !disableEdit && (status !== "CANCELADO" && status !== "CONCLUIDO");
  const podeExcluir = !disableDelete;

  return (
    <ListItem
      actions={
        <div className="flex flex-col gap-2">
          <DetailsButton onClick={onViewDetails} />

          <div className="flex gap-2 w-full">
            <EditButton onClick={onEdit} podeEditar={podeEditar} />
            <DeleteButton onClick={onDelete} podeExcluir={podeExcluir} />
          </div>
        </div>
      }
    >
      <div className="flex flex-1 justify-between items-center">
        {/* ID e Data */}
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <strong className="block text-black">{id}</strong>
            <span className="text-gray-500">Pedido realizado em: {date}</span>
          </div>

          {/* Cliente e Valor */}
          <div className="text-sm px-4 py-4 border border-gray-300 rounded bg-white">
            <p>
              Cliente: <strong>{clientName}</strong>
            </p>
            <p>
              Valor total: <strong>R$ {total.toFixed(2)}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-col border border-gray-300 gap-1 rounded p-2 bg-white">
          <p className="font-semibold">Status:</p>
          <select
            value={status} // Use a prop 'status' to control the select value
            onChange={(e) => onChangeStatus(e.target.value)} // Call the prop function with the new status
            className={`p-1 rounded text-white font-bold
            ${status === "PENDENTE" ? "bg-yellow-500" : ""}
            ${status === "CONCLUIDO" ? "bg-green-500" : ""}
            ${status === "CANCELADO" ? "bg-red-500" : ""}
        `}
            disabled={disableStatusChange} // Use the 'disableStatusChange' prop to control the disabled state
          >
            <option value="PENDENTE">PENDENTE</option>
            <option value="CONCLUIDO">CONCLUIDO</option>
            <option value="CANCELADO">CANCELADO</option>
          </select>
        </div>
      </div>
    </ListItem>
  );
}
