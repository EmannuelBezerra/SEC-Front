export default function CargoSelector ({ register, handleCargoChange, modalError, errors }) {
  return (
    <div>
      <p className="mb-1 text-sm">Cargo atual:</p>
      <div className="flex gap-2 text-xs">
        <label className="flex items-center gap-1">
          <input
            type="radio"
            value="Funcionario"
            {...register("cargo")}
            onChange={handleCargoChange}
          />
          Funcionário
        </label>
        <label className="flex items-center gap-1">
          <input
            type="radio"
            value="Junior"
            {...register("cargo")}
            onChange={handleCargoChange}
          />
          Supervisor Júnior
        </label>
        <label className="flex items-center gap-1">
          <input
            type="radio"
            value="Senior"
            {...register("cargo")}
            onChange={handleCargoChange}
          />
          Supervisor Sênior
        </label>
      </div>

      {modalError === "Senha de validação de incorreta para supervisor." && (
        <p className="text-red-600 mt-1">{modalError}</p>
      )}
      {errors?.cargo && (
        <p className="text-red-600 mt-1">{errors?.cargo.message}</p>
      )}
    </div>
  );
};

