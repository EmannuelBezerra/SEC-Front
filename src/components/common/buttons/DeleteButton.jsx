import { Trash } from "lucide-react";

export default function DeleteButton({ onClick, podeExcluir = false }) {
  return (
    <button
      className={`flex gap-1 items-center bg-red-500 text-white text-md px-3 py-1 rounded hover:bg-red-600 w-1/2 disabled:opacity-50 ${
        !podeExcluir ? "cursor-not-allowed" : "hover:cursor-pointer"
      }`}
      onClick={onClick}
      disabled={!podeExcluir}
    >
      <Trash size={16} />
      Deletar
    </button>
  );
}
