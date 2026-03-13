"use client"

import * as React from "react"
import { motion } from "framer-motion"
import useMeasure from "react-use-measure"

interface AnimatedTabsProps {
  tabs: string[]
  activeTab: number
  onChange: (index: number) => void
}

export function AnimatedTabs({ tabs, activeTab, onChange }: AnimatedTabsProps) {
  const buttonRefs = React.useRef<(HTMLButtonElement | null)[]>([])
  const [containerRef, containerBounds] = useMeasure()
  const [indicatorStyle, setIndicatorStyle] = React.useState({ left: 0, width: 0 })

  React.useEffect(() => {
    const el = buttonRefs.current[activeTab]
    if (el && containerBounds.width > 0) {
      const containerLeft = containerBounds.left
      const rect = el.getBoundingClientRect()
      setIndicatorStyle({
        left: rect.left - containerLeft,
        width: rect.width,
      })
    }
  }, [activeTab, containerBounds])

  return (
    <div
      ref={containerRef}
      className="relative flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 p-1"
    >
      {/* Animated pill background */}
      <motion.div
        className="absolute top-1 bottom-1 rounded-lg bg-white dark:bg-slate-700 shadow-sm"
        animate={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        style={{ zIndex: 0 }}
      />

      {tabs.map((tab, i) => (
        <button
          key={tab}
          ref={(el) => { buttonRefs.current[i] = el }}
          onClick={() => onChange(i)}
          className={`relative z-10 flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 whitespace-nowrap ${
            activeTab === i
              ? "text-suma-blue"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
