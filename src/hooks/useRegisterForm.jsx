import { useState } from "react";

export function useRegisterForm(setValue, clearErrors, setShowModal) {
  const [pendingCargo, setPendingCargo] = useState(null);
  const [modalError, setModalError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleCargoChange = (e, getValues) => {
    const value = e.target.value;
    const currentCargo = getValues("cargo");

    if (value === "Funcionario") {
      setValue("cargo", "Funcionario");
      setModalError("");
      setPendingCargo(null);
    } else if (value !== currentCargo) {
      setPendingCargo(value);
      setModalError("");
      setShowModal(true);
      setValue("cargo", currentCargo);
    }
  };

  const confirmarCargo = (senha) => {
    if (!senha) {
      setModalError("Informe a senha de validação do supervisor.");
      return;
    }

    const isJunior = pendingCargo === "Junior";
    const isSenior = pendingCargo === "Senior";

    const senhaCorreta =
      (isJunior && senha === "senhaSupervisorJunior123") ||
      (isSenior && senha === "senhaSupervisorSenior456");

    if (senhaCorreta) {
      setValue("cargo", pendingCargo);
      clearErrors("cargo");
      setModalError("");
      setPendingCargo(null);
      setShowModal(false);
    } else {
      setModalError("Senha de validação de supervisor incorreta.");
    }
  };

  const cancelarModal = () => {
    setPendingCargo(null);
    setModalError("");
    setShowModal(false);
  };

  return {
    pendingCargo,
    modalError,
    setModalError,
    showSuccessModal,
    setShowSuccessModal,
    confirmarCargo,
    cancelarModal,
    handleCargoChange,
  };
}

export const criarPayload = (data) => {
  const perfil =
    data.cargo === "Junior"
      ? "SUPERVISOR_JUNIOR"
      : data.cargo === "Senior"
      ? "SUPERVISOR_SENIOR"
      : "FUNCIONARIO_COMUM";

  const payload = {
    nome: data.name,
    email: data.email,
    senha: data.password,
    senha_confirmacao: data.confirmar,
    telefone: data.telephone,
    perfil,
  };

  if (perfil !== "FUNCIONARIO_COMUM") {
    payload.senhaValidacaoSup =
      perfil === "SUPERVISOR_JUNIOR"
        ? "senhaSupervisorJunior123"
        : "senhaSupervisorSenior456";
  }
  
  return payload;
};

export const cadastrarUsuario = async (payload) => {
  const response = await fetch("http://localhost:3000/api_confeitaria/usuario", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Erro ao cadastrar usuário.");
  }

  return response;
};
