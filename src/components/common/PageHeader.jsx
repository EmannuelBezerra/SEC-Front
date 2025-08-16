import {
  Search,
  Plus,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

export default function PageHeader({
  title,
  searchPlaceholder = "Buscar...",
  onSearch,
  mainAction,
  onMainAction,
  showFilter = true,
  showSort = true,
  onFilter,
  onSort,
}) {
  const [searchType, setSearchType] = useState("nome"); // nome | id
  const [searchValue, setSearchValue] = useState("");

  const handleSearchClick = () => {
    if (onSearch && searchValue.trim() !== "") {
      onSearch(searchValue.trim(), searchType);
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <h2 className="text-2xl font-semibold">{title}</h2>

      <div className="flex flex-col w-1/2 gap-4">
        <div className="relative flex items-center gap-2">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="border border-gray-300 text-sm rounded-md px-2 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="nome">Nome</option>
            <option value="id">ID</option>
          </select>

          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => {
              const value = e.target.value;
              setSearchValue(value);
              if (value.trim() === "" && onSearch) {
                onSearch("", searchType);
              }
            }}
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md bg-white text-sm placeholder-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600"
          />

          <button onClick={handleSearchClick} className="absolute right-3">
            <Search className="text-gray-600" size={18} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {mainAction && (
            <button
              onClick={onMainAction}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 hover:cursor-pointer text-white px-4 py-2 rounded-full text-sm"
            >
              <Plus size={16} />
              {mainAction}
            </button>
          )}

          {showFilter && (
            <button
              onClick={onFilter}
              className="flex items-center gap-1 px-3 py-2 rounded-full text-sm hover:bg-gray-100 text-gray-700 border border-gray-300"
            >
              <SlidersHorizontal size={16} />
              Filtrar
            </button>
          )}

          {showSort && (
            <button
              onClick={onSort}
              className="flex items-center gap-1 px-3 py-2 rounded-full text-sm hover:bg-gray-100 text-gray-700 border border-gray-300"
            >
              Ordenar <ChevronDown size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
