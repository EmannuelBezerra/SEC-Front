import { useState, useEffect, useCallback } from "react";
import PageHeader from "../../components/common/PageHeader";
import RevenueItem from "../../components/common/revenue/RevenueItem";
import ListContainer from "../../components/common/ListContainer";
import RecipeModal from "../../components/common/modals/RecipeModal";
import DetalhesRevenueModal from "../../components/common/modals/DetalhesRevenueModal";
import ConfirmarExclusãoModal from "../../components/common/modals/ConfirmarExclusãoModal";
import useRevenuesAPI from "../../hooks/useRevenuesAPI";

import ResultSearchContainer from "../../components/common/ResultSearchContainer";
import FeedbackSearch from "../../components/common/FeedbackSearch";


export default function Revenues() {
  const { checkRecipeUsageForEdit, getRecipes, deleteRecipe } =
    useRevenuesAPI();

  const [ receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Erro para operações de busca/listagem
  const [apiError, setApiError] = useState(null); // Erro para operações de salvar/deletar, exibido em um toast

  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [receitaParaModal, setReceitaParaModal] = useState(null); // Armazena a receita para edição ou null para nova

  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [receitaSelecionada, setReceitaSelecionada] = useState(null);

  const [receitaParaExcluir, setReceitaParaExcluir] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorDeleteMsg, setErrorDeleteMsg] = useState(""); // Erro específico do modal de exclusão

  const [showResultadoBusca, setShowResultadoBusca] = useState(false);

  const [termoBuscaAtual, setTermoBuscaAtual] = useState("");
  const [tipoBuscaAtual, setTipoBuscaAtual] = useState("nome");

  // Dentro do seu componente `Revenues`
  const [isForceDelete, setIsForceDelete] = useState(false);
  const [deleteModalMsg, setDeleteModalMsg] = useState("");
  const [checkingUso, setCheckingUso] = useState(false); // Novo estado

  const fetchReceitas = useCallback(
    async (termoBusca = "") => {
      setLoading(true);
      setError(null); // Limpa erros de busca anteriores
      
      try {
        const response = await getRecipes(termoBusca);
        
        if (response.sucesso) {
          // Formatação para garantir consistência dos dados de ingredientes
          const formattedRecipes = response.recipes.map((recipe) => ({
            ...recipe,
            id: recipe.id,
            custoDeProducao:
              recipe.custoDeProducao || recipe.custo_producao || 0,
            modoDePreparo:
              recipe.modoDePreparo ||
              recipe.modo_preparo ||
              recipe.modoPreparo ||
              "",
            ingredientes: (recipe.ingredientes || recipe.ingredients || []).map(
              (ing) => ({
                id: ing.idIngrediente || ing.id, 
                nome: ing.ingrediente?.nome || ing.nome,
                unidade: ing.ingrediente?.unidadeMedida || ing.unidade,
                preco: ing.ingrediente?.preco || ing.preco,
                quantidadeUsada:
                  ing.qtdUnidade || ing.qtdGramasOuMl || ing.quantidadeUsada, // Adicionado quantidadeUsada
                unidadeUsadaNaReceita:
                  ing.unidade ||
                  ing.ingrediente?.unidadeMedida ||
                  ing.unidadeUsadaNaReceita,
              })
            ),
          }));
          setReceitas(formattedRecipes);
          
        } else {
          setError(response.mensagem || "Erro ao carregar receitas.");
          setReceitas([]); // Limpa a lista em caso de erro
        }
      } catch (err) {
        console.error("Erro ao buscar receitas:", err);
        setError("Falha na comunicação com o servidor ao carregar receitas.");
        setReceitas([]); // Limpa a lista em caso de erro de rede
      } finally {
        setLoading(false);
      }
    },
    [getRecipes]
  );

  useEffect(() => {
    fetchReceitas();
  }, [fetchReceitas]);

  const abrirEditar = async (receita) => {
    if (checkingUso) return;

    setApiError(null); // Limpa o erro anterior, se houver
    setCheckingUso(true); // Bloqueia chamadas concorrentes

    try {
      const resultado = await checkRecipeUsageForEdit(receita.id);

      // Verifique o resultado da API e prepare os dados para o modal
      const dadosParaModal = {
        ...receita,
        podeEditar: resultado.sucesso && !resultado.inUse, // a flag principal
        mensagemErro: resultado.sucesso && resultado.inUse ? resultado.msg : "",
      };

      setReceitaParaModal(dadosParaModal);
      setShowRecipeModal(true);
    } catch (err) {
      console.error("Erro ao verificar uso da receita:", err);
      setApiError(
        "Não foi possível verificar o uso da receita. Tente novamente."
      );
    } finally {
      setCheckingUso(false); // Libera o estado, independentemente do resultado
    }
  };

  const abrirDetalhes = (receita) => {
    setReceitaSelecionada(receita);
    setShowDetalhesModal(true);
  };

  const abrirExcluir = async (receita) => {
    setReceitaParaExcluir(receita);
    setShowDeleteModal(true);
    setErrorDeleteMsg("");
    setIsForceDelete(false); // Sempre comece o processo como uma exclusão normal

    // Exibimos o modal imediatamente com a mensagem padrão
    setDeleteModalMsg(
      `Tem certeza que deseja excluir a receita "${receita.nome}"?`
    );

    try {
      const response = await deleteRecipe(receita.id, false); // Chamada inicial sem forçar a exclusão

      if (response.sucesso) {
        if (response.action === "confirm_force_delete_recipe") {
          // Se o backend pedir confirmação, atualizamos o estado
          // do modal e preparamos a próxima ação
          setDeleteModalMsg(response.mensagem); // A mensagem do backend
          setIsForceDelete(true);
        } else {
          // Se não houver dependências, a exclusão direta foi bem-sucedida.
          // Já podemos fechar o modal e atualizar a lista.
          setReceitas((prev) => prev.filter((r) => r.id !== receita.id));
          setShowDeleteModal(false);
        }
      } else {
        // A API retornou um erro na primeira tentativa
        setDeleteModalMsg(response.mensagem);
      }
    } catch (err) {
      console.error("Erro ao verificar exclusão:", err);
      setDeleteModalMsg(
        "Erro inesperado ao tentar verificar a exclusão da receita."
      );
    }
  };

  const confirmarExclusao = async () => {
    if (!receitaParaExcluir || !isForceDelete) {
      // Se não for uma exclusão forçada, simplesmente retorne ou trate de outra forma
      // A lógica de exclusão direta já foi tratada em 'abrirExcluir'
      return;
    }

    setLoading(true);
    setErrorDeleteMsg("");

    try {
      // Chamada para forçar a exclusão
      const response = await deleteRecipe(receitaParaExcluir.id, true);

      if (response.sucesso) {
        setReceitas((prev) =>
          prev.filter((r) => r.id !== receitaParaExcluir.id)
        );
        console.log("Sucesso:", response.mensagem);
        setShowDeleteModal(false);
        setReceitaParaExcluir(null);
      } else {
        setErrorDeleteMsg(response.mensagem);
      }
    } catch (err) {
      console.error("Erro ao excluir receita:", err);
      setErrorDeleteMsg("Erro inesperado ao excluir receita.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value, tipo) => {
    const termo = value?.trim();

    setTermoBuscaAtual(termo);
    setTipoBuscaAtual(tipo);
    setLoading(true);
    setError(null); // Limpa erros de busca anteriores
    setApiError(null); // Limpa erros gerais da API

    try {
      let response; // Lógica de busca igual ao Stock.jsx: se termo vazio, busca tudo e remove o "resultado da busca" flag
      if (!termo) {
        response = await getRecipes(""); // Busca todas as receitas
        setShowResultadoBusca(false); // Não é mais um resultado de busca, é a lista completa
      } else if (tipo === "nome") {
        response = await getRecipes(termo);
        setShowResultadoBusca(true); // É um resultado de busca por nome
      } else if (tipo === "id") {
        response = await getRecipes(termo); // Sua getRecipes já lida com o termo, mesmo que seja um ID
        setShowResultadoBusca(true); // É um resultado de busca por ID
      }

      if (response.sucesso) {
        const formattedRecipes = (response.recipes || []).map((recipe) => ({
          ...recipe,
          custoDeProducao: recipe.custoDeProducao || recipe.custo_producao || 0,
          modoDePreparo:
            recipe.modoDePreparo ||
            recipe.modo_preparo ||
            recipe.modoPreparo ||
            "",
          ingredientes: (recipe.ingredientes || recipe.ingredients || []).map(
            (ing) => ({
              id: ing.idIngrediente || ing.id,
              nome: ing.ingrediente?.nome || ing.nome,
              unidade: ing.ingrediente?.unidadeMedida || ing.unidade,
              preco: ing.ingrediente?.preco || ing.preco,
              quantidadeUsada:
                ing.qtdUnidade || ing.qtdGramasOuMl || ing.quantidadeUsada,
              unidadeUsadaNaReceita:
                ing.unidade ||
                ing.ingrediente?.unidadeMedida ||
                ing.unidadeUsadaNaReceita,
            })
          ),
        }));
        setReceitas(formattedRecipes);
        console.log("Receitas encontradas:", formattedRecipes);
      } else {
        setError(response.mensagem || "Erro ao buscar receita.");
        setReceitas([]);
      }
    } catch (err) {
      console.error("Erro na busca de receitas:", err);
      setError("Erro inesperado ao buscar receita.");
      setReceitas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRevenue = () => {
    setReceitaParaModal(null); // Limpa para indicar que é uma nova receita
    setShowRecipeModal(true);
  }; 

  const handleRecipeSavedOrUpdated = async (savedRecipe) => {
  if (!savedRecipe) return;

  await fetchReceitas();

  setShowRecipeModal(false);
  setReceitaParaModal(null);
  setApiError(null);
};


  return (
    <div className="flex flex-col p-4 h-screen">
      {" "}
      <PageHeader
        title="Receitas"
        searchPlaceholder="Digite o id ou nome da receita para encontrá-la..."
        onSearch={handleSearch}
        mainAction="Adicionar uma nova receita"
        onMainAction={handleAddRevenue}
        showFilter
        showSort
      />{" "}
      {showResultadoBusca ? (
        <div>
          <ResultSearchContainer>
            <FeedbackSearch
              itens={receitas}
              error={error}
              termo={termoBuscaAtual}
              tipo={tipoBuscaAtual}
            />
          </ResultSearchContainer>

          <ListContainer height="100">
            {loading ? (
              <div key="loading" className="p-2 text-gray-700 text-center">
                Carregando resultados da busca...
              </div>
            ) : receitas.length === 0 ? (
              <p key="empty" className="p-2 text-gray-500 text-center">
                Nenhuma receita encontrada para os critérios de busca.
              </p>
            ) : (
              receitas.map((r, idx) => (
                <RevenueItem
                  key={r.id ?? `temp-${idx}`}
                  receita={r}
                  onView={() => abrirDetalhes(r)}
                  onEdit={() => abrirEditar(r)}
                  onDelete={() => abrirExcluir(r)}
                />
              ))
            )}
          </ListContainer>
        </div>
      ) : (
        <ListContainer height="100">
          {loading ? (
            <div key="loading" className="p-2 text-gray-700 text-center">
              Carregando receitas...
            </div>
          ) : error ? (
            <div key="error" className="p-2 text-red-600 text-center">{error}</div>
          ) : receitas.length === 0 ? (
            <p  key="empty" className="p-2 text-gray-700">Nenhuma receita cadastrada.</p>
          ) : (
            receitas.map((r, idx) => (
              <RevenueItem
                key={r.id ?? `temp-${idx}`}
                receita={r}
                onView={() => abrirDetalhes(r)}
                onEdit={() => abrirEditar(r)}
                onDelete={() => abrirExcluir(r)}
              />
            ))
          )}
        </ListContainer>
      )}
      {apiError && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white p-3 rounded shadow-lg">
          {apiError}{" "}
        </div>
      )}{" "}
      <RecipeModal
        isOpen={showRecipeModal}
        onClose={() => {
          setShowRecipeModal(false);
          setApiError(null);
        }}
        initialRecipeData={receitaParaModal}
        onRecipeSaved={handleRecipeSavedOrUpdated}
      />{" "}
      <DetalhesRevenueModal
        isOpen={showDetalhesModal}
        onClose={() => setReceitaSelecionada(null)}
        receita={receitaSelecionada}
      />{" "}
      <ConfirmarExclusãoModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setReceitaParaExcluir(null);
          setErrorDeleteMsg("");
          setIsForceDelete(false); // Limpa o estado ao fechar
        }}
        onConfirm={confirmarExclusao}
        mensagem={deleteModalMsg} // Usa o estado atual para a mensagem
        errorMsg={errorDeleteMsg}
      />{" "}
    </div>
  );
}
