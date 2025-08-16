import { ScanEye, Pencil, Trash } from "lucide-react";
import ListItem from "../ListItem";
import DetailsButton from "../../common/buttons/DetailsButton";
import EditButton from "../../common/buttons/EditButton";
import DeleteButton from "../../common/buttons/DeleteButton";

export default function RevenueItem({ receita, onEdit, onDelete, onView }) {
  const perfilUsuario = JSON.parse(localStorage.getItem("user"))?.perfil || "";

  const podeDeletar = perfilUsuario === "SUPERVISOR_SENIOR";
  const custo = Number(receita.custoDeProducao ?? receita.custo_producao ?? 0.00);

  return (
    <ListItem
      actions={
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <DetailsButton onClick={onView} />

          <div className="flex gap-2 w-full">
            <EditButton onClick={onEdit} podeEditar={true} />
            <DeleteButton onClick={onDelete} podeExcluir={podeDeletar} />
          </div>
        </div>
      }
    >
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold">{receita.nome}</h3>
        <div className="rounded text-sm inline-block">
          <p className="text-gray-500">
            Rendimento:{" "}
            <span className="font-semibold text-gray-800">
              {" "}
              {receita.rendimento} porções
            </span>
          </p>
          <p className="text-gray-500">
            Custo de Produção (R$):{" "}
            <span className="font-semibold text-gray-800">
              {custo.toFixed(2)}
            </span>
          </p>
        </div>
      </div>
    </ListItem>
  );
}
