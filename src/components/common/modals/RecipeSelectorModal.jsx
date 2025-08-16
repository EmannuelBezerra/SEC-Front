import { useEffect, useState, useCallback} from "react";
import { X, Trash2, Info } from "lucide-react";
import ListContainer from "../ListContainer";
import DetalhesRevenueModal from "./DetalhesRevenueModal";
import useRevenuesAPI from "../../../hooks/useRevenuesAPI";

export default function RecipeSelectorModal({
  isOpen,
  onClose,
  selecionadas,
  onUpdate,
}) {
  const { getRecipes } = useRevenuesAPI();

  const [receitasDisponiveis, setReceitasDisponiveis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [filtroNome, setFiltroNome] = useState("");

  const [selecionadasInternas, setSelecionadasInternas] = useState([]);
  const [quantidades, setQuantidades] = useState({});
  const [quantidadeInvalida, setQuantidadeInvalida] = useState({});

  const [abrirDetalhes, setAbrirDetalhes] = useState(false);
  const [receitaSelecionada, setReceitaSelecionada] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSelecionadasInternas(selecionadas);
      const novaQtd = {};
      const erros = {};
      selecionadas.forEach((r) => {
        const qtd = r.quantidade || 1;
        novaQtd[r.id] = qtd;
        erros[r.id] = qtd < 1;
      });
      setQuantidades(novaQtd);
      setQuantidadeInvalida(erros);
      setFiltroNome(""); // limpa filtro
    }
  }, [isOpen, selecionadas]);

  const carregarReceitas = useCallback(() => {
    if (!isOpen) return;

    setLoading(true);
    setErro(null);

    getRecipes(filtroNome)
      .then((resposta) => {
        if (resposta.sucesso) {
          setReceitasDisponiveis(resposta.recipes);
        } else {
          setReceitasDisponiveis([]);
          setErro(resposta.mensagem);
        }
      })
      .catch(() => {
        setReceitasDisponiveis([]);
        setErro("Erro inesperado ao carregar receitas.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filtroNome, isOpen, getRecipes]);

  useEffect(() => {
    carregarReceitas();
  }, [carregarReceitas]);

  const toggleReceita = (receita) => {
    const existe = selecionadasInternas.find((r) => r.id === receita.id);
    if (existe) {
      setSelecionadasInternas((prev) =>
        prev.filter((r) => r.id !== receita.id)
      );
      setQuantidades((prev) => {
        const novo = { ...prev };
        delete novo[receita.id];
        return novo;
      });
      setQuantidadeInvalida((prev) => {
        const novo = { ...prev };
        delete novo[receita.id];
        return novo;
      });
    } else {
      setSelecionadasInternas((prev) => [...prev, receita]);
      setQuantidades((prev) => ({ ...prev, [receita.id]: 1 }));
      setQuantidadeInvalida((prev) => ({ ...prev, [receita.id]: false }));
    }
  };

  const ajustarQuantidade = (id, novaQtd) => {
    const valor = Number(novaQtd);
    setQuantidades((prev) => ({ ...prev, [id]: valor }));
    setQuantidadeInvalida((prev) => ({
      ...prev,
      [id]: isNaN(valor) || valor < 1,
    }));
  };

  const excluirReceita = (id) => {
    setSelecionadasInternas((prev) => prev.filter((r) => r.id !== id));
    setQuantidades((prev) => {
      const novo = { ...prev };
      delete novo[id];
      return novo;
    });
    setQuantidadeInvalida((prev) => {
      const novo = { ...prev };
      delete novo[id];
      return novo;
    });
  };

  const handleConfirmar = () => {
    const erros = {};
    let temErro = false;

    selecionadasInternas.forEach((r) => {
      const qtd = quantidades[r.id];
      if (!qtd || qtd < 1) {
        erros[r.id] = true;
        temErro = true;
      }
    });

    if (temErro) {
      setQuantidadeInvalida(erros);
      return;
    }

    const resultado = selecionadasInternas.map((receita) => ({
      ...receita,
      quantidade: quantidades[receita.id] || 1,
    }));
    onUpdate(resultado);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/5 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white w-[540px] max-h-[90vh] rounded-xl p-6 shadow-lg relative flex flex-col">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
            type="button"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-bold mb-4">
            Selecione as Receitas do Pedido
          </h2>

          <input
            type="text"
            placeholder="Buscar Receita"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
          />
          {loading ? (
            <div className="text-center py-8">Carregando receitas...</div>
          ) : erro ? (
            <div className="text-center text-red-500 py-8">{erro}</div>
          ) : (
          <ListContainer height="h-[260px]" className="mb-4">
            {receitasDisponiveis.map((receita) => {
              const selecionado = selecionadasInternas.some(
                (r) => r.id === receita.id
              );
              return (
                <div
                  key={receita.id}
                  className="flex items-center justify-between border rounded px-3 py-2 mb-1"
                >
                  <label className="flex items-center gap-3 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selecionado}
                      onChange={() => toggleReceita(receita)}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{receita.nome}</span>
                      <span className="text-gray-400 text-xs">
                        Rendimento: {receita.rendimento} — Custo R$ {(receita.custoDeProducao ?? 0).toFixed(2)}

                      </span>
                    </div>
                  </label>

                  {selecionado && (
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-center">
                        <input
                          type="number"
                          min={1}
                          value={quantidades[receita.id] || ""}
                          onChange={(e) =>
                            ajustarQuantidade(receita.id, e.target.value)
                          }
                          className={`w-16 p-1 border rounded text-center text-sm outline-none transition
                            ${
                              quantidadeInvalida[receita.id]
                                ? "border-red-500 focus:ring-red-300"
                                : "border-green-600 focus:ring-green-300 focus:outline-green-600"
                            }`}
                        />
                        {quantidadeInvalida[receita.id] && (
                          <span className="text-red-500 text-xs mt-1">
                            Quantidade inválida
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setReceitaSelecionada(receita);
                          setAbrirDetalhes(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        type="button"
                      >
                        <Info size={16} />
                      </button>
                      <button
                        onClick={() => excluirReceita(receita.id)}
                        className="text-red-500 hover:text-red-700"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </ListContainer>
          )}

          <div className="flex justify-between mt-auto pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              type="button"
            >
              VOLTAR
            </button>

            <button
              onClick={handleConfirmar}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              type="button"
            >
              CONCLUIR
            </button>
          </div>
        </div>
      </div>

      {receitaSelecionada && (
        <DetalhesRevenueModal
          isOpen={abrirDetalhes}
          onClose={() => setAbrirDetalhes(false)}
          receita={receitaSelecionada}  
        />
      )}
    </>
  );
}
