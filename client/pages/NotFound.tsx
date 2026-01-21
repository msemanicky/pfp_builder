import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="container mx-auto px-4 py-20 min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="text-6xl font-bold text-primary mb-4">404</div>
            <CardTitle>Page Not Found</CardTitle>
            <CardDescription>The page you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              It seems you've wandered off the financial planning path. Let's get you back on track!
            </p>
            <Link to="/">
              <Button className="w-full">Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
