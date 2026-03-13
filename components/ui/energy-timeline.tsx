"use client"

import React, { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { GlowingEffect } from "@/components/ui/glowing-effect"

interface TimelineItem {
    title: string
    body: string
}

interface EnergyTimelineProps {
    items: TimelineItem[]
}

export function EnergyTimeline({ items }: EnergyTimelineProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return
            const rect = containerRef.current.getBoundingClientRect()
            const windowHeight = window.innerHeight
            const totalHeight = rect.height

            // Faster progression: reveal cards earlier as user scrolls
            const scrolled = windowHeight - rect.top
            const fraction = Math.max(0, Math.min(1, scrolled / (totalHeight + windowHeight * 0.3)))
            setProgress(fraction)
        }

        window.addEventListener("scroll", handleScroll, { passive: true })
        handleScroll()
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Gradient from light to progressively darker blue
    const barGradient = `linear-gradient(180deg, 
    rgba(42,135,207,0.15) 0%, 
    rgba(42,135,207,0.35) 20%, 
    rgba(42,135,207,0.55) 45%, 
    rgba(42,135,207,0.75) 70%, 
    rgba(30,106,168,1) 100%)`

    return (
        <div ref={containerRef} className="relative">
            {/* === CENTER NEON LINE (no dots anywhere on the line) === */}
            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                {/* Gradient bar */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-1 rounded-full transition-all duration-300 ease-out"
                    style={{
                        height: `${progress * 100}%`,
                        background: barGradient,
                        boxShadow:
                            "0 0 6px 2px rgba(42,135,207,0.4), 0 0 16px 4px rgba(42,135,207,0.2), 0 0 32px 8px rgba(42,135,207,0.1)",
                    }}
                />
            </div>

            {/* === TIMELINE ITEMS (alternating, NO dots at all) === */}
            <div className="space-y-12 md:space-y-20">
                {items.map((item, index) => {
                    const itemThreshold = (index + 0.2) / items.length
                    const isRevealed = progress > itemThreshold
                    const isRight = index % 2 === 0

                    return (
                        <div
                            key={index}
                            className={cn(
                                "relative flex items-start",
                                isRight ? "md:flex-row" : "md:flex-row-reverse"
                            )}
                        >
                            {/* Spacer */}
                            <div className="hidden md:block md:w-1/2" />

                            {/* Content card — wide, no external dots */}
                            <div
                                className={cn(
                                    "w-full md:w-1/2 px-4",
                                    isRight ? "md:pl-10" : "md:pr-10"
                                )}
                            >
                                <div
                                    className={cn(
                                        "relative rounded-2xl border p-5 md:p-6 transition-all duration-700 ease-out",
                                        isRevealed
                                            ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/60 dark:shadow-slate-900/60 -translate-y-2 opacity-100"
                                            : "bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 shadow-none translate-y-4 opacity-35"
                                    )}
                                >
                                    <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
                                    <h3
                                        className={cn(
                                            "text-lg md:text-xl lg:text-2xl font-extrabold tracking-tight mb-2 transition-colors duration-500",
                                            isRevealed ? "text-slate-900 dark:text-white" : "text-slate-300 dark:text-slate-600"
                                        )}
                                    >
                                        {item.title}
                                    </h3>
                                    <p
                                        className={cn(
                                            "text-sm md:text-[15px] leading-relaxed transition-colors duration-500",
                                            isRevealed ? "text-slate-600 dark:text-slate-300" : "text-slate-200 dark:text-slate-700"
                                        )}
                                    >
                                        {item.body}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
