export default function InputField({ placeholder, errorMessage, ...props }) {
  return (
    <div>
      <input
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-xl bg-gray-100 placeholder-gray-500 text-gray-800 focus:outline-none border ${
          errorMessage
            ? "border-red-600 focus:ring-red-500 focus:ring-2"
            : "border-gray-400 focus:ring-green-500 focus:ring-2"
        }`}
        {...props}
      />
      {errorMessage && <p className="text-red-600 mt-2 text-sm">{errorMessage}</p>}
    </div>
  );
}
