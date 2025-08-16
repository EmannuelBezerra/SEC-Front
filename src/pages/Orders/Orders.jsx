import React, { useState, useEffect } from "react";
import PageHeader from "../../components/common/PageHeader";
import ListContainer from "../../components/common/ListContainer";
import OrderItem from "../../components/common/orders/OrderItem";
import OrderModal from "../../components/common/modals/OrderModal";
import OrderDetailsModal from "../../components/common/modals/OrderDetailsModal";
import OrderEditModal from "../../components/common/modals/OrderEditModal";
import ConfirmarExclusãoModal from "../../components/common/modals/ConfirmarExclusãoModal";
import useOrdersAPI from "../../hooks/useOrdersAPI";
import useRevenuesAPI from "../../hooks/useRevenuesAPI";
import ResultSearchContainer from "../../components/common/ResultSearchContainer";
import FeedbackSearch from "../../components/common/FeedbackSearch";

export default function Orders() {
  const {
    createOrder,
    getOrders,
    getOrderById,
    deleteOrder,
    updateOrder,
    updateOrderStatus,
  } = useOrdersAPI();
  const { getRecipes } = useRevenuesAPI();

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [isOrderEditModalOpen, setIsOrderEditModalOpen] = useState(false);
  const [pedidoParaEditar, setPedidoParaEditar] = useState(null);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [pedidoParaExcluir, setPedidoParaExcluir] = useState(null);

  const [pedidos, setPedidos] = useState([]);

  const [receitas, setReceitas] = useState([]);
  const [_receitasLoading, setReceitasLoading] = useState(true);
  const [_receitasError, setReceitasError] = useState(null);
  const [showResultadoBusca, setShowResultadoBusca] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para armazenar usuário lido do localStorage
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userStorage = localStorage.getItem("user");
    if (userStorage) {
      try {
        setUser(JSON.parse(userStorage));
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    async function loadPedidos() {
      setLoading(true);
      setError(null);
      const resultado = await getOrders();
      if (resultado.sucesso) {
        setPedidos(resultado.pedidos);
      } else {
        setError(resultado.mensagem);
      }
      setLoading(false);
    }
    setShowResultadoBusca(false);
    loadPedidos();
  }, [getOrders]);

  useEffect(() => {
    async function loadReceitas() {
      setReceitasLoading(true);
      setReceitasError(null);

      const resultado = await getRecipes();
      if (resultado.sucesso) {
        setReceitas(resultado.recipes); // Ajuste se a chave for diferente
      } else {
        setReceitasError(resultado.mensagem);
      }
      setReceitasLoading(false);
    }

    loadReceitas();
  }, [getRecipes]);

  // Permissões baseadas no perfil do usuário
  const podeExcluir = user?.perfil === "SUPERVISOR_SENIOR";
  const podeEditar =
    user?.perfil === "SUPERVISOR_SENIOR" ||
    user?.perfil === "SUPERVISOR_JUNIOR";
  const podeModificarStatus = podeEditar; // só seniors e juniors podem modificar status

  const handleAddOrder = () => setIsOrderModalOpen(true);

  const handleSaveOrder = async (novoPedido) => {
    try {
      const resultado = await createOrder(novoPedido);

      if (resultado.sucesso) {
        const pedidoComId = {
          ...novoPedido,
          id: resultado.pedidoId,
          valorTotal: resultado.valorTotal,
        };
        setPedidos((prev) => [...prev, pedidoComId]);
        alert("Pedido criado com sucesso!");
        setIsOrderModalOpen(false); // fecha modal após sucesso
      } else {
        alert(`Erro ao criar pedido: ${resultado.mensagem}`);
      }
    } catch (error) {
      alert("Erro inesperado ao criar pedido.");
      console.error(error);
    }
  };

  const handleEditOrder = (pedido) => {
    if (!podeEditar) {
      alert("Você não tem permissão para editar pedidos.");
      return;
    }

    setPedidoParaEditar(pedido);
    setIsOrderEditModalOpen(true);
  };

  const handleSaveEditedOrder = async (pedidoAtualizado) => {
    // Mapeia o array `receitas` para o formato esperado pela API
    const receitasParaAPI = pedidoAtualizado.receitas.map((item) => ({
      receitaId: item.id,
      quantidade: item.quantidade,
    }));

    const { id, nomeCliente } = pedidoAtualizado;
    try {
      // Envia a lista de receitas no novo formato
      const resultado = await updateOrder(id, {
        nomeCliente,
        receitas: receitasParaAPI,
      });

      if (resultado.sucesso) {
        setPedidos((prev) =>
          prev.map((p) => (p.id === id ? resultado.pedido : p))
        );
        alert("Pedido atualizado com sucesso!");
      } else {
        alert(`Erro ao atualizar pedido: ${resultado.mensagem}`);
      }
    } catch (error) {
      alert("Erro inesperado ao atualizar o pedido.");
      console.error(error);
    } finally {
      setIsOrderEditModalOpen(false);
    }
  };

  const handleStatusChange = async (id, novoStatus) => {
    if (!podeModificarStatus) {
      alert("Você não tem permissão para modificar o status.");
      return;
    }

    const resultado = await updateOrderStatus(id, novoStatus);

    if (resultado.sucesso) {
      setPedidos((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: resultado.novoStatus } : p
        )
      );
      // alert("Status do pedido atualizado com sucesso!"); // O modal já exibe um alerta, mas você pode usar aqui se quiser.
    } else {
      alert(`Erro ao atualizar status: ${resultado.mensagem}`);
    }
  };

  const handleViewDetails = async (pedido) => {
    try {
      const resultado = await getOrderById(pedido.id);

      if (resultado.sucesso && resultado.pedido) {
        setSelectedOrder(resultado.pedido); // Salva o objeto completo no estado
        setDetailsOpen(true); // Abre o modal
      } else {
        alert("Erro ao carregar detalhes do pedido.");
        console.error(resultado.mensagem);
      }
    } catch (error) {
      alert("Erro inesperado ao buscar os detalhes do pedido.");
      console.error(error);
    }
  };

  const handleSearch = async (value, tipo) => {
    setShowResultadoBusca(true);
    const termo = value?.trim();
    setError(null);
    setLoading(true);

    if (!termo) {
      // Busca tudo
      setShowResultadoBusca(false);
      const resultado = await getOrders();
      if (resultado.sucesso) setPedidos(resultado.pedidos);
      else setError(resultado.mensagem);
      setLoading(false);
      return;
    }

    if (tipo === "nome") {
      const resultado = await getOrders(termo.toLowerCase());
      if (resultado.sucesso) setPedidos(resultado.pedidos);
      else setError(resultado.mensagem);
    } else if (tipo === "id") {
      const resultado = await getOrderById(termo);
      if (resultado.sucesso)
        setPedidos(resultado.pedido ? [resultado.pedido] : []);
      else setError(resultado.mensagem);
    }
    setLoading(false);
  };

  const abrirConfirmacaoExclusao = (pedido) => {
    if (!podeExcluir) {
      alert("Você não tem permissão para excluir pedidos.");
      return;
    }
    setPedidoParaExcluir(pedido);
    setIsConfirmDeleteOpen(true);
  };

  const confirmarExclusao = async () => {
    if (!pedidoParaExcluir) return;

    const pedidoId = pedidoParaExcluir.id; // Chama a função da API para exclusão

    const resultado = await deleteOrder(pedidoId);

    if (resultado.sucesso) {
      // Se a API retornar sucesso, remove do estado local
      setPedidos((prev) => prev.filter((p) => p.id !== pedidoId));
      alert(resultado.mensagem);
    } else {
      // Se a API retornar erro, exibe a mensagem e não remove do estado
      alert(resultado.mensagem);
    } // Limpa o estado e fecha o modal em ambos os casos

    setPedidoParaExcluir(null);
    setIsConfirmDeleteOpen(false);
  };

  const cancelarExclusao = () => {
    setPedidoParaExcluir(null);
    setIsConfirmDeleteOpen(false);
  };

  return (
    <div className="flex flex-col p-4 h-screen">
      <PageHeader
        title="Pedidos"
        searchPlaceholder="Digite o id ou nome do titular do pedido para encontrá-lo..."
        onSearch={handleSearch}
        mainAction="Adicionar novo pedido"
        onMainAction={handleAddOrder}
        showFilter
        showSort
      />

      {showResultadoBusca && (
        <ResultSearchContainer>
          {loading ? (
            <div className="p-2 text-gray-700">Carregando pedidos...</div>
          ) : (
            <FeedbackSearch itens={pedidos} error={error} />
          )}
        </ResultSearchContainer>
      )}

      <ListContainer height="100">
        {pedidos.length > 0 ? (
          pedidos.map((p) => (
            <OrderItem
              key={p.id}
              id={p.id}
              date={p.dataPedido}
              clientName={p.nomeCliente}
              total={p.valorTotal}
              status={p.status}
              onChangeStatus={(newStatus) =>
                handleStatusChange(p.id, newStatus)
              }
              onViewDetails={() => handleViewDetails(p)}
              onEdit={() => handleEditOrder(p)}
              onDelete={() => abrirConfirmacaoExclusao(p)}
              disableEdit={!podeEditar}
              disableDelete={!podeExcluir}
              disableStatusChange={!podeModificarStatus}
            />
          ))
        ) : (
          <p className="p-2 text-gray-700">Nenhum pedido cadastrado.</p>
        )}
      </ListContainer>

      {isOrderModalOpen && (
        <OrderModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          receitasDisponiveis={receitas}
          onSave={handleSaveOrder}
        />
      )}

      {isOrderEditModalOpen && pedidoParaEditar && (
        <OrderEditModal
          isOpen={isOrderEditModalOpen}
          onClose={() => setIsOrderEditModalOpen(false)}
          pedido={pedidoParaEditar}
          receitasDisponiveis={receitas}
          onSave={handleSaveEditedOrder}
        />
      )}

      <OrderDetailsModal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        order={selectedOrder}
        receitasDisponiveis={receitas}
      />

      <ConfirmarExclusãoModal
        isOpen={isConfirmDeleteOpen}
        onClose={cancelarExclusao}
        onConfirm={confirmarExclusao} // Ação que vai chamar a API
        mensagem={`Deseja realmente excluir o pedido de ${
          pedidoParaExcluir?.nome_cliente || ""
        }? Essa ação é irreversível e irá devolver os ingredientes ao estoque.`}
      />
    </div>
  );
}
