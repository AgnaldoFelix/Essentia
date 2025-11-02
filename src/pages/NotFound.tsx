import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--ds-default-50)' }}>
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl" style={{ color: 'var(--ds-default-700)' }}>Oops! Page not found</p>
        <a href="/" className="underline" style={{ color: 'var(--ds-default-700)' }}>
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
