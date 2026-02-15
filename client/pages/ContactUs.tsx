import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Github } from "lucide-react";

const ContactUs = () => {
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
          <CardTitle className="text-2xl">{t('contact.title')}</CardTitle>
          <p className="text-muted-foreground">{t('contact.subtitle')}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <p className="text-muted-foreground leading-relaxed">{t('contact.intro')}</p>
          </section>

          <a
            href="https://github.com/msemanicky/pfp_builder"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors block"
          >
            <Github className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground">{t('contact.github_title')}</h3>
              <p className="text-sm text-muted-foreground">{t('contact.github_text')}</p>
              <p className="text-sm text-primary mt-1">github.com/msemanicky/pfp_builder</p>
            </div>
          </a>

          <section className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">{t('contact.disclaimer')}</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactUs;
