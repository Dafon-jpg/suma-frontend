"use client"

import * as React from "react"
import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"
import { useTranslation } from "react-i18next"

import { MainNavItem } from "types"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { MobileNav } from "@/components/mobile-nav"

interface MainNavProps {
  items?: MainNavItem[]
  children?: React.ReactNode
}

export function MainNav({ items, children }: MainNavProps) {
  const { t } = useTranslation()
  const segment = useSelectedLayoutSegment()
  const [showMobileMenu, setShowMobileMenu] = React.useState<boolean>(false)
  const [activeSection, setActiveSection] = React.useState<string>("#inicio")

  // ScrollSpy: observe sections and highlight active nav link
  React.useEffect(() => {
    const sectionIds = items
      ?.filter((item) => item.href.startsWith("#"))
      .map((item) => item.href.replace("#", "")) ?? []

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`)
          }
        })
      },
      { rootMargin: "-20% 0px -40% 0px", threshold: 0 }
    )

    sectionIds.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  const handleSmoothScroll = (e: React.MouseEvent, href: string) => {
    e.preventDefault()
    const id = href.replace("#", "")
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className="flex gap-6 md:gap-10">
      {/* Logo — plain blue text, no icon */}
      <Link href="/" className="hidden items-center space-x-2 md:flex">
        <span className="font-bold text-lg text-[#2A87CF]">
          {siteConfig.name}
        </span>
      </Link>
      {items?.length ? (
        <nav className="hidden gap-6 md:flex">
          {items?.map((item, index) => {
            const isHashLink = item.href.startsWith("#")
            const isActive = isHashLink && activeSection === item.href

            const className = cn(
              "flex items-center text-sm font-medium transition-all duration-300",
              isActive
                ? "text-[#2A87CF] font-semibold scale-110 -translate-y-[2px] origin-bottom drop-shadow-md"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:-translate-y-[1px] hover:scale-105 hover:drop-shadow-sm",
              item.disabled && "cursor-not-allowed opacity-80"
            )

            if (isHashLink) {
              return (
                <a
                  key={index}
                  href={item.disabled ? "#" : item.href}
                  onClick={(e) => handleSmoothScroll(e, item.href)}
                  className={className}
                >
                  {t(item.title, { defaultValue: item.title })}
                </a>
              )
            }

            return (
              <Link
                key={index}
                href={item.disabled ? "#" : item.href}
                className={className}
              >
                {t(item.title, { defaultValue: item.title })}
              </Link>
            )
          })}
        </nav>
      ) : null}
      <button
        className="flex items-center space-x-2 md:hidden"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        <span className="font-bold text-[#2A87CF]">Suma</span>
        <span className="text-sm">Menu</span>
      </button>
      {showMobileMenu && items && (
        <MobileNav items={items}>{children}</MobileNav>
      )}
    </div>
  )
}
