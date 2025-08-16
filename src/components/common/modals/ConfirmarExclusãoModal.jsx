//ConfirmarExclusao:
export default function ConfirmarExclusãoModal({
  isOpen,
  onClose,
  onConfirm,
  mensagem,
  receitasAfetadas = [],
  numeroPedidos = 0,
  onForcarExclusao
}) {
  if (!isOpen) return null;

  const haImpacto = receitasAfetadas.length > 0 || numeroPedidos > 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-[95%] max-w-md text-center">
        <h2 className="text-lg font-semibold mb-4">{mensagem}</h2>

        {haImpacto && (
          <div className="text-left text-sm bg-red-50 border border-red-300 p-4 rounded mb-4">
            <p className="text-red-700 font-semibold mb-2">Atenção: esta exclusão afeta outros dados!</p>

            {receitasAfetadas.length > 0 && (
              <div className="mb-2">
                <p className="font-medium">Receitas que usam este produto:</p>
                <ul className="list-disc list-inside text-red-800">
                  {receitasAfetadas.map((receita) => (
                    <li key={receita.id}>{receita.nome}</li>
                  ))}
                </ul>
              </div>
            )}

            {numeroPedidos > 0 && (
              <p className="text-red-800">
                Este produto está vinculado a <strong>{numeroPedidos}</strong> pedido(s).
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row justify-center">
          <button
            onClick={onClose}
            className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>

          {!haImpacto && (
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Confirmar
            </button>
          )}

          {haImpacto && (
            <button
              onClick={() => {
                onForcarExclusao?.();
                onClose();
              }}
              className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 border border-red-900"
            >
              Forçar Exclusão
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
