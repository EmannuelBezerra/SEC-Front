export default function SucessModal({ mensagem, onClose }) {
  return (
    <div className="fixed inset-0 overflow-y-auto h-full w-full flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl text-center">
        <h2 className="text-green-600 text-xl font-bold mb-2">Sucesso!</h2>
        <p className="text-gray-700 mb-4">{mensagem}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-700 transition"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}