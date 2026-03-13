"use client"

import React from "react"
import { useTranslation } from "react-i18next"
import { TheInfiniteGrid } from "@/components/ui/the-infinite-grid"

export default function ConoceASumaPage() {
    const { t } = useTranslation()

    return (
        <div className="relative min-h-[85vh] flex items-center justify-center">
            {/* Animated grid background */}
            <TheInfiniteGrid />

            {/* Content */}
            <div className="relative z-10 container max-w-3xl mx-auto px-6 py-20">
                <div className="rounded-2xl border border-white/20 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl p-8 md:p-12 space-y-8">
                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
                        {t("about.title")}
                    </h1>

                    {/* Body paragraphs */}
                    <div className="space-y-6 text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                        <p>{t("about.p1")}</p>
                        <p>{t("about.p2")}</p>
                        <p>{t("about.p3")}</p>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <a
                            href="/dashboard"
                            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold text-white bg-[#2A87CF] hover:bg-[#1e6aa8] rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                        >
                            {t("about.cta")}
                        </a>
                        <a
                            href="/"
                            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all active:scale-[0.98]"
                        >
                            {t("about.back")}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
