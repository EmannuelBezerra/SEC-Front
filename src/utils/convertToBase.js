export default function convertToBase(quantidade, unidadeAtual, unidadeBase) {
  if (unidadeAtual === unidadeBase) {
    return quantidade;
  }

  // Volume
  if (unidadeBase === "l") {
    if (unidadeAtual === "ml") return quantidade / 1000;
  }
  if (unidadeBase === "ml") {
    if (unidadeAtual === "l") return quantidade * 1000;
  }

  // Massa
  if (unidadeBase === "kg") {
    if (unidadeAtual === "g") return quantidade / 1000;
    if (unidadeAtual === "mg") return quantidade / 1e6;
  }
  if (unidadeBase === "g") {
    if (unidadeAtual === "kg") return quantidade * 1000;
    if (unidadeAtual === "mg") return quantidade / 1000;
  }
  if (unidadeBase === "mg") {
    if (unidadeAtual === "g") return quantidade * 1000;
    if (unidadeAtual === "kg") return quantidade * 1e6;
  }

  // Unidade
  if (unidadeBase === "un" && unidadeAtual === "un") {
    return quantidade;
  }

  // Caso não reconhecido, retorna a quantidade sem conversão (melhor alertar o usuário)
  return quantidade;
}
