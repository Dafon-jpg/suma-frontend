"use client"

import * as React from "react"
import { motion } from "framer-motion"

interface BarDataPoint {
  label: string
  value: number
  isFuture?: boolean
}

interface SavingsBarChartProps {
  data: BarDataPoint[]
  privacyMode?: boolean
  currencySymbol?: string
  anticipationText?: string
}

export function SavingsBarChart({ data, privacyMode, currencySymbol = "$", anticipationText }: SavingsBarChartProps) {
  const realValues = data.filter(d => !d.isFuture).map(d => d.value)
  const max = Math.max(...realValues, 1)

  // Y-axis scale: 4 gridlines
  const gridSteps = 4
  const stepValue = Math.ceil(max / gridSteps / 100) * 100 || 1
  const yMax = stepValue * gridSteps

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-center">
        <p className="text-slate-400 dark:text-slate-500 text-sm">
          No hay datos de ahorro para mostrar
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="flex" style={{ height: "220px" }}>
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between pr-2 py-1" style={{ width: "50px" }}>
          {Array.from({ length: gridSteps + 1 }, (_, i) => {
            const val = yMax - (i * stepValue)
            const label = val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toString()
            return (
              <span key={i} className={`text-[9px] text-slate-400 dark:text-slate-500 text-right ${privacyMode ? "blur-[4px] select-none" : ""}`}>{label}</span>
            )
          })}
        </div>

        {/* Chart area */}
        <div className="flex-1 relative">
          {/* Grid lines */}
          {Array.from({ length: gridSteps + 1 }, (_, i) => (
            <div
              key={i}
              className="absolute w-full border-t border-slate-100 dark:border-slate-800"
              style={{ top: `${(i / gridSteps) * 100}%` }}
            />
          ))}

          {/* Bars */}
          <div className="flex items-end gap-1.5 h-full px-1 relative z-10">
            {data.map((item, i) => {
              const percentage = yMax > 0 ? (item.value / yMax) * 100 : 0
              const isNextMonth = item.isFuture && i === data.findIndex(d => d.isFuture)

              return (
                <div key={item.label} className="flex-1 flex flex-col items-center gap-1 min-w-0 h-full justify-end">
                  {/* Anticipation text for next month */}
                  {isNextMonth && anticipationText && (
                    <div className="absolute -top-1 left-0 right-0 flex justify-center pointer-events-none" style={{ zIndex: 20 }}>
                      <span className="text-[9px] text-suma-blue font-medium bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full whitespace-nowrap max-w-[200px] truncate text-center">
                        {anticipationText}
                      </span>
                    </div>
                  )}
                  {/* Value label */}
                  {!item.isFuture && item.value > 0 && (
                    <span className={`text-[9px] font-bold text-suma-blue whitespace-nowrap mb-0.5 ${privacyMode ? "blur-[5px] select-none" : ""}`}>
                      {currencySymbol}{item.value >= 1000 ? `${(item.value / 1000).toFixed(1)}k` : item.value.toLocaleString("es-AR")}
                    </span>
                  )}
                  {/* Bar or placeholder */}
                  {item.isFuture ? (
                    <div
                      className="w-full max-w-[28px] rounded-t-md border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30"
                      style={{ height: "40%" }}
                    />
                  ) : (
                    <motion.div
                      className="w-full max-w-[28px] rounded-t-md"
                      style={{
                        background: item.value > 0
                          ? "linear-gradient(to top, #2A87CF, #60b5f7)"
                          : "#e2e8f0",
                      }}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(percentage, item.value > 0 ? 4 : 2)}%` }}
                      transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
                    />
                  )}
                  {/* X-axis label */}
                  <span className={`text-[9px] truncate w-full text-center mt-1 ${item.isFuture ? "text-slate-300 dark:text-slate-600" : "text-slate-400 dark:text-slate-500"}`}>
                    {item.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
