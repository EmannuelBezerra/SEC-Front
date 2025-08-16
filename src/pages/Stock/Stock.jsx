//no stock
import { useState, useEffect } from "react";
import PageHeader from "../../components/common/PageHeader";
import ProdutoModal from "../../components/common/modals/ProdutoModal";
import ProductItem from "../../components/common/products/ProductItem";
import ListContainer from "../../components/common/ListContainer";
import ConfirmacaoModal from "../../components/common/modals/ConfirmarExclusãoModal";
import DetalhesProdutoModal from "../../components/common/modals/DetalhesProdutoModal";

import useStockAPI from "../../hooks/useStockAPI";
import ResultSearchContainer from "../../components/common/ResultSearchContainer";
import FeedbackSearch from "../../components/common/FeedbackSearch";

export default function Stock() {
  const {
    buscarTodos,
    buscarPorNome,
    buscarPorId,
    cadastrarIngrediente,
    editarIngrediente,
    verificarUsoIngrediente,
    deletarIngrediente,
  } = useStockAPI();

  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);

  const [produtoParaDeletar, setProdutoParaDeletar] = useState(null);
  const [confirmarDelecao, setConfirmarDelecao] = useState(false);
  const [errorDeleteMsg, setErrorDeleteMsg] = useState("");

  const [produtoDetalhado, setProdutoDetalhado] = useState(null);
  const [showResultadoBusca, setShowResultadoBusca] = useState(false);
  const [apiErrorMsg, setApiErrorMsg] = useState("");

  const perfil =
    JSON.parse(localStorage.getItem("user"))?.perfil || "FUNCIONARIO_COMUM";
  const podeCadastrar =
    perfil === "SUPERVISOR_JUNIOR" || perfil === "SUPERVISOR_SENIOR";
  const modoSomenteQuantidade = perfil === "FUNCIONARIO_COMUM";

  const [mensagemConfirmacao, setMensagemConfirmacao] = useState(""); // para mostrar mensagens da API
  const [forceDeletePending, setForceDeletePending] = useState(false); // indica se é uma segunda chamada

  useEffect(() => {
    async function fetchProdutos() {
      setLoading(true);
      setError(null);
      setShowResultadoBusca(false);
      try {
        const dados = await buscarTodos();
        setProdutos(Array.isArray(dados) ? dados : []);
      } catch (err) {
        console.error("Erro ao buscar produtos:", err);
        setError("Não foi possível carregar os produtos.");
      } finally {
        setLoading(false);
      }
    }
    fetchProdutos();
  }, [buscarTodos]);

  useEffect(() => {
    if (!showModal) {
      setProdutoEmEdicao(null);
    }
  }, [showModal]);

  const handleViewDetails = (produto) => {
    setProdutoDetalhado(produto);
  };

  const handleSearch = async (value, tipo) => {
    const termo = value?.trim();
    if (!termo) {
      setLoading(true);
      setError(null);
      setShowResultadoBusca(false);
      try {
        const todos = await buscarTodos();
        setProdutos(Array.isArray(todos) ? todos : []);
      } catch (err) {
        console.error("Erro ao buscar todos:", err);
        setError("Erro ao buscar todos os produtos.");
        setProdutos([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);
    setShowResultadoBusca(false);

    try {
      let resultado;
      if (tipo === "nome") {
        resultado = await buscarPorNome(termo);
        setProdutos(Array.isArray(resultado) ? resultado : []);
      } else if (tipo === "id") {
        const produto = await buscarPorId(termo);
        setProdutos(produto ? [produto] : []);
      }
      setShowResultadoBusca(true);
    } catch (err) {
      console.error("Erro na busca:", err);
      setError(err.response?.data?.msg || "Erro ao buscar produto.");
      setProdutos([]);
      setShowResultadoBusca(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    if (!podeCadastrar) return;
    setProdutoEmEdicao(null);
    setShowModal(true);
  };

  const [checkingUso, setCheckingUso] = useState(false); // previne chamadas concorrentes

  const handleEditProduct = async (id) => {
    if (checkingUso) return;
    const produto = produtos.find((p) => p.id === id);
    if (!produto) return;

    setCheckingUso(true);
    try {
      const resultado = await verificarUsoIngrediente(produto.id);
      console.log("Resultado verificarUsoIngrediente:", resultado);

      const dadosParaModal = {
        ...produto,
        podeEditar: resultado?.sucesso ? resultado.podeEditar : true,
        receitas: resultado?.receitas || [],
      };

      setProdutoEmEdicao(dadosParaModal);
      setShowModal(true);
    } catch (erro) {
      console.error("Erro ao verificar uso:", erro);
      setProdutoEmEdicao({ ...produto, podeEditar: true, receitas: [] });
      setShowModal(true);
    } finally {
      setCheckingUso(false);
    }
  };

  const handleDeleteProduct = async (index) => {
    if (perfil !== "SUPERVISOR_SENIOR") return;

    const produto = produtos[index];
    setProdutoParaDeletar(produto);
    setErrorDeleteMsg("");
    setMensagemConfirmacao("");
    setForceDeletePending(false);

    const resultado = await deletarIngrediente(produto.id, false);

    if (resultado.sucesso) {
      if (resultado.acao === "deleted_direct") {
        setProdutos((prev) => prev.filter((p) => p.id !== produto.id));
      } else {
        setMensagemConfirmacao(resultado.mensagem);
        setConfirmarDelecao(true);
        setForceDeletePending(true);
      }
    } else {
      setErrorDeleteMsg(resultado.mensagem || "Erro ao iniciar exclusão.");
    }
  };

  const handleConfirmarDelete = async () => {
    if (!produtoParaDeletar) return;

    try {
      const resultado = await deletarIngrediente(
        produtoParaDeletar.id,
        forceDeletePending
      );

      if (resultado.sucesso) {
        setProdutos((prev) =>
          prev.filter((p) => p.id !== produtoParaDeletar.id)
        );
        setConfirmarDelecao(false);
        setProdutoParaDeletar(null);
        setForceDeletePending(false);
        setMensagemConfirmacao("");
      } else {
        setErrorDeleteMsg(resultado.mensagem || "Erro ao deletar ingrediente.");
      }
    } catch (err) {
      setErrorDeleteMsg("Erro inesperado ao deletar o ingrediente.");
      console.error("Erro ao confirmar exclusão:", err);
    }
  };

  const handleSubmitProduto = async (produto) => {
    setApiErrorMsg("");

    const categoriaFinal =
      produto.categoria === "OUTRO"
        ? produto.outraCategoria?.trim() || ""
        : produto.categoria;

    const unidade = produto.unidade?.toLowerCase();
    const peso = produto.pesoVolume?.toString().trim();

    const pesoPorUnidade =
      unidade === "un" ? null : Number(peso) > 0 ? Number(peso) : undefined;

    const produtoFormatado = {
      nome: produto.nome,
      unidades: Number(produto.unidades),
      pesoPorUnidade: pesoPorUnidade,
      unidadeMedida: unidade,
      validade: produto.perecivel ? produto.validade : null,
      nivelMinimo: Number(produto.nivelMinimo),
      precoCusto: Number(produto.precoCusto),
      categoria: categoriaFinal,
    };

    let resultado;

    if (produtoEmEdicao !== null) {
      const idDoProduto = produtoEmEdicao.id;

      resultado = await editarIngrediente(idDoProduto, produtoFormatado);

      if (resultado.sucesso) {
        setProdutos((prevProdutos) => {
          const novosProdutos = [...prevProdutos];
          const index = novosProdutos.findIndex((p) => p.id === idDoProduto);

          if (index !== -1) {
            const produtoAntigo = novosProdutos[index];

            novosProdutos[index] = {
              ...produtoAntigo,
              ...produtoFormatado,
            };
          }

          return novosProdutos;
        });

        setProdutoEmEdicao(null);
        setShowModal(false);
      }
    } else {
      resultado = await cadastrarIngrediente(produtoFormatado);

      if (resultado.sucesso) {
        const novoProduto = resultado.produto || {
          ...produtoFormatado,
          id: Date.now().toString(),
        };

        setProdutos((prev) => [...prev, novoProduto]);
        setShowModal(false);
      }
    }

    if (!resultado.sucesso) {
      throw new Error(resultado.mensagem || "Erro ao salvar produto.");
    }
  };

  return (
    <div className="flex flex-col p-4 h-screen">
      <PageHeader
        title="Estoque"
        searchPlaceholder="Digite o id ou nome do produto para encontrá-lo..."
        onSearch={handleSearch}
        mainAction="Adicionar novo produto"
        onMainAction={handleAddProduct}
        showFilter
        showSort
      />

      <ProdutoModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setApiErrorMsg("");
        }}
        onSubmit={handleSubmitProduto}
        initialData={produtoEmEdicao}
        modoSomenteQuantidade={
          modoSomenteQuantidade && produtoEmEdicao !== null
        }
        apiErrorMsg={apiErrorMsg}
      />

      {showResultadoBusca && (
        <ResultSearchContainer>
          {loading ? (
            <div className="p-2 text-gray-700">Carregando produtos...</div>
          ) : (
            <FeedbackSearch itens={produtos} error={error} />
          )}
        </ResultSearchContainer>
      )}

      <ListContainer height="100">
        {produtos.length > 0 ? (
          produtos.map((p, i) => (
            <ProductItem
              key={p.id}
              product={p}
              onEdit={() => handleEditProduct(p.id)}
              onDelete={() => handleDeleteProduct(i)}
              onDetails={() => handleViewDetails(p)}
            />
          ))
        ) : (
          <p className="p-2 text-gray-700">Nenhum produto encontrado.</p>
        )}
      </ListContainer>

      <ConfirmacaoModal
        isOpen={confirmarDelecao}
        onClose={() => {
          setProdutoParaDeletar(null);
          setConfirmarDelecao(false);
          setErrorDeleteMsg("");
          setMensagemConfirmacao("");
          setForceDeletePending(false);
        }}
        onConfirm={handleConfirmarDelete}
        mensagem={
          mensagemConfirmacao ||
          `Tem certeza que deseja deletar "${produtoParaDeletar?.nome}"?`
        }
        errorMsg={errorDeleteMsg}
      />

      <DetalhesProdutoModal
        isOpen={!!produtoDetalhado}
        onClose={() => setProdutoDetalhado(null)}
        produto={produtoDetalhado}
      />
    </div>
  );
}
