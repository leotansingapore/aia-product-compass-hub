import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Helmet>
        <title>Page Not Found (404) - Return to Learning | FINternship</title>
        <meta name="description" content="The page you're looking for doesn't exist. Return to the FINternship Learning Platform dashboard to continue your financial advisory education and product training." />
        <meta name="keywords" content="404 error, page not found, FINternship, financial advisor training" />
        <link rel="canonical" href={`${window.location.origin}${location.pathname}`} />
        <meta name="robots" content="noindex, nofollow" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Page Not Found (404) - Return to Learning | FINternship" />
        <meta property="og:description" content="The page you're looking for doesn't exist. Return to continue your financial advisory education." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}${location.pathname}`} />
        <meta property="og:image" content={`${window.location.origin}/og-default.jpg`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Page Not Found (404) - Return to Learning | FINternship" />
        <meta name="twitter:description" content="The page you're looking for doesn't exist. Return to continue your financial advisory education." />
        <meta name="twitter:image" content={`${window.location.origin}/og-default.jpg`} />
      </Helmet>
      <div className="text-center max-w-sm">
        <h1 className="text-5xl font-bold mb-2">404</h1>
        <p className="text-muted-foreground mb-6">This page doesn't exist or may have been moved.</p>
        <div className="flex flex-col gap-2">
          <Link to="/">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
          <div className="flex gap-2">
            <Link to="/categories" className="flex-1">
              <Button variant="outline" className="w-full text-xs">Browse Products</Button>
            </Link>
            <Link to="/cmfas-exams" className="flex-1">
              <Button variant="outline" className="w-full text-xs">CMFAS Exams</Button>
            </Link>
            <Link to="/scripts" className="flex-1">
              <Button variant="outline" className="w-full text-xs">Sales Scripts</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;