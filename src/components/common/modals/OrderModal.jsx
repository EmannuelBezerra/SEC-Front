import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Minus, Plus, Trash2 } from "lucide-react";
import RecipeSelectorModal from "./RecipeSelectorModal";
import PhoneField from "../PhoneField";

export default function OrderModal({
  isOpen,
  onClose,
  receitasDisponiveis = [],
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

  useEffect(() => {
    if (isOpen) {
      reset({
        nomeCliente: "",
        telefoneCliente: "",
        dataPedido: "",
        status: "PENDENTE",
        itens: [],
      });
      setItens([]);
    }
  }, [isOpen, reset]);

  const valorTotal = itens
    .reduce((acc, item) => {
      const receita = receitasDisponiveis.find((r) => r.id === item.id);
      return acc + (receita?.custoDeProducao || 0) * item.quantidade;
    }, 0)
    .toFixed(2);

  const onSubmit = (data) => {
    if (itens.length === 0) {
      alert("Adicione ao menos uma receita.");
      return;
    }

    const pedido = {
      nomeCliente: data.nomeCliente,
      telefoneCliente: data.telefoneCliente,
      status: data.status,
      valorTotal: parseFloat(valorTotal),
      receitas: itens.map(({ id, quantidade }) => ({
        receitaId: id,
        qtd: quantidade,
      })),
    };

    onSave(pedido);
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

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl w-full max-w-[550px] max-h-[95vh] overflow-y-auto"
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold">Cadastrar Pedido:</h2>
        </div>

        <div className="flex flex-col gap-2">
          <div className="">
            <label className="block font-semibold">Cliente:</label>
            <input
              type="text"
              placeholder="Nome do cliente"
              {...register("nomeCliente", {
                required: "Informe o nome do cliente.",
              })}
              className={`w-full px-3 py-2 rounded-xl bg-gray-100 placeholder-gray-500 text-gray-800 focus:outline-none border ${
                errors.nomeCliente
                  ? "border-red-600 focus:ring-red-500 focus:ring-2"
                  : "border-gray-400 focus:ring-green-500 focus:ring-2"
              }`}
            />
            {errors.nomeCliente && (
              <p className="text-red-600 mt-1 text-sm">
                {errors.nomeCliente.message}
              </p>
            )}
          </div>

          {/* Telefone */}
          <div className="">
            <label className="block font-semibold">Telefone:</label>
            <PhoneField
              control={control}
              name="telefoneCliente"
              setValue={setValue}
              errorMessage={errors.telefoneCliente?.message}
            />
          </div>
        </div>

        {/* ITENS */}
        <div className="mt-2 mb-3">
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
              const receita = receitasDisponiveis.find((r) => r.id === item.id);
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
          </div>
        </div>

        {/* Valor total */}
        <div className="w-full border-b border-gray-300 mt-2"></div>
        <div className="flex justify-center p-2">
          <p className="font-semibold text-gray-700">
            Valor total: R$
            {Number(valorTotal).toFixed(2).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </p>
        </div>
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-orange-400 text-white px-4 py-2 rounded hover:bg-orange-500 hover:cursor-pointer"
          >
            VOLTAR
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 hover:cursor-pointer"
          >
            CADASTRAR
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
