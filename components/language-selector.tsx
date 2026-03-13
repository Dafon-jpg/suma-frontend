"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

const LANGUAGES = [
    { code: "es", label: "AR", full: "Español" },
    { code: "pt", label: "BR", full: "Português" },
    { code: "en", label: "US", full: "English" },
]

export function LanguageSelector() {
    const { i18n } = useTranslation()
    const [open, setOpen] = React.useState(false)
    const ref = React.useRef<HTMLDivElement>(null)

    // Close on outside click
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0]

    return (
        <div ref={ref} className="relative">
            {/* Trigger button */}
            <button
                onClick={() => setOpen(!open)}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200",
                    "text-sm font-heading font-semibold",
                    "hover:shadow-md hover:border-[#2A87CF]/40",
                    open
                        ? "border-[#2A87CF] bg-[#2A87CF]/5 dark:bg-[#2A87CF]/10 text-[#2A87CF]"
                        : "border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200"
                )}
            >
                {/* Globe icon */}
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4"
                >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span>{current.label}</span>
                {/* Chevron */}
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={cn("w-3.5 h-3.5 transition-transform duration-200", open && "rotate-180")}
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 mt-2 w-36 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-slate-950/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {LANGUAGES.map((lang) => {
                        const isActive = i18n.language === lang.code
                        return (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    i18n.changeLanguage(lang.code)
                                    setOpen(false)
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-heading font-semibold transition-colors duration-150",
                                    isActive
                                        ? "text-[#2A87CF] bg-[#2A87CF]/5 dark:bg-[#2A87CF]/10"
                                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                                )}
                            >
                                <span className="font-extrabold">{lang.label}</span>
                                <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">{lang.full}</span>
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
