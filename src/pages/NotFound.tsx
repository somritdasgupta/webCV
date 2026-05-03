import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Seo } from "@/components/Seo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Seo title="404 — Not found" description="That page doesn't exist." path={location.pathname} />
      <section className="container-prose flex min-h-[60vh] flex-col items-center justify-center pt-20 pb-24 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Error 404</p>
        <h1 className="mt-4 font-serif text-6xl tracking-tight">Lost in space.</h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          The page <span className="font-mono text-foreground">{location.pathname}</span> doesn't exist —
          or hasn't been written yet.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform hover:scale-105"
        >
          Take me home
        </Link>
      </section>
    </>
  );
};

export default NotFound;
