import ListItem from "../../common/ListItem";
import DetailsButton from "../buttons/DetailsButton";
import DeleteButton from "../buttons/DeleteButton";
import permission from "../../../utils/permission";
import capitalizewords from "../../../utils/capitalizewords";
import EditButton from "../buttons/EditButton";

  export default function ProductItem({ product, onEdit, onDelete, onDetails }) {
    const pesoTotal = (product.unidades * product.pesoPorUnidade).toFixed(1);

    const perfil = JSON.parse(localStorage.getItem("user"))?.perfil || "FUNCIONARIO_COMUM";

    const podeExcluir = permission(perfil, ["SUPERVISOR_SENIOR"]);

    return (
      <ListItem
        actions={
          <div className="flex flex-col gap-2">
            <div>
              <DetailsButton onClick={onDetails} />
            </div>
            <div className="flex justify-between gap-2">
              <EditButton  onClick={onEdit} podeEditar={true} />
              <DeleteButton onClick={onDelete} podeExcluir={podeExcluir} />
            </div>
          </div>
        }
      >
      
         <div className="flex gap-2 items-center">
          <div className="min-w-[200px]">
            <p className="text-lg font-semibold">{capitalizewords(product.nome)}</p>
            {product.validade && (
              <p className="text-sm text-gray-600">
                <span className="font-semibold">válido até: </span>{product.validade}
              </p>
            )}
          </div>

          <div className="flex flex-col text-sm bg-white p-2 rounded border border-gray-300">
            <span>
              <strong className="text-base font-semibold">Qtd em estoque:</strong><br />
            </span>
            <div className="flex flex-wrap gap-1">
              <span>
                unidades: <strong>{product.unidades}</strong>{" "}
              </span>
              <span>
                 {
                  pesoTotal == 0.0 ? 
                    <span></span>
                  : 
                  <span>peso: <strong>{pesoTotal + " "}</strong></span>  
                }
              </span>
              <span>
                unidade de medida: <strong>{product.unidadeMedida}</strong>
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 text-xs text-left border border-gray-300 rounded p-2">
            <p>
              <span className="text-gray-600">Categoria:</span>{" "}
              <span className="bg-orange-200 text-orange-800 px-2 py-0.5 rounded font-semibold text-xs">
                {product.categoria}
              </span>
            </p>
            <p className="text-gray-500">
              Qtd mínima: <span className="font-semibold">{product.nivelMinimo}{product.unidadeMedida}</span>
            </p>
          </div>
        </div>
      </ListItem>
    );
  }
