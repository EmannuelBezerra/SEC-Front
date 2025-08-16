export default function ListItem({ children, actions }) {
  return (
    <div className="flex items-center justify-between p-4 rounded bg-gray-100 shadow-sm border border-gray-200 mb-4 gap-2">
      <div className="flex-1 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        {children}
      </div>
      <div className="flex gap-2 mt-2 sm:mt-0" >{actions}</div>
    </div>
  );
}
