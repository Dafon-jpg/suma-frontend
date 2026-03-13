"use client"

import { useTranslation } from "react-i18next"

const CURRENCY_CONFIG: Record<string, { symbol: string; locale: string; code: string }> = {
    es: { symbol: "$", locale: "es-AR", code: "ARS" },
    pt: { symbol: "R$", locale: "pt-BR", code: "BRL" },
    en: { symbol: "$", locale: "en-US", code: "USD" },
}

// Conversion rates from ARS (approximate for display)
const RATES_FROM_ARS: Record<string, number> = {
    es: 1,       // ARS stays ARS
    pt: 0.005,   // ~R$1 = ~200 ARS
    en: 0.001,   // ~$1 = ~1000 ARS
}

export function useCurrency() {
    const { i18n } = useTranslation()
    const lang = i18n.language || "es"
    const config = CURRENCY_CONFIG[lang] ?? CURRENCY_CONFIG.es
    const rate = RATES_FROM_ARS[lang] ?? 1

    function formatAmount(arsAmount: number, convert = true): string {
        const amount = convert && lang !== "es" ? Math.round(arsAmount * rate) : arsAmount
        return `${config.symbol}${amount.toLocaleString(config.locale)}`
    }

    function formatPlanPrice(): string {
        if (lang === "pt") return "R$45/mês"
        if (lang === "en") return "$9/mo"
        return "$9.000/mes"
    }

    return { formatAmount, formatPlanPrice, symbol: config.symbol, locale: config.locale, code: config.code }
}
