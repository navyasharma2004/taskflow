import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl font-bold text-brand-600">404</h1>
      <p className="mt-2 text-gray-500">This page doesn't exist.</p>
      <Link to="/dashboard" className="mt-4 text-brand-600 hover:underline">
        Go to Dashboard
      </Link>
    </div>
  );
}
