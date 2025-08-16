export default function normalizarReceita(apiReceita) {
  return {
    id: apiReceita.id || crypto.randomUUID(), // garante ID único
    nome: apiReceita.nome || "",
    rendimento: apiReceita.rendimento || "0", // string no schema
    modoDePreparo: apiReceita.modoDePreparo || "",
    custoDeProducao: typeof apiReceita.custoDeProducao === "number"
      ? apiReceita.custoDeProducao
      : 0.0, // previne erro no toFixed()
    ingredientes: Array.isArray(apiReceita.ingredientes)
      ? apiReceita.ingredientes
      : [],
    pedidoReceitas: Array.isArray(apiReceita.pedidoReceitas)
      ? apiReceita.pedidoReceitas
      : []
  };
}
