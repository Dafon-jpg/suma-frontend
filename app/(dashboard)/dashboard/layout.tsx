import { dashboardConfig } from "@/config/dashboard"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { I18nProvider } from "@/components/i18n-provider"
import { LanguageSelector } from "@/components/language-selector"

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <I18nProvider>
      <div className="flex min-h-screen flex-col bg-[#FEFEFE] dark:bg-slate-950">
        <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <div className="container flex h-16 items-center justify-between py-4">
            <MainNav items={dashboardConfig.mainNav} />
            <LanguageSelector />
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <SiteFooter className="border-t border-slate-200 dark:border-slate-800" />
      </div>
    </I18nProvider>
  )
}
