export default function ListContainer({ children, height = "h-[500px]" }) {

  return (
    <div className={`relative ${height} overflow-y-auto pr-2`}>
      {children}
    </div>
  );
}
