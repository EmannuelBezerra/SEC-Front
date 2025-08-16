import { useCallback } from "react";
import axios from "axios";

export default function useStockAPI() {
  const getApi = () =>
    axios.create({
      baseURL: "http://localhost:3000/api_confeitaria/super/estoque",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Cache-Control": "no-cache",
      },
    });

  const buscarTodos = useCallback(async () => {
    const resposta = await getApi().get("/");
    return resposta.data.ingredients || [];
  }, []);

  const buscarPorNome = useCallback(async (nome) => {
    const resposta = await getApi().get(`/?nome=${nome}`);
    return resposta.data.ingredients || [];
  }, []);

  const buscarPorId = useCallback(async (id) => {
    const resposta = await getApi().get(`/ingrediente/${id}`);
    return resposta.data.produto || null;
  }, []);

  const cadastrarIngrediente = useCallback(async (dados) => {
    try {
      const resposta = await getApi().post("/", dados);
      return {
        sucesso: true,
        mensagem: resposta.data.msg,
        produto: resposta.data.produto,
      };
    } catch (erro) {
      const mensagemErro =
        erro.response?.data?.msg ||
        erro.response?.data?.error ||
        "Erro ao cadastrar ingrediente.";
      return { sucesso: false, mensagem: mensagemErro };
    }
  }, []);

  const verificarUsoIngrediente = async (id) => {
  try {
    console.log(id);
    const resposta = await getApi().get(`/${id}`);  
    return {
      sucesso: true,
      podeEditar: resposta.data.canEdit,
      mensagem: resposta.data.message,
      receitas: resposta.data.recipes || [],
    };
  } catch (erro) {
    console.error("Erro ao verificar uso do ingrediente:", erro);
    return {
      sucesso: false,
      podeEditar: true,
      mensagem: "Erro ao verificar uso do ingrediente.",
      receitas: [],
    };
  }
};



  const editarIngrediente = useCallback(async (id, dados) => {
    try {
      const resposta = await getApi().put(`/ingrediente/${id}`, dados);
      console.log(id);
      return {
        sucesso: true,
        mensagem: resposta.data.msg,
        ingredient: resposta.data.ingredient,
      };
    } catch (erro) {
      const mensagemErro =
        erro.response?.data?.msg ||
        erro.response?.data?.error ||
        "Erro ao atualizar ingrediente.";
      return { sucesso: false, mensagem: mensagemErro };
    }
  }, []);

  const deletarIngrediente = useCallback(async (id, forceDelete = false) => {
    try {
      const resposta = await getApi().delete(`/ingrediente/${id}`, {
        data: { forceDelete }, // envia o body com forceDelete
      });

      return {
        sucesso: true,
        mensagem: resposta.data.msg,
        acao: resposta.data.action, // pode ser: confirm_force_delete, confirm_simple_delete, deleted_direct, force_deleted_cascading, etc.
        receitasAfetadas: resposta.data.deletedRecipes || [],
        pedidosAfetados: resposta.data.deletedOrders || [],
        receitas: resposta.data.recipes || [],
        pedidos: resposta.data.ordersAffectedCount || 0,
      };
    } catch (erro) {
      const mensagemErro =
        erro.response?.data?.msg ||
        erro.response?.data?.error ||
        "Erro ao deletar ingrediente.";
      return { sucesso: false, mensagem: mensagemErro };
    }
  }, []);

  return {
    buscarTodos,
    buscarPorNome,
    buscarPorId,
    cadastrarIngrediente,
    verificarUsoIngrediente, 
    editarIngrediente,
    deletarIngrediente,
  };
}
