import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const NotFound = () => {
  const { t } = useTranslation();
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
            <CardTitle>{t('not_found.title')}</CardTitle>
            <CardDescription>{t('not_found.description')}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              {t('not_found.message')}
            </p>
            <Link to="/">
              <Button className="w-full">{t('not_found.return_button')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotFound;
