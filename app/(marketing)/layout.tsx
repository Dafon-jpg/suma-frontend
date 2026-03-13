"use client"

import Link from "next/link"
import { I18nProvider } from "@/components/i18n-provider"
import { LanguageSelector } from "@/components/language-selector"
import { marketingConfig } from "@/config/marketing"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"
import { ShimmerButton } from "@/components/ui/shimmer-button"

interface MarketingLayoutProps {
  children: React.ReactNode
}

export default function MarketingLayout({
  children,
}: MarketingLayoutProps) {
  return (
    <I18nProvider>
      <div className="flex min-h-screen flex-col bg-white dark:bg-slate-950">
        {/* Sticky Header — clean white with subtle border */}
        <header className="sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="container flex h-16 items-center justify-between py-4">
            <MainNav items={marketingConfig.mainNav} />
            <div className="flex items-center gap-3">
              <LanguageSelector />
              <nav className="flex items-center gap-2">
                <ShimmerButton
                  background="rgba(255, 255, 255, 1)"
                  shimmerColor="#1E3A8A"
                  className="px-4 py-2 text-sm text-gray-900 border-gray-200 dark:text-gray-900 hover:-translate-y-1 transition-transform duration-300"
                  onClick={() => window.location.href = "/vincular"}
                >
                  Ingresar
                </ShimmerButton>
                <InteractiveHoverButton
                  text="Registrarse"
                  className="bg-[#2A87CF] text-white hover:bg-[#1f669e] border-none scale-90 w-36"
                  onClick={() => window.location.href = "/registro"}
                />
              </nav>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </I18nProvider>
  )
}

