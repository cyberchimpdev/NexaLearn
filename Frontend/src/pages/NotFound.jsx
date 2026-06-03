import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          404
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-950">
          Page not found
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          The page you are trying to open does not exist in NexaLearn.
        </p>

        <div className="mt-6 flex justify-center">
          <Link
            to="/"
            className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Go Home
          </Link>
        </div>
      </section>
    </main>
  );
}

export default NotFound;
