import { SquarePen } from "lucide-react";

export default function EditButton({ onClick, podeEditar = true }) {
  return (
    <button
      onClick={() => {
        if (podeEditar) onClick?.();
      }}
      disabled={!podeEditar}
      className={`flex w-full gap-1 items-center bg-emerald-500 text-white text-md px-3 py-1 rounded hover:bg-emerald-600 w-1/2 disabled:opacity-50 hover:cursor-pointer ${
        !podeEditar ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <SquarePen size={16} />
      Editar
    </button>
  );
}
