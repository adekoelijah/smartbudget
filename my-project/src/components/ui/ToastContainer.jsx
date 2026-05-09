const ToastContainer = ({ toasts }) => {
  return (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-2 rounded-lg shadow text-sm text-white ${
            t.type === "error"
              ? "bg-red-500"
              : t.type === "success"
              ? "bg-green-500"
              : "bg-gray-800"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;