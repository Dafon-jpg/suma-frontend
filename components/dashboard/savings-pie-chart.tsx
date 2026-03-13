"use client"

import * as React from "react"

interface PieSlice {
  label: string
  value: number
  symbol: string
  color: string
}

interface SavingsPieChartProps {
  slices: PieSlice[]
  privacyMode?: boolean
}

const PIE_COLORS = [
  "#2A87CF", "#60b5f7", "#93c5fd", "#1e6aa8",
  "#38bdf8", "#7dd3fc", "#0ea5e9", "#a5d8ff",
]

export function SavingsPieChart({ slices, privacyMode }: SavingsPieChartProps) {
  const total = slices.reduce((s, sl) => s + sl.value, 0)
  if (total === 0 || slices.length < 2) return null

  const size = 200
  const cx = size / 2
  const cy = size / 2
  const r = 75
  const blurClass = privacyMode ? "blur-[6px] select-none" : ""

  let cumAngle = -90 // start from top

  const paths = slices.map((slice, i) => {
    const pct = slice.value / total
    const angle = pct * 360
    const startAngle = cumAngle
    const endAngle = cumAngle + angle
    cumAngle = endAngle

    const startRad = (startAngle * Math.PI) / 180
    const endRad = (endAngle * Math.PI) / 180
    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)
    const largeArc = angle > 180 ? 1 : 0

    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
    const color = slice.color || PIE_COLORS[i % PIE_COLORS.length]

    return (
      <path key={slice.label} d={d} fill={color} className="transition-opacity hover:opacity-80" stroke="white" strokeWidth="2" />
    )
  })

  return (
    <div className="flex flex-col items-center gap-6">
      {/* SVG Pie */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm">
        {paths}
        {/* Center label */}
        <circle cx={cx} cy={cy} r="40" fill="white" className="dark:fill-slate-900" />
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-slate-400 dark:fill-slate-500" fontSize="10" fontWeight="500">Total</text>
        <text x={cx} y={cy + 12} textAnchor="middle" className={`fill-suma-blue font-bold ${privacyMode ? "blur-sm" : ""}`} fontSize="13">{slices.length} monedas</text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
        {slices.map((slice, i) => {
          const pct = ((slice.value / total) * 100).toFixed(1)
          return (
            <div key={slice.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: slice.color || PIE_COLORS[i % PIE_COLORS.length] }} />
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{slice.symbol} {slice.label}</span>
              <span className={`text-xs font-bold text-slate-900 dark:text-slate-50 ${blurClass}`}>{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
