import { ScanEye } from "lucide-react";

export default function DetailsButton({ onClick }) {
  return (
    <button
      className="flex w-full justify-center gap-1 items-center bg-green-600 text-white text-md px-3 py-1 rounded hover:bg-green-700 hover:cursor-pointer"
      onClick={onClick}
    >
      Ver mais detalhes
      <ScanEye size={20}/>
    </button>
  );
}
