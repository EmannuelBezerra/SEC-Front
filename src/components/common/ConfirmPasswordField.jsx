import PasswordField from "./PasswordField"; 

export default function ConfirmPasswordField({ register, watch, errors }) {
  const senha = watch("password"); 

  return (
    <div className="relative">
      <PasswordField
        placeholder="A mesma digitada acima"
        {...register("confirmar", {
          required: "Confirme a senha.",
          validate: (value) =>
            value === senha || "As senhas não coincidem.",
        })}
        errorMessage={errors?.confirmar?.message}
      />
    </div>
  );
}
