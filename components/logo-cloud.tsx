"use client"

import { useTranslation } from "react-i18next"
import { InfiniteSlider } from "@/components/ui/infinite-slider"

// Sizes: base 112px (+10% from 102), Supabase 130px (+10% from 118)
const LOGOS = [
    { name: "Mercado Pago", src: "/logos/mercadopago.png", height: 112 },
    { name: "Binance", src: "/logos/binance.png", height: 112 },
    { name: "Gemini", src: "/logos/gemini.png", height: 112 },
    { name: "Meta", src: "/logos/meta.png", height: 112 },
    { name: "Vercel", src: "/logos/vercel.png", height: 112 },
    { name: "Supabase", src: "/logos/supabase.png", height: 130 },
    { name: "Upstash", src: "/logos/qstash.png", height: 112 },
]

export function LogoCloud() {
    const { t } = useTranslation()

    return (
        <section className="py-16">
            <div className="container max-w-5xl mx-auto px-4">
                {/* ── Top decorative lines + heading ── */}
                <div className="flex items-center justify-center gap-4 mb-10">
                    <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-slate-300 dark:to-slate-700" />
                    <p className="text-center font-heading text-xl md:text-2xl text-slate-900 dark:text-slate-50 cursor-default">
                        {t("logoCloud.heading")}
                    </p>
                    <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-slate-300 dark:to-slate-700" />
                </div>

                {/* ── Logo carousel ── */}
                <div className="py-4">
                    <InfiniteSlider gap={100} reverse speed={25} speedOnHover={8}>
                        {LOGOS.map((logo) => (
                            <div
                                key={logo.name}
                                className="select-none shrink-0 grayscale hover:grayscale-0 dark:hover:grayscale hover:-translate-y-2 hover:scale-110 transition-all duration-500 cursor-default flex items-center dark:invert"
                                title={logo.name}
                                style={{ height: "130px" }}
                            >
                                <img
                                    src={logo.src}
                                    alt={logo.name}
                                    className="object-contain"
                                    style={{ height: `${logo.height}px`, width: "auto" }}
                                />
                            </div>
                        ))}
                    </InfiniteSlider>
                </div>

                {/* ── Bottom decorative lines (closing the frame) ── */}
                <div className="flex items-center justify-center gap-4 mt-6">
                    <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-slate-300 dark:to-slate-700" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-slate-300 dark:to-slate-700" />
                </div>
            </div>
        </section>
    )
}
