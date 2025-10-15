import { Link } from "react-router-dom";

export default function Trips() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Trips</h1>
      <div className="rounded-xl border border-slate-200 p-4 bg-white">
        <p className="mb-3 text-slate-700">No trips yet.</p>
        <button className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm">
          + Start Planning
        </button>
        <p className="mt-4 text-sm text-slate-500">
          (Later this will create a new trip and open the checklist page.)
        </p>
        <p className="mt-4">
          <Link to="/" className="text-slate-700 underline">Back to Landing</Link>
        </p>
      </div>
    </main>
  );
}