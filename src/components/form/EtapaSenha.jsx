import InputField from "../common/InputField";
import PasswordField from "../common/PasswordField";
import ConfirmPasswordField from "../common/ConfirmPasswordField";
import { isEmail } from "validator";

export default function EtapaSenha({ register, watch, errors, prevStep }) {
  return (
    <>
      <InputField
        type="text"
        placeholder="email@exemplo.com"
        {...register("email", {
          required: "Informe o email.",
          validate: (value) => isEmail(value) || "Email inválido."
        })}
        errorMessage={errors?.email?.message}
      />

      <PasswordField
        {...register("password", {
          required: "Informe a senha.",
          minLength: { value: 8, message: "A senha deve conter no mínimo 8 caracteres." }
        })}
        errorMessage={errors?.password?.message}
      />

      <ConfirmPasswordField
        register={register}
        watch={watch}
        errors={errors}
      />

      <button
        type="submit"
        className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Entrar
      </button>

      <button
        type="button"
        onClick={prevStep}
        className="text-sm text-gray-500 underline mt-2 hover:cursor-pointer"
      >
        Voltar para Identificação
      </button>
    </>
  );
}