import { useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";

const defaultForm = {
  nome: "",
  unidade: "g",
  pesoVolume: "",
  perecivel: false,
  validade: "",
  nivelMinimo: "",
  precoCusto: "",
  unidades: "",
  categoria: "INGREDIENTE",
  outraCategoria: "",
};

export default function ProdutoModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  modoSomenteQuantidade = false,
  apiErrorMsg = "",
}) {
  const [formData, setFormData] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const somenteEditarQuantidade = !!modoSomenteQuantidade;
  const bloqueado = initialData?.podeEditar === false;
  const receitasQueUsam = initialData?.receitas || [];

  useEffect(() => {
    setApiError(apiErrorMsg || "");
  }, [apiErrorMsg]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nome: initialData.nome || "",
        unidade: initialData.unidadeMedida || "g",
        pesoVolume: initialData.pesoPorUnidade?.toString() || "",
        perecivel: !!initialData.validade,
        validade: initialData.validade || "",
        nivelMinimo: initialData.nivelMinimo?.toString() || "",
        precoCusto: initialData.precoCusto?.toString() || "",
        unidades: initialData.unidades?.toString() || "",
        categoria: initialData.categoria || "INGREDIENTE",
        outraCategoria: "",
      });
      setErrors({});
      setApiError("");
    } else {
      // se initialData == null (modo criar), limpa o form para estado inicial
      setFormData(defaultForm);
      setErrors({});
      setApiError("");
    }
  }, [initialData]);

  useEffect(() => {
    if (!isOpen) {
      setFormData(defaultForm);
      setErrors({});
      setApiError("");
    }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};

    if (!formData.nome.trim() && !somenteEditarQuantidade && !bloqueado)
      newErrors.nome = "Informe o nome do produto!";

    if (
      (!formData.pesoVolume ||
        isNaN(Number(formData.pesoVolume)) ||
        Number(formData.pesoVolume) <= 0) &&
      !somenteEditarQuantidade &&
      !bloqueado &&
      formData.unidade !== "un"
    ) {
      newErrors.pesoVolume = "Inválido, deve ser maior que zero!";
    }

    if (
      formData.perecivel &&
      !formData.validade &&
      !somenteEditarQuantidade &&
      !bloqueado
    )
      newErrors.validade = "Validade é obrigatória.";

    if (
      (formData.nivelMinimo === "" || isNaN(Number(formData.nivelMinimo))) &&
      !somenteEditarQuantidade &&
      !bloqueado
    )
      newErrors.nivelMinimo =
        "Informe o nível mínimo de estoque. Deve ser um número inteiro e positivo";

    if (
      formData.categoria === "OUTRO" &&
      !formData.outraCategoria.trim() &&
      !bloqueado
    ) {
      newErrors.outraCategoria = "Descreva a categoria.";
    }

    if (
      (formData.precoCusto === "" || isNaN(Number(formData.precoCusto))) &&
      !somenteEditarQuantidade &&
      !bloqueado
    )
      newErrors.precoCusto =
        "Preço de custo inválido! Informe o preço de custo (Deve ser um número inteiro e positivo! ";

    if (
      formData.unidades === "" ||
      isNaN(Number(formData.unidades)) ||
      !Number.isInteger(Number(formData.unidades)) ||
      Number(formData.unidades) <= 0
    )
      newErrors.unidades = "Informe o estoque inicial!";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData({
      ...formData,
      [name]: newValue,
    });
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const dadosParaEnviar = { ...formData };

    if (dadosParaEnviar.unidade === "un") {
      dadosParaEnviar.pesoPorUnidade = null;
    } else {
      const peso = parseFloat(dadosParaEnviar.pesoVolume);
      if (isNaN(peso) || peso <= 0) {
        setErrors((prev) => ({
          ...prev,
          pesoVolume: "Peso/Volume inválido, deve ser maior que zero!",
        }));
        return;
      }
      dadosParaEnviar.pesoPorUnidade = peso;
    }

    try {
      await onSubmit(dadosParaEnviar);
      setApiError("");
    } catch (error) {
      const msg =
        error?.response?.data?.msg ||
        error?.message ||
        "Erro ao salvar produto.";
      setApiError(msg);

      if (msg === "Produto já cadastrado!") {
        setErrors((prev) => ({ ...prev, nome: msg }));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Editar Produto" : "Cadastrar Produto"}
        </h2>
        {bloqueado ? (
          <div className="text-red-600 text-sm">
            <p>
              Este ingrediente está sendo utilizado em {receitasQueUsam.length}
              receita(s) e não pode ser editado:
            </p>
            <ul className="list-disc list-inside">
              {receitasQueUsam.map((nome, i) => (
                <li key={i}>{nome}</li>
              ))}
            </ul>
            <div className="pt-4">
              <button
                onClick={() => {
                  onClose();
                }}
                className="w-full hover:cursor-pointer bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                VOLTAR
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-3 text-sm text-black"
          >
            {/* Nome */}
            <div>
              <label>Nome:</label>
              <input
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                disabled={modoSomenteQuantidade}
                placeholder="Insira o nome do produto"
                className="w-full px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
              />
              {errors.nome && (
                <p className="text-red-500 text-xs">{errors.nome}</p>
              )}
            </div>
            {/* Unidade */}
            <div>
              <label>Unidade:</label>
              <select
                name="unidade"
                value={formData.unidade}
                onChange={handleChange}
                disabled={modoSomenteQuantidade}
                className="w-full px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
              >
                <option value="mg">Miligramas (mg)</option>
                <option value="g">Gramas (g)</option>
                <option value="kg">Quilogramas (kg)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="l">Litros (l)</option>
                <option value="un">Unidade (un)</option>
              </select>
            </div>
            {/* Peso / Volume */}
            <div>
              <label>Peso / Volume:</label>
              <NumericFormat
                name="pesoVolume"
                value={formData.pesoVolume}
                onValueChange={({ floatValue }) =>
                  !modoSomenteQuantidade &&
                  setFormData({ ...formData, pesoVolume: floatValue ?? "" })
                }
                placeholder="Ex: 100, 0.5, 200"
                thousandSeparator="."
                decimalSeparator=","
                allowNegative={false}
                disabled={modoSomenteQuantidade}
                className="w-full px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
              />
              {errors.pesoVolume && (
                <p className="text-red-500 text-xs">{errors.pesoVolume}</p>
              )}
            </div>
            {/* Perecível */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="perecivel"
                checked={formData.perecivel}
                onChange={handleChange}
                disabled={modoSomenteQuantidade}
                className="focus:ring-green-600 disabled:opacity-50"
              />
              <label>Perecível?</label>
            </div>
            {/* Validade */}
            {formData.perecivel && (
              <div>
                <label>Validade:</label>
                <input
                  type="date"
                  name="validade"
                  value={formData.validade}
                  onChange={handleChange}
                  disabled={modoSomenteQuantidade}
                  className="w-full px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
                />
                {errors.validade && (
                  <p className="text-red-500 text-xs">{errors.validade}</p>
                )}
              </div>
            )}
            {/* Nível Mínimo */}
            <div>
              <label>Nível Mínimo:</label>
              <input
                name="nivelMinimo"
                value={formData.nivelMinimo}
                onChange={handleChange}
                disabled={modoSomenteQuantidade}
                placeholder="Ex: 10"
                className="w-full px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
              />
              {errors.nivelMinimo && (
                <p className="text-red-500 text-xs">{errors.nivelMinimo}</p>
              )}
            </div>
            {/* Unidades */}
            <div>
              <label>Unidades:</label>
              <input
                name="unidades"
                value={formData.unidades}
                onChange={handleChange}
                placeholder="Ex: 100"
                className="w-full px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                autoFocus={modoSomenteQuantidade}
              />
              {errors.unidades && (
                <p className="text-red-500 text-xs">{errors.unidades}</p>
              )}
            </div>
            {/* Preço de Custo */}
            <div>
              <label>Preço de Custo (R$):</label>
              <NumericFormat
                name="precoCusto"
                value={formData.precoCusto}
                onValueChange={({ floatValue }) =>
                  !somenteEditarQuantidade &&
                  setFormData({ ...formData, precoCusto: floatValue || "" })
                }
                placeholder="Ex: R$ 5,99"
                thousandSeparator="."
                decimalSeparator=","
                prefix="R$ "
                allowNegative={false}
                disabled={modoSomenteQuantidade}
                className="w-full px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
              />
              {errors.precoCusto && (
                <p className="text-red-500 text-xs">{errors.precoCusto}</p>
              )}
            </div>
            {/* Categoria */}
            <div>
              <label>Categoria:</label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                disabled={modoSomenteQuantidade}
                className="w-full px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
              >
                <option value="INGREDIENTE">Ingrediente</option>
                <option value="PRODUTO_FINAL">Produto Final</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>
            {formData.categoria === "OUTRO" && (
              <div>
                <label>Descreva a categoria:</label>
                <input
                  name="outraCategoria"
                  value={formData.outraCategoria}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[A-Za-zÀ-ÖØ-öø-ÿ\s]*$/.test(value)) {
                      setFormData({ ...formData, outraCategoria: value });
                    }
                  }}
                  placeholder="Ex: Utensílios"
                  className="w-full px-3 py-1.5 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            )}
            {/* Erro geral da API (caso não seja de nome duplicado) */}
            {apiError &&
              apiError !== "Produto já cadastrado!" &&
              !errors.nome && (
                <p className="text-red-500 text-xs font-semibold">{apiError}</p>
              )}
            {/* Botões */}
            <div className="flex gap-4 justify-between pt-4">
              <button
                type="button"
                onClick={() => {
                  onClose();
                }}
                className="w-1/2 hover:cursor-pointer bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                VOLTAR
              </button>
              <button
                type="submit"
                className="w-1/2 hover:cursor-pointer bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {initialData ? "SALVAR" : "CADASTRAR"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
