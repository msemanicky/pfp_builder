import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useFinance } from "@/context/FinanceContext";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, Download, Upload, Trash2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { exportData, importData, clearData } = useFinance();
  const { i18n, t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "sk", name: "Slovenčina" },
  ];

  const navItems = [
    { path: "/", label: t("nav.home") },
    { path: "/financial-input", label: t("nav.financial_input") },
    { path: "/savings-strategies", label: t("nav.savings_strategies") },
    { path: "/charts", label: t("nav.charts") },
    { path: "/investment", label: t("nav.investment") },
  ];

  const handleExport = () => {
    const jsonData = exportData();
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/json;charset=utf-8," + encodeURIComponent(jsonData),
    );
    element.setAttribute(
      "download",
      `finance-data-${new Date().toISOString().split("T")[0]}.json`,
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          const success = importData(event.target.result);
          if (success) {
            const event = new CustomEvent("importSuccess");
            window.dispatchEvent(event);
          } else {
            const event = new CustomEvent("importError");
            window.dispatchEvent(event);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleClear = () => {
    if (
      window.confirm(t('layout.confirm_clear'))
    ) {
      clearData();
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path
      ? "text-primary border-b-2 border-primary"
      : "text-muted-foreground hover:text-foreground";
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  ₱
                </span>
              </div>
              <div className="hidden sm:flex flex-col">
                <h1 className="text-lg font-bold text-foreground">
                  {t('app.title')}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {t('app.subtitle')}
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors",
                    isActive(item.path),
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" title={t('layout.change_language_title')}>
                    <Globe className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => i18n.changeLanguage(lang.code)}
                      className={i18n.language === lang.code ? "bg-muted" : ""}
                    >
                      {lang.name}
                      {i18n.language === lang.code && (
                        <span className="ml-2 text-primary">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Data Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" title={t('layout.export_import_title')}>
                    <Download className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" />
                    {t('layout.export_data')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleImport}>
                    <Upload className="w-4 h-4 mr-2" />
                    {t('layout.import_data')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleClear}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('layout.clear_data')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 flex flex-col gap-2 border-t border-border pt-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors rounded-md",
                    isActive(item.path),
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4 text-foreground">
                {t("app.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("app.subtitle")}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">
                {t('layout.quick_links')}
              </h4>
              <ul className="space-y-2 text-sm">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">{t('layout.resources')}</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    {t('layout.privacy_policy')}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    {t('layout.terms_of_service')}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    {t('layout.contact_us')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} {t('layout.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
