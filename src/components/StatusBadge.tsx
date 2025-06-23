import clsx from "clsx";

interface Props {
  status: string;
}

const StatusBadge: React.FC<Props> = ({ status }) => {
  const baseClass =
    "text-xs font-semibold px-2 py-1 rounded-full capitalize inline-block";

  const statusClass = clsx(baseClass, {
    "bg-yellow-100 text-yellow-700": status === "pending",
    "bg-blue-100 text-blue-700": status === "processing",
    "bg-purple-100 text-purple-700": status === "shipped",
    "bg-green-100 text-green-700": status === "delivered",
    "bg-gray-200 text-gray-600":
      !["pending", "processing", "shipped", "delivered"].includes(status),
  });

  return <span className={statusClass}>{status}</span>;
};

export default StatusBadge;
