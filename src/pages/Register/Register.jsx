// src/pages/Register/index.jsx
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { useRegisterForm, criarPayload, cadastrarUsuario } from "../../hooks/useRegisterForm";

import EtapaIdentificacao from "../../components/form/EtapaIdentificacao";
import EtapaSenha from "../../components/form/EtapaSenha";

import ConfirmacaoModal from "../../components/common/ConfirmacaoModal";
import SucessoModal from "../../components/common/SucessModal";

export default function Register() {
  const [step, setStep] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    setValue,
    control,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      cargo: "Funcionario",
    },
  });

  const navigate = useNavigate();

  const {
    pendingCargo,
    modalError,
    setModalError,
    showSuccessModal,
    setShowSuccessModal,
    confirmarCargo,
    cancelarModal,
    handleCargoChange,
  } = useRegisterForm(setValue, clearErrors, setShowModal);

  const nextStep = async () => {
    const isStepValid = await trigger(["name", "telephone", "cargo"]);
    if (isStepValid) setStep(2);
  };

  const prevStep = () => setStep(1);

  const onSubmit = async (data) => {
    try {
      const payload = criarPayload(data);
      await cadastrarUsuario(payload);
      setShowSuccessModal(true);
    } catch (error) {
      alert("Erro no cadastro: " + error.message);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-green-600 font-bold">1</span>
          <div className={`h-1 w-full mx-2 rounded ${step === 2 ? "bg-green-600" : "bg-gray-400"}`} />
          <span className={`${step === 2 ? "text-green-600" : "text-gray-400"} font-bold`}>2</span>
        </div>

        {step === 1 ? (
          <EtapaIdentificacao
            register={register}
            errors={errors}
            control={control}
            setValue={setValue}
            handleCargoChange={(e) => handleCargoChange(e, getValues)}
            nextStep={nextStep}
          />
        ) : (
          <EtapaSenha
            register={register}
            watch={watch}
            errors={errors}
            prevStep={prevStep}
          />
        )}
      </form>

      {showModal && (
        <ConfirmacaoModal
          pendingCargo={pendingCargo}
          onConfirm={confirmarCargo}
          onCancel={cancelarModal}
          modalError={modalError}
          setModalError={setModalError}
        />
      )}

      {showSuccessModal && (
        <SucessoModal
          mensagem="Cadastro realizado com sucesso! Agora você pode fazer login na plataforma."
          onClose={() => {
            setShowSuccessModal(false);
            navigate("/");
          }}
        />  
      )}
    </>
  );
}