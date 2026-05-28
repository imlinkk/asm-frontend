const EmptyState = ({ title, description, action }) => (
  <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
    <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
    {description ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p> : null}
    {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
  </div>
);

export default EmptyState;
