import InputField from "../common/InputField";
import PhoneField from "../common/PhoneField";
import CargoSelector from "../common/CargoSelector";

export default function EtapaIdentificacao({ register, errors, control, setValue,  handleCargoChange, nextStep }) {
  return (
    <>
      <InputField
        type="text"
        placeholder="Como devemos te chamar?"
        {...register("name", { required: "Informe o seu nome." })}
        errorMessage={errors?.name?.message}
      />

      <PhoneField
        control={control}
        name="telephone"
        setValue={setValue}
        errorMessage={errors?.telephone?.message}
      />

      <CargoSelector
        register={register}
        handleCargoChange={handleCargoChange}
        errors={errors}
      />

      <button
        type="button"
        onClick={nextStep}
        className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 hover:cursor-pointer"
      >
        Seguir
      </button>
    </>
  );
} 