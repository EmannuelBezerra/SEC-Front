import { Info } from "lucide-react";

export default function DetalhesRevenueModal({ isOpen, onClose, receita }) {
  if (!isOpen || !receita) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-lg border border-gray-200 max-h-[80vh] overflow-y-auto">
        
        <div className="flex items-center gap-2 mb-4">
          <Info className="text-blue-600" size={24} />
          <h2 className="text-2xl font-semibold text-gray-800">
            Detalhes da receita<br/>
          <span className="text-sm text-gray-500">ID: {receita.id}</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
          <div>
            <p className="font-medium text-gray-500">Nome</p>
            <p>{receita.nome}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Rendimento</p>
            <p>{receita.rendimento}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Custo de Produção</p>
            <p>R$ {receita.custoDeProducao?.toFixed(2)}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Ingredientes</h3>
          {receita.ingredientes && receita.ingredientes.length > 0 ? (
            <ul className="list-disc pl-5 max-h-48 overflow-y-auto text-gray-700">
              {receita.ingredientes.map((ing) => (
                <li key={ing.id} className="mb-1">
                  {ing.nome} — Quantidade: {ing.quantidadeUsada}{ing.unidadeUsadaNaReceita}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Nenhum ingrediente selecionado.</p>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Modo de Preparo</h3>
          {receita.modoDePreparo ? (
            <div className="max-h-[500px] w-full border rounded overflow-y-auto p-2">
              <p className="text-gray-700 whitespace-pre-line break-words">{receita.modoDePreparo }</p>
            </div>
          ) : (
            <p className="text-gray-500">Nenhuma instrução fornecida.</p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            type="button"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
