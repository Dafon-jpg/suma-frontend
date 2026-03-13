"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"

interface LemonSqueezyModalProps {
    open: boolean
    onClose: () => void
}

export function LemonSqueezyModal({ open, onClose }: LemonSqueezyModalProps) {
    const { t } = useTranslation()

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md mx-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
                {/* Header gradient */}
                <div className="bg-gradient-to-r from-[#2A87CF] to-[#60b5f7] px-6 py-8 text-center">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-3">
                        <span className="text-3xl">🍋</span>
                    </div>
                    <h2 className="text-xl font-bold text-white">{t("lemonSqueezy.title")}</h2>
                    <p className="text-sm text-white/80 mt-1">{t("lemonSqueezy.subtitle")}</p>
                </div>

                {/* Features */}
                <div className="px-6 py-5 space-y-3">
                    {["📊 Advanced reports & analytics", "📁 Export to Excel / CSV", "⚡ Priority support 24/7", "🌍 Multi-language dashboard"].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                            <svg className="h-4 w-4 text-[#2A87CF] shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                            </svg>
                            {feature}
                        </div>
                    ))}
                </div>

                {/* Price */}
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 text-center">
                    <span className="text-3xl font-bold text-slate-900 dark:text-slate-50">{t("pro.price")}</span>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        {t("lemonSqueezy.cancel")}
                    </button>
                    <button
                        className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl text-white bg-[#2A87CF] hover:bg-[#1e6aa8] transition-colors shadow-md"
                    >
                        {t("lemonSqueezy.button")}
                    </button>
                </div>
            </div>
        </div>
    )
}
