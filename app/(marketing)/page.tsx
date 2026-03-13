"use client"

import Link from "next/link"
import Image from "next/image"
import { useTranslation } from "react-i18next"
import FlipTextReveal from "@/components/next-reveal"
import { LogoCloud } from "@/components/logo-cloud"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { ScrollReveal } from "@/components/ui/scroll-reveal"
import { EnergyTimeline } from "@/components/ui/energy-timeline"
import { PricingTable, PricingFeature, PricingPlan } from "@/components/ui/pricing-table"
import { PricingCard } from "@/components/ui/pricing-card-custom"
import { SubtleDataFlow } from "@/components/ui/subtle-data-flow"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { FaqAccordion } from "@/components/ui/faq-chat-accordion"

export default function IndexPage() {
  const { t, i18n } = useTranslation()

  const timelineItems = [
    { title: t("timeline.t1Title"), body: t("timeline.t1Body") },
    { title: t("timeline.t2Title"), body: t("timeline.t2Body") },
    { title: t("timeline.t3Title"), body: t("timeline.t3Body") },
  ]

  const faqData = [
    { id: 1, question: t("landing.faq1q"), answer: t("landing.faq1a") },
    { id: 2, question: t("landing.faq2q"), answer: t("landing.faq2a") },
    { id: 3, question: t("landing.faq3q"), answer: t("landing.faq3a") },
    { id: 4, question: t("landing.faq4q"), answer: t("landing.faq4a") },
  ]

  const pricingFeatures: PricingFeature[] = [
    { name: t("landing.pf1"), included: "all" },
    { name: t("landing.pf2"), included: "all" },
    { name: t("landing.pf3"), included: "all" },
    { name: t("landing.pf4"), included: "all" },
    { name: t("landing.pf5"), included: "all" },
    { name: t("landing.pf6"), included: "all" },
    { name: t("landing.pf7"), included: "pro" },
    { name: t("landing.pf8"), included: "pro" },
  ]

  const pricingPlans: PricingPlan[] = [
    {
      name: t("landing.planFree"),
      level: "starter",
      price: { monthly: 0, yearly: 0 },
      popular: true,
    },
    {
      name: "Premium",
      level: "pro",
      price: { monthly: 9000, yearly: 90000 },
    }
  ]

  return (
    <>
      {/* ============================================= */}
      {/* 1. HERO — INICIO                              */}
      {/* ============================================= */}
      <section
        id="inicio"
        className="space-y-6 pb-[20vh] pt-[12vh] min-h-[90vh] flex flex-col justify-center items-center scroll-mt-20"
      >
        <div className="container flex max-w-[64rem] flex-col items-center justify-center gap-4 text-center mx-auto">
          {/* Avatar */}
          <div className="relative h-[166px] w-[166px] overflow-hidden rounded-full border-4 border-primary/10 mb-2 shadow-sm shrink-0">
            <Image
              src="/suma-avatar.png"
              alt="Suma Digital"
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="flex items-center gap-2 bg-sky-400/20 px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#25D366] fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {t("landing.badge")}
            </span>
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl flex flex-col items-center gap-2">
            <span className="text-[1em]">
              <FlipTextReveal key={`line1-${i18n.language}`} word={t("landing.heroLine1")} className="[&_.char]:text-[1em]" />
            </span>
            <span className="flex items-center gap-2 text-[1em]">
              <FlipTextReveal key={`line2-${i18n.language}`} word={t("landing.heroLine2")} delay={1} className="[&_.char]:text-[1em]" />
              <FlipTextReveal key={`suma-${i18n.language}`} word="Suma." className="text-primary [&_.char]:text-[1em]" delay={1.5} />
            </span>
          </h1>

          <div className="space-x-4 flex justify-center w-full animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700 fill-mode-both">
            <a
              href="#conoce-a-suma"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById("conoce-a-suma")?.scrollIntoView({ behavior: "smooth", block: "start" })
              }}
              className={cn(buttonVariants({ size: "lg" }), "transition-all hover:scale-105 hover:shadow-lg cursor-pointer")}
            >
              {t("landing.ctaConoce")}
            </a>
            <a
              href="#features"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth", block: "start" })
              }}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "transition-all hover:bg-white/60 dark:hover:bg-slate-800/60 backdrop-blur-sm cursor-pointer")}
            >
              {t("landing.ctaFeatures")}
            </a>
          </div>
        </div>
      </section>

      {/* ============================================= */}
      {/* 2. CONOCÉ A SUMA — Timeline                   */}
      {/* ============================================= */}
      <section
        id="conoce-a-suma"
        className="py-16 md:py-24 scroll-mt-20 overflow-hidden relative"
      >
        <SubtleDataFlow>
          <div className="container max-w-4xl mx-auto px-4">
            <div className="py-8 md:py-12">
              <div className="text-center mb-16">
                <h2 className="font-heading text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {t("timeline.sectionPrefix", { defaultValue: "Conocé a" })}{" "}
                  <span className="text-[#2A87CF]">Suma</span>
                </h2>
              </div>
            </div>

            <EnergyTimeline items={timelineItems} />

            <div className="mt-16">
              {/* Logo Cloud — inside Conocé a Suma but outside Grid Pattern */}
              <LogoCloud />
            </div>
          </div>
        </SubtleDataFlow>
      </section>

      {/* ============================================= */}
      {/* 3. CARACTERÍSTICAS — Features                 */}
      {/* ============================================= */}
      <ScrollReveal y={40} delay={0.2}>
        <section
          id="features"
          className="container space-y-6 py-8 md:py-12 lg:py-24 scroll-mt-20"
        >
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              {t("landing.featuresTitle")}
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              {t("landing.featuresSubtitle")}
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">

            {/* Feature Card 1 - Chat Natural */}
            <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md p-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#2A87CF]/10">
              <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
              <div className="relative z-10 flex h-[180px] flex-col justify-between rounded-lg p-6">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-10 w-10 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <div className="space-y-2">
                  <h3 className="font-bold">{t("landing.feat1Title")}</h3>
                  <p className="text-sm text-muted-foreground">{t("landing.feat1Desc")}</p>
                </div>
              </div>
            </div>

            {/* Feature Card 2 - Notas de Audio */}
            <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md p-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#2A87CF]/10">
              <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
              <div className="relative z-10 flex h-[180px] flex-col justify-between rounded-lg p-6">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-10 w-10 text-[#2A87CF]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <div className="space-y-2">
                  <h3 className="font-bold">{t("landing.feat2Title")}</h3>
                  <p className="text-sm text-muted-foreground">{t("landing.feat2Desc")}</p>
                </div>
              </div>
            </div>

            {/* Feature Card 3 - Fotos de Tickets */}
            <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md p-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#2A87CF]/10">
              <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
              <div className="relative z-10 flex h-[180px] flex-col justify-between rounded-lg p-6">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-10 w-10 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="space-y-2">
                  <h3 className="font-bold">{t("landing.feat3Title")}</h3>
                  <p className="text-sm text-muted-foreground">{t("landing.feat3Desc")}</p>
                </div>
              </div>
            </div>

            {/* Feature Card 4 - Auto-Categorización */}
            <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md p-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#2A87CF]/10">
              <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
              <div className="relative z-10 flex h-[180px] flex-col justify-between rounded-lg p-6">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-10 w-10 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <div className="space-y-2">
                  <h3 className="font-bold">{t("landing.feat4Title")}</h3>
                  <p className="text-sm text-muted-foreground">{t("landing.feat4Desc")}</p>
                </div>
              </div>
            </div>

            {/* Feature Card 5 - Dashboard Visual */}
            <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md p-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#2A87CF]/10">
              <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
              <div className="relative z-10 flex h-[180px] flex-col justify-between rounded-lg p-6">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-10 w-10 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div className="space-y-2">
                  <h3 className="font-bold">{t("landing.feat5Title")}</h3>
                  <p className="text-sm text-muted-foreground">{t("landing.feat5Desc")}</p>
                </div>
              </div>
            </div>

            {/* Feature Card 6 - Seguridad Total */}
            <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md p-2 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#2A87CF]/10">
              <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
              <div className="relative z-10 flex h-[180px] flex-col justify-between rounded-lg p-6">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-10 w-10 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="space-y-2">
                  <h3 className="font-bold">{t("landing.feat6Title")}</h3>
                  <p className="text-sm text-muted-foreground">{t("landing.feat6Desc")}</p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </ScrollReveal>

      {/* ============================================= */}
      {/* 4. PRECIOS — Pricing                          */}
      {/* ============================================= */}
      <ScrollReveal y={40} delay={0.2}>
        <section id="pricing" className="container flex flex-col gap-4 py-8 md:max-w-[64rem] md:py-12 lg:py-24 scroll-mt-20">
          <div className="mx-auto flex w-full flex-col gap-4 text-center md:max-w-[58rem]">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
              {t("landing.pricingTitle")}
            </h2>
            <p className="mx-auto max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              {t("landing.pricingSubtitle")}
            </p>
          </div>

          <PricingTable
            features={pricingFeatures}
            plans={pricingPlans}
            defaultPlan="starter"
          />

          <div className="mt-2 flex justify-center w-full max-w-3xl mx-auto px-4">
            <PricingCard
              title={t("landing.bizTitle")}
              description={t("landing.bizDesc")}
              buttonText={t("landing.bizButton")}
              features={[
                t("landing.bizFeat1"),
                t("landing.bizFeat2"),
                t("landing.bizFeat3"),
              ]}
              className="w-full border-blue-200/40 dark:border-blue-900/40 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
              isUnique={true}
            />
          </div>
        </section>
      </ScrollReveal>



      {/* FAQ */}
      <ScrollReveal y={40} delay={0.2}>
        <section id="faq" className="container py-8 md:py-12 lg:py-16 scroll-mt-20">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center mb-8">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl">
              {t("landing.faqTitle")}
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              {t("landing.faqSubtitle")}
            </p>
          </div>

          <div className="mx-auto max-w-[48rem]">
            <FaqAccordion
              data={faqData}
              timestamp={`${t("landing.today")}, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            />
          </div>
        </section>
      </ScrollReveal>
    </>
  )
}