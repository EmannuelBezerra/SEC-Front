import { useEffect, useState, useCallback, useMemo } from "react";
import { Trash2, Info, X } from "lucide-react";
import ListContainer from "../ListContainer";
import useStockAPI from "../../../hooks/useStockAPI";
import useRevenuesAPI from "../../../hooks/useRevenuesAPI";
import convertToBase from "../../../utils/convertToBase";

const unidadesEnum = ["mg", "g", "kg", "ml", "l", "un"];

const unidadesCompatíveis = (unidadeBase) => {
  switch (unidadeBase) {
    case "l":
      return unidadesEnum.filter((u) => u === "l" || u === "ml");
    case "ml":
      return unidadesEnum.filter((u) => u === "ml" || u === "l");
    case "kg":
      return unidadesEnum.filter((u) => u === "kg" || u === "g" || u === "mg");
    case "g":
      return unidadesEnum.filter((u) => u === "g" || u === "mg" || u === "kg");
    case "mg":
      return unidadesEnum.filter((u) => u === "mg" || u === "g" || u === "kg");
    case "un":
      return ["un"];
    default:
      return [unidadeBase];
  }
};

export default function IngredientSelectorModal({
  isOpen,
  onClose,
  selecionados,
  idReceita = null,
  onSaveIngredients,
}) {
  const { buscarTodos: getAvailableStockIngredients } = useStockAPI();
  const {
    addIngredientToRecipe,
    updateRecipeIngredient,
    deleteRecipeIngredient,
  } = useRevenuesAPI();

  const [ingredientesEmEstoque, setIngredientesEmEstoque] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ingredientesEmPreparacao, setIngredientesEmPreparacao] = useState([]);
  const [quantidadesLocais, setQuantidadesLocais] = useState({});
  const [unidadesLocais, setUnidadesLocais] = useState({});
  const [loadingIngredients, setLoadingIngredients] = useState(true);

  // Busca ingredientes em estoque quando modal abrir
  useEffect(() => {
    const fetchIngredients = async () => {
      setLoadingIngredients(true);
      try {
        const data = await getAvailableStockIngredients();
        setIngredientesEmEstoque(data);
      } catch (error) {
        console.error("Erro ao buscar ingredientes em estoque:", error);
      } finally {
        setLoadingIngredients(false);
      }
    };

    if (isOpen) {
      fetchIngredients();
    }
  }, [isOpen, getAvailableStockIngredients]);

  // Inicializa ingredientes selecionados APENAS quando estoque estiver carregado
  useEffect(() => {
    if (isOpen && !loadingIngredients && ingredientesEmEstoque.length > 0) {
      const initialSelected = selecionados.map((ing) => {
        const encontrado = ingredientesEmEstoque.find(
          (estoqueIng) => estoqueIng.id === ing.id
        );
        return {
          ...ing,
          unidade: ing.unidade || encontrado?.unidadeMedida || "un",
          precoCusto: ing.preco || encontrado?.precoCusto || 0,
          unidades: ing.unidades || encontrado?.unidades,
        };
      });

      setIngredientesEmPreparacao(initialSelected);

      const initialQuantities = {};
      const initialUnits = {};
      initialSelected.forEach((i) => {
        initialQuantities[i.id] = Number(i.quantidadeUsada) || 0;
        initialUnits[i.id] =
          i.unidade || i.unidadeOriginal || i.unidadeMedida || "un";
      });

      setQuantidadesLocais(initialQuantities);
      setUnidadesLocais(initialUnits);
      setSearchTerm("");
    }
  }, [isOpen, selecionados, ingredientesEmEstoque, loadingIngredients]);

  const filteredIngredientesEmEstoque = ingredientesEmEstoque.filter(
    (ingrediente) => {
      const matchesSearch = ingrediente.nome
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const isInPreparation = Object.prototype.hasOwnProperty.call(
        quantidadesLocais,
        ingrediente.id
      );
      const isAlreadyAdded = ingredientesEmPreparacao.some(
        (i) => i.id === ingrediente.id
      );
      return matchesSearch && (!isAlreadyAdded || isInPreparation);
    }
  );

  const toggleIngredienteParaPreparacao = (ingrediente) => {
    const existeNoTemporario = Object.prototype.hasOwnProperty.call(
      quantidadesLocais,
      ingrediente.id
    );

    if (existeNoTemporario) {
      setQuantidadesLocais((prev) => {
        const novo = { ...prev };
        delete novo[ingrediente.id];
        return novo;
      });
      setUnidadesLocais((prev) => {
        const novo = { ...prev };
        delete novo[ingrediente.id];
        return novo;
      });
      setIngredientesEmPreparacao((prev) =>
        prev.filter((i) => i.id !== ingrediente.id)
      );
    } else {
      setQuantidadesLocais((prev) => ({ ...prev, [ingrediente.id]: 0 }));
      setUnidadesLocais((prev) => ({
        ...prev,
        [ingrediente.id]: ingrediente.unidadeMedida,
      }));
    }
  };

  const ajustarQuantidade = useCallback((id, novaQtd) => {
    const valor = Math.max(Number(novaQtd), 0);
    setQuantidadesLocais((prev) => ({ ...prev, [id]: valor }));
  }, []);

  const ajustarUnidade = useCallback((id, unidade) => {
    setUnidadesLocais((prev) => ({ ...prev, [id]: unidade }));
  }, []);

  const estoqueMap = useMemo(() => {
    const map = {};
    ingredientesEmEstoque.forEach((item) => {
      map[item.id] = item;
    });
    return map;
  }, [ingredientesEmEstoque]);

  const adicionarIngredienteAoEmPreparacao = useCallback(
    async (ingrediente) => {
      const qtd = quantidadesLocais[ingrediente.id];
      const unidade =
        unidadesLocais[ingrediente.id] || ingrediente.unidadeMedida;
      if (!qtd || qtd <= 0) {
        alert("A quantidade deve ser maior que 0 para adicionar.");
        return;
      }
      if (!idReceita) {
        const novoIngredienteAdicionado = {
          id: ingrediente.id,
          nome: ingrediente.nome,
          precoCusto: ingrediente.precoCusto,
          unidade: unidade,
          quantidadeUsada: Number(qtd),
          unidades: estoqueMap[ingrediente.id]?.unidades || 1, // quantidade em estoque
          pesoPorUnidade: estoqueMap[ingrediente.id]?.pesoPorUnidade || 1, // peso/volume por unidade
          unidadeDeMedida:
            ingrediente.unidadeDeMedida || ingrediente.unidade || "un",
        };

        setIngredientesEmPreparacao((prev) => {
          const index = prev.findIndex((i) => i.id === ingrediente.id);
          if (index > -1) {
            const newArray = [...prev];
            newArray[index] = novoIngredienteAdicionado;
            return newArray;
          } else {
            return [...prev, novoIngredienteAdicionado];
          }
        });
        return;
      }

      // Se for uma receita EXISTENTE (modo de EDIÇÃO), chama a API
      const dadosParaAPI = {
        quantidadeUsada: Number(qtd),
        unidadeMedidaUsada: unidade,
      };

      const existeNaListaFinal = ingredientesEmPreparacao.some(
        (i) => i.id === ingrediente.id
      );

      let resultado;
      if (existeNaListaFinal) {
        resultado = await updateRecipeIngredient(
          idReceita,
          ingrediente.id,
          dadosParaAPI
        );
      } else {
        resultado = await addIngredientToRecipe(idReceita, {
          idIngrediente: ingrediente.id,
          ...dadosParaAPI,
        });
      }

      if (resultado.sucesso) {
        const novoIngredienteAdicionado = {
          id: ingrediente.id,
          nome: ingrediente.nome,
          precoCusto: ingrediente.precoCusto,
          unidade: unidade,
          quantidadeUsada: String(qtd),
          unidadeDeMedida: ingrediente.unidadeMedida,
        };
        setIngredientesEmPreparacao((prev) => {
          const index = prev.findIndex((i) => i.id === ingrediente.id);
          if (index > -1) {
            const newArray = [...prev];
            newArray[index] = novoIngredienteAdicionado;
            return newArray;
          } else {
            return [...prev, novoIngredienteAdicionado];
          }
        });
      } else {
        alert(`Erro na operação: ${resultado.mensagem}`);
      }
    },
    [
      quantidadesLocais,
      unidadesLocais,
      ingredientesEmPreparacao,
      idReceita,
      addIngredientToRecipe,
      updateRecipeIngredient,
      estoqueMap
    ]
  );

  const excluirIngredienteDaLista = useCallback(
    async (id) => {
      if (!idReceita) {
        // Se não há idReceita, apenas remove do estado local
        setIngredientesEmPreparacao((prev) => prev.filter((i) => i.id !== id));
        setQuantidadesLocais((prev) => {
          const novo = { ...prev };
          delete novo[id];
          return novo;
        });
        setUnidadesLocais((prev) => {
          const novo = { ...prev };
          delete novo[id];
          return novo;
        });
        return;
      }

      const confirmacao = window.confirm(
        "Tem certeza que deseja remover este ingrediente?"
      );
      if (!confirmacao) return;

      const deleteResult = await deleteRecipeIngredient(idReceita, id);
      if (deleteResult.sucesso) {
        setIngredientesEmPreparacao((prev) => prev.filter((i) => i.id !== id));
        setQuantidadesLocais((prev) => {
          const novo = { ...prev };
          delete novo[id];
          return novo;
        });
        setUnidadesLocais((prev) => {
          const novo = { ...prev };
          delete novo[id];
          return novo;
        });
      } else {
        alert(`Erro ao remover ingrediente: ${deleteResult.mensagem}`);
      }
    },
    [idReceita, deleteRecipeIngredient]
  );

  const handleCloseAndSave = () => {
    if (onSaveIngredients) {
      const finalIngredientsList = ingredientesEmPreparacao.map((ing) => {
        const unidadeFinal =
          unidadesLocais[ing.id] || ing.unidadeMedida || "un";
        const quantidadeFinal = String(quantidadesLocais[ing.id] || 0);

        return {
          id: ing.id,
          nome: ing.nome,
          precoCusto: ing.precoCusto,
          unidade: unidadeFinal,
          quantidadeUsada: quantidadeFinal,
          unidadeDeMedida: ing.unidadeMedida,
        };
      });
      onSaveIngredients(finalIngredientsList);
    }
    onClose();
  };

  const handleConfirmar = () => {
    if (onSaveIngredients) {
      const finalIngredientsList = ingredientesEmPreparacao.map((ing) => {
        const unidadeFinal =
          unidadesLocais[ing.id] || ing.unidadeMedida || "un";
        const quantidadeFinal = String(quantidadesLocais[ing.id] || 0);
        console.log("eee", ing)
        return {
          id: ing.id,
          nome: ing.nome,
          precoCusto: ing.precoCusto,
          unidade: unidadeFinal,
          quantidadeUsada: quantidadeFinal,
          unidadeDeMedida: ing.unidadeMedida,
          unidades: ing.unidades   

        };
      });
      onSaveIngredients(finalIngredientsList);
    }
    onClose();
  };
  

  if (!isOpen) return null;

  console.log("PREÇO DO INGREDIENTEEEE", ingredientesEmPreparacao);
  //console.log("Ingredientes", ingredientesEmEstoque);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white w-[520px] max-h-[90vh] rounded-xl p-6 shadow-lg relative flex flex-col">
          <button
            onClick={handleCloseAndSave}
            className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
            type="button"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-bold mb-4">
            Lista de ingredientes da Receita
          </h2>

          <input
            type="text"
            placeholder="Buscar Ingrediente"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
          />

          <p className="text-sm font-bold mb-2">Ingredientes em estoque: </p>
          <ListContainer height="h-[250px]" className="mb-6">
            {loadingIngredients ? (
              <p className="text-center text-gray-500">
                Carregando ingredientes...
              </p>
            ) : filteredIngredientesEmEstoque.length === 0 ? (
              <p className="text-center text-gray-500">
                Nenhum ingrediente encontrado ou disponível.
              </p>
            ) : (
              filteredIngredientesEmEstoque.map((ingrediente) => {
                const emPreparacao = Object.prototype.hasOwnProperty.call(
                  quantidadesLocais,
                  ingrediente.id
                );
                const jaAdicionadoNaListaFinal = ingredientesEmPreparacao.some(
                  (i) => i.id === ingrediente.id
                );
                const isDisabled = ingrediente.estoque <= 0;

                return (
                  <div
                    key={ingrediente.id}
                    className={`flex flex-col border rounded px-3 py-2 mb-2 ${
                      isDisabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-3 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={isDisabled}
                          checked={emPreparacao}
                          onChange={() =>
                            toggleIngredienteParaPreparacao(ingrediente)
                          }
                          className="cursor-pointer"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {ingrediente.nome}
                          </span>
                          <span className="text-gray-400 text-xs">
                            Estoque:{" "}
                            {ingrediente.pesoPorUnidade != null
                              ? ingrediente.unidades *
                                ingrediente.pesoPorUnidade
                              : ingrediente.unidades}{" "}
                            {ingrediente.unidadeMedida} — Preço: R${" "}
                            {ingrediente.precoCusto &&
                            estoqueMap[ingrediente.id]?.unidades > 0
                              ? (() => {
                                  const qtdUsada = parseFloat(
                                    quantidadesLocais[ingrediente.id] || 0
                                  );
                                  const unidadeUsada =
                                    unidadesLocais[ingrediente.id] ||
                                    ingrediente.unidade;

                                  const pesoPorUnidade = parseFloat(
                                    estoqueMap[ingrediente.id].pesoPorUnidade ||
                                      1
                                  );
                                  const unidadesEstoque = parseFloat(
                                    estoqueMap[ingrediente.id].unidades || 1
                                  );
                                  const unidadeEstoque =
                                    estoqueMap[ingrediente.id].unidadeMedida;

                                  // Converte a quantidade usada para a unidade do estoque
                                  const qtdConvertida =
                                    convertToBase(
                                      qtdUsada,
                                      unidadeUsada,
                                      unidadeEstoque
                                    ) / pesoPorUnidade;

                                  const precoTotal =
                                    (estoqueMap[ingrediente.id].precoCusto /
                                      unidadesEstoque) *
                                    qtdConvertida;

                                  return precoTotal
                                    .toFixed(2)
                                    .toLocaleString("pt-BR", {
                                      style: "currency",
                                      currency: "BRL",
                                    });
                                })()
                              : "R$ 0,00"}
                          </span>
                        </div>
                      </label>

                      {jaAdicionadoNaListaFinal && (
                        <span className="text-green-600 text-xs font-semibold">
                          Adicionado
                        </span>
                      )}
                    </div>
                    {/* Renderiza os inputs de quantidade e unidade apenas se o ingrediente estiver "em preparação" */}{" "}
                    {emPreparacao && (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          step={0.1}
                          className="w-20 p-1 border rounded text-center text-sm"
                          value={quantidadesLocais[ingrediente.id] || ""}
                          onChange={(e) =>
                            ajustarQuantidade(ingrediente.id, e.target.value)
                          }
                        />

                        <select
                          className="border rounded p-1 text-xs"
                          value={
                            unidadesLocais[ingrediente.id] ||
                            ingrediente.unidadeMedida
                          }
                          onChange={(e) =>
                            ajustarUnidade(ingrediente.id, e.target.value)
                          }
                        >
                          {unidadesCompatíveis(ingrediente.unidadeMedida).map(
                            (u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            )
                          )}
                        </select>

                        <button
                          onClick={() =>
                            adicionarIngredienteAoEmPreparacao(ingrediente)
                          }
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm disabled:opacity-50"
                          type="button"
                          disabled={
                            !quantidadesLocais[ingrediente.id] ||
                            quantidadesLocais[ingrediente.id] <= 0
                          }
                        >
                          {jaAdicionadoNaListaFinal ? "Atualizar" : "Adicionar"}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </ListContainer>

          {ingredientesEmPreparacao.length > 0 && (
            <>
              <h3 className="text-sm font-bold mb-6">
                Ingredientes selecionados ({ingredientesEmPreparacao.length})
              </h3>
              <ListContainer height="h-[180px]">
                {ingredientesEmPreparacao.map((ingrediente) => (
                  <div
                    key={ingrediente.id}
                    className="flex items-center justify-between border p-2 rounded mb-1"
                  >
                    <div>
                      <p className="font-medium">{ingrediente.nome}</p>
                      <p className="text-xs text-gray-500">
                        Qtd: {quantidadesLocais[ingrediente.id] || 0}
                        {unidadesLocais[ingrediente.id] || ingrediente.unidade}—
                        Preço: R${" "}
                        {ingrediente.precoCusto &&
                        estoqueMap[ingrediente.id]?.unidades > 0
                          ? (() => {
                              const qtdUsada = parseFloat(
                                quantidadesLocais[ingrediente.id] || 0
                              );
                              const unidadeUsada =
                                unidadesLocais[ingrediente.id] ||
                                ingrediente.unidade;
                              const ingredienteEstoque =
                                estoqueMap[ingrediente.id];

                              const pesoPorUnidade = parseFloat(
                                ingredienteEstoque.pesoPorUnidade || 1
                              );
                              const unidadesEstoque = parseFloat(
                                ingredienteEstoque.unidades || 1
                              );
                              const unidadeEstoque =
                                ingredienteEstoque.unidadeMedida || "un";

                              const qtdConvertida =
                                convertToBase(
                                  qtdUsada,
                                  unidadeUsada,
                                  unidadeEstoque
                                ) / pesoPorUnidade;

                              const precoTotal =
                                (ingredienteEstoque.precoCusto /
                                  unidadesEstoque) *
                                qtdConvertida;

                              return precoTotal
                                .toFixed(2)
                                .toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                });
                            })()
                          : "R$ 0,00"}
                      </p>
                    </div>
                    <button
                      onClick={() => excluirIngredienteDaLista(ingrediente.id)}
                      className="text-red-500 hover:text-red-700"
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </ListContainer>
            </>
          )}

          <div className="flex justify-between mt-auto pt-4 border-t border-gray-200">
            <button
              onClick={handleCloseAndSave}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              type="button"
            >
              VOLTAR
            </button>

            <div className="flex gap-2">
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
      </div>
    </>
  );
}
