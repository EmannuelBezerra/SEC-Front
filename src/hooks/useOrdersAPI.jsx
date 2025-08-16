import { useCallback } from "react";
import axios from "axios";

export default function useOrdersAPI() {
  const getApi = () =>
    axios.create({
      baseURL: "http://localhost:3000/api_confeitaria",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Cache-Control": "no-cache",
      },
    });

  const createOrder = useCallback(async (dados) => {
    try {
      const resposta = await getApi().post("/pedidos", dados);
      return {
        sucesso: true,
        mensagem: resposta.data.msg,
        pedidoId: resposta.data.pedidoId,
        valorTotal: resposta.data.valorTotal,
      };
    } catch (erro) {
      const mensagemErro =
        erro.response?.data?.msg ||
        erro.response?.data?.error ||
        "Erro ao criar pedido.";
      return { sucesso: false, mensagem: mensagemErro };
    }
  }, []);

  const getOrders = useCallback(async (nomeCliente = "") => {
    try {
      const params = {};
      if (nomeCliente.trim() !== "") {
        params.nomeCliente = nomeCliente.trim();
      }

      const resposta = await getApi().get("/pedidos", { params });
      return {
        sucesso: true,
        pedidos: resposta.data.pedidos,
        mensagem: resposta.data.msg,
      };
    } catch (erro) {
      const mensagemErro =
        erro.response?.data?.msg || "Erro ao buscar pedidos.";
      return { sucesso: false, mensagem: mensagemErro, pedidos: [] };
    }
  }, []);

  const getOrderById = useCallback(async (id) => {
    try {
      const response = await getApi().get(`/pedidos/${id}`);
      return { sucesso: true, pedido: response.data.pedido };
    } catch (erro) {
      const mensagemErro =
        erro.response?.data?.msg || "Erro ao buscar pedido por ID.";
      return { sucesso: false, mensagem: mensagemErro };
    }
  }, []);

  // useOrdersAPI.jsx

  const deleteOrder = useCallback(async (id) => {
    try {
      // A requisição DELETE para a API
      await getApi().delete(`/super/pedidos/${id}`); // Como o backend retorna 204 No Content, não há dados para processar

      return {
        sucesso: true,
        mensagem: "Pedido excluído com sucesso.",
      };
    } catch (erro) {
      const mensagemErro =
        erro.response?.data?.msg || "Erro ao excluir o pedido.";
      return { sucesso: false, mensagem: mensagemErro };
    }
  }, []);

  const updateOrder = useCallback(async (id, dados) => {
    try {
      const resposta = await getApi().put(`/super/pedidos/${id}`, dados);
      return {
        sucesso: true,
        mensagem: resposta.data.message,
        pedido: {
          ...dados,
          id: resposta.data.pedidoId,
          valorTotal: resposta.data.novoValorTotal,
        },
      };
    } catch (erro) {
      const mensagemErro =
        erro.response?.data?.error ||
        erro.response?.data?.msg ||
        "Erro ao atualizar pedido.";
      return { sucesso: false, mensagem: mensagemErro };
    }
  }, []);

  const updateOrderStatus = useCallback(async (id, novoStatus) => {
    try {
      const resposta = await getApi().put(`/super/pedidos/${id}/status`, {
        novoStatus,
      });
      return {
        sucesso: true,
        mensagem: resposta.data.message,
        novoStatus: novoStatus,
      };
    } catch (erro) {
      const mensagemErro =
        erro.response?.data?.error ||
        erro.response?.data?.msg ||
        "Erro ao atualizar status do pedido.";
      return { sucesso: false, mensagem: mensagemErro };
    }
  }, []);

  return {
    createOrder,
    getOrders,
    getOrderById,
    deleteOrder,
    updateOrder,
    updateOrderStatus
  };
}
