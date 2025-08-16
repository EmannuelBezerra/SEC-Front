export default function  capitalizewords(texto) {
  if (!texto) return "";
  return texto
    .toLowerCase()
    .split(" ")
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(" ");
}