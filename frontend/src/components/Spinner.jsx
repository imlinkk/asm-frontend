const Spinner = ({ label = "Loading", fullPage = false }) => {
  const content = (
    <div className="flex items-center justify-center gap-3 text-slate-600" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );

  if (fullPage) {
    return <div className="flex min-h-[55vh] items-center justify-center">{content}</div>;
  }

  return content;
};

export const ButtonSpinner = () => (
  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" aria-hidden="true" />
);

export default Spinner;
