"use client"

import * as React from "react"
import { motion } from "framer-motion"

interface BarDataPoint {
  label: string
  value: number
}

interface SavingsBarChartProps {
  data: BarDataPoint[]
  privacyMode?: boolean
  currencySymbol?: string
}

export function SavingsBarChart({ data, privacyMode, currencySymbol = "$" }: SavingsBarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1)

  if (data.length === 0 || data.every(d => d.value === 0)) {
    return (
      <div className="flex items-center justify-center py-12 text-center">
        <p className="text-slate-400 dark:text-slate-500 text-sm">
          No hay datos de ahorro para mostrar
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2 h-48 px-2">
      {data.map((item, i) => {
        const percentage = max > 0 ? (item.value / max) * 100 : 0
        return (
          <div key={item.label} className="flex-1 flex flex-col items-center gap-1 min-w-0">
            {/* Value */}
            <span
              className={`text-[10px] font-bold text-suma-blue whitespace-nowrap ${
                privacyMode ? "blur-[6px] select-none" : ""
              }`}
            >
              {item.value > 0 ? `${currencySymbol}${item.value.toLocaleString("es-AR")}` : "—"}
            </span>
            {/* Bar */}
            <div className="w-full flex items-end justify-center" style={{ height: "130px" }}>
              <motion.div
                className="w-full max-w-[32px] rounded-t-md"
                style={{
                  background: item.value > 0
                    ? "linear-gradient(to top, #2A87CF, #60b5f7)"
                    : "#e2e8f0",
                }}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(percentage, 4)}%` }}
                transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
              />
            </div>
            {/* Label */}
            <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate w-full text-center">
              {item.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
