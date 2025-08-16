export default function FeedbackSearch({ itens, error }) {
  if (error) {
    return (
      <div className="text-red-600 bg-red-100 p-2 rounded">
        {error}
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <div className="text-gray-600 bg-gray-100 p-2 rounded">
        Nenhum produto encontrado.
      </div>
    );
  }

  return (
    <div className="text-green-700 bg-green-100 p-2 rounded">
      {itens.length} produto{itens.length > 1 ? "s" : ""} encontrado{itens.length > 1 ? "s" : ""}.
    </div>
  );
}
