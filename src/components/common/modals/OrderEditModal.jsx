import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Minus, Plus, Trash2 } from "lucide-react";
import RecipeSelectorModal from "./RecipeSelectorModal";
import PhoneField from "../PhoneField";

export default function OrderEditModal({
  isOpen,
  onClose,
  pedido,
  receitasDisponiveis,
  onSave,
}) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nomeCliente: "",
      telefoneCliente: "",
      dataPedido: "",
      status: "PENDENTE",
      itens: [],
    },
  });

  const [modalReceitaAberto, setModalReceitaAberto] = useState(false);
  const [itens, setItens] = useState([]);

  useEffect(() => {
    setValue("itens", itens);
  }, [itens, setValue]);

  // Ajuste: Ao abrir modal, mapeia a estrutura da API para a estrutura local do componente
  useEffect(() => {
    if (isOpen && pedido) {
      const simplifiedItens =
        pedido.pedidoReceitas?.map((pr) => ({
          id: pr.receita.id,
          quantidade: pr.quantidade,
        })) || [];
      setItens(simplifiedItens);

      // Formata a data para YYYY-MM-DD
      const dataFormatada = pedido.dataPedido
        ? new Date(pedido.dataPedido).toISOString().slice(0, 10)
        : "";

      reset({
        nomeCliente: pedido.nomeCliente || "",
        telefoneCliente: pedido.telefoneCliente || "",
        dataPedido: dataFormatada || "",
        status: pedido.status || "PENDENTE",
        itens: simplifiedItens,
      });
    }
  }, [isOpen, pedido, reset]); // TRECHO CORRIGIDO: Adicionando o encadeamento opcional '?'

  const valorTotal = itens
    .reduce((acc, item) => {
      const receita = receitasDisponiveis?.find((r) => r.id === item.id);
      return acc + (receita?.custoDeProducao || 0) * item.quantidade;
    }, 0)
    .toFixed(2);

  const onSubmit = (data) => {
    if (itens.length === 0) {
      alert("Adicione ao menos uma receita.");
      return;
    }

    const pedidoAtualizado = {
      ...pedido, // mantém id e outras propriedades
      nomeCliente: data.nomeCliente,
      telefoneCliente: data.telefoneCliente,
      dataPedido: data.dataPedido,
      status: data.status,
      valorTotal: parseFloat(valorTotal),
      receitas: itens,
    };

    onSave(pedidoAtualizado);
    onClose();
  };

  const handleChangeQuantidade = (index, delta) => {
    setItens((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantidade: Math.max(1, item.quantidade + delta) }
          : item
      )
    );
  };

  const handleRemoveItem = (index) => {
    setItens((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateReceitas = (selecionadasComQuantidade) => {
    const novosItens = selecionadasComQuantidade.map(({ id, quantidade }) => ({
      id,
      quantidade,
    }));
    setItens(novosItens);
    setModalReceitaAberto(false);
  };

  if (!isOpen) return null;

  if (receitasDisponiveis && receitasDisponiveis.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl w-full max-w-[550px] max-h-[95vh] text-center">
          <p>Carregando dados das receitas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl w-full max-w-[550px] max-h-[95vh] overflow-y-auto"
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">Editar Pedido:</h2>
        </div>

        <div className="flex flex-col gap-2">
          {/* Nome do cliente */}
          <div>
            <label className="block font-semibold">Cliente:</label>
            <input
              {...register("nomeCliente", {
                required: "Informe o nome do cliente.",
              })}
              placeholder="Nome do cliente"
              className={`w-full px-3 py-2 rounded-xl bg-gray-100 placeholder-gray-500 text-gray-800 focus:outline-none border ${
                errors.nomeCliente
                  ? "border-red-600 focus:ring-red-500 focus:ring-2"
                  : "border-gray-400 focus:ring-green-500 focus:ring-2"
              }`}
            />
            {errors.nomeCliente && (
              <p className="text-red-500 text-xs">
                {errors.nomeCliente.message}
              </p>
            )}
          </div>

          {/* Telefone */}
          <div>
            <label className="block font-semibold">Telefone:</label>
            <PhoneField
              control={control}
              name="telefoneCliente"
              setValue={setValue}
              errorMessage={errors.telefoneCliente?.message}
            />
          </div>

          {/* ITENS */}
          <div className="mb-3">
            <strong className="block mb-2">ITENS:</strong>
            <button
              type="button"
              onClick={() => setModalReceitaAberto(true)}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm mb-2 hover:cursor-pointer"
            >
              Selecionar receita +
            </button>
            {itens.length === 0 && (
              <p className="text-red-500 text-xs">
                Adicione ao menos uma receita.
              </p>
            )}

            <div className="space-y-2">
              {itens.map((item, index) => {
                const receita = receitasDisponiveis?.find(
                  (r) => r.id === item.id
                );
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <span className="font-semibold">{receita?.nome}</span>
                    <div className="flex items-center gap-2">
                      <span>Qtd:</span>
                      <button
                        type="button"
                        onClick={() => handleChangeQuantidade(index, -1)}
                        className="bg-red-400 text-white p-1 rounded"
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        value={item.quantidade}
                        readOnly
                        className="w-10 text-center border rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleChangeQuantidade(index, 1)}
                        className="bg-green-500 text-white p-1 rounded"
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {/* Valor total */}
              <div className="w-full border-b border-gray-300 mt-4"></div>
              <div className="flex justify-center p-2">
                <p className="font-semibold text-gray-700">
                  Valor total: R$
                  {Number(valorTotal).toFixed(2).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-orange-400 text-white px-4 py-2 rounded hover:bg-orange-500 hover:cursor-pointer"
          >
            CANCELAR
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 hover:cursor-pointer"
          >
            SALVAR
          </button>
        </div>

        <RecipeSelectorModal
          isOpen={modalReceitaAberto}
          onClose={() => setModalReceitaAberto(false)}
          receitasDisponiveis={receitasDisponiveis}
          selecionadas={itens.map(({ id, quantidade }) => ({ id, quantidade }))}
          onUpdate={handleUpdateReceitas}
        />
      </form>
    </div>
  );
}
