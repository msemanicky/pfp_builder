import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
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
          <CardTitle className="text-2xl">{t('privacy.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('privacy.last_updated')}</p>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section>
            <h3 className="text-lg font-semibold text-foreground">{t('privacy.overview_title')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('privacy.overview_text')}</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground">{t('privacy.data_collection_title')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('privacy.data_collection_text')}</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground">{t('privacy.data_storage_title')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('privacy.data_storage_text')}</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground">{t('privacy.cookies_title')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('privacy.cookies_text')}</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground">{t('privacy.third_party_title')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('privacy.third_party_text')}</p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-foreground">{t('privacy.changes_title')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('privacy.changes_text')}</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;
