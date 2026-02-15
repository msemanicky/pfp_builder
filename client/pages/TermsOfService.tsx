import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('not_found.return_button')}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('terms.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('terms.last_updated')}</p>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section>
            <h3 className="text-lg font-semibold text-foreground">{t('terms.acceptance_title')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('terms.acceptance_text')}</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground">{t('terms.description_title')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('terms.description_text')}</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground">{t('terms.disclaimer_title')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('terms.disclaimer_text')}</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground">{t('terms.no_advice_title')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('terms.no_advice_text')}</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground">{t('terms.liability_title')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('terms.liability_text')}</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground">{t('terms.use_title')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('terms.use_text')}</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground">{t('terms.changes_title')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('terms.changes_text')}</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsOfService;
