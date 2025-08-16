import { Info } from "lucide-react";

export default function DetalhesProdutoModal({ isOpen, onClose, produto }) {
  if (!isOpen || !produto) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Info className="text-blue-600" size={24} />
          <h2 className="text-2xl font-semibold text-gray-800">
            Detalhes do Produto<br/>
          <span className="text-sm text-gray-500">ID: {produto.id}</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p className="font-medium text-gray-500">Nome</p>
            <p>{produto.nome}</p>
          </div>

          <div>
            <p className="font-medium text-gray-500">Categoria</p>
            <p>{produto.categoria}</p>
          </div>

          <div>
            <p className="font-medium text-gray-500">Unidade</p>
            <p>{produto.unidadeMedida}</p>
          </div>

          <div>
            <p className="font-medium text-gray-500">Peso por unidade</p>
            <p>{produto.pesoPorUnidade}</p>
          </div>

          <div>
            <p className="font-medium text-gray-500">Quantidade</p>
            <p>{produto.unidades}</p>
          </div>

          <div>
            <p className="font-medium text-gray-500">Nível mínimo</p>
            <p>{produto.nivelMinimo}</p>
          </div>

          <div>
            <p className="font-medium text-gray-500">Preço de custo</p>
            <p>R$ {produto.precoCusto?.toFixed(2)}</p>
          </div>

          <div>
            <p className="font-medium text-gray-500">Perecível</p>
            <p>{produto.validade ? "Sim" : "Não"}</p>
          </div>

          {produto.validade && (
            <div className="col-span-2">
              <p className="font-medium text-gray-500">Validade</p>
              <p>{produto.validade}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="hover:cursor-pointer px-5 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
