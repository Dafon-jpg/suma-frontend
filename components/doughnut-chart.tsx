"use client"

import * as React from "react"

interface ChartSegment {
    label: string
    value: number
    color: string
    emoji: string
}

interface DoughnutChartProps {
    key?: React.Key
    segments: ChartSegment[]
    size?: number
    selectedCategory?: string | null
    onCategoryClick?: (label: string | null) => void
}

export function DoughnutChart({
    segments,
    size = 220,
    selectedCategory,
    onCategoryClick,
}: DoughnutChartProps) {
    const [mounted, setMounted] = React.useState(false)
    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
    const total = segments.reduce((sum, s) => sum + s.value, 0)
    const radius = 80
    const strokeWidth = 32
    const center = size / 2
    const circumference = 2 * Math.PI * radius

    React.useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 100)
        return () => clearTimeout(timer)
    }, [])

    const hasData = total > 0

    // Build segments with accumulated offsets
    const segmentArcs = React.useMemo(() => {
        let acc = 0
        return segments.map((segment) => {
            const percentage = segment.value / total
            const dashLength = circumference * percentage
            const dashGap = circumference - dashLength
            const offset = circumference * acc
            acc += percentage
            return { dashLength, dashGap, offset }
        })
    }, [segments, total, circumference])

    const handleSegmentClick = (label: string) => {
        if (!onCategoryClick) return
        onCategoryClick(selectedCategory === label ? null : label)
    }

    // Determine display values for center
    const centerLabel = hoveredIndex !== null ? segments[hoveredIndex]?.label : "Total"
    const centerValue =
        hoveredIndex !== null
            ? segments[hoveredIndex]?.value
            : selectedCategory
                ? segments.find((s) => s.label === selectedCategory)?.value ?? total
                : total

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="cursor-pointer"
                >
                    {/* Background circle */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        className="stroke-slate-200 dark:stroke-slate-700"
                        strokeWidth={strokeWidth}
                    />
                    {/* Segments */}
                    {hasData &&
                        segments.map((segment, i) => {
                            const arc = segmentArcs[i]
                            const isHovered = hoveredIndex === i
                            const isSelected = selectedCategory === segment.label
                            const isDimmed =
                                selectedCategory !== null &&
                                selectedCategory !== undefined &&
                                !isSelected

                            return (
                                <circle
                                    key={i}
                                    cx={center}
                                    cy={center}
                                    r={radius}
                                    fill="none"
                                    stroke={segment.color}
                                    strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                                    strokeDasharray={
                                        mounted
                                            ? `${arc.dashLength} ${arc.dashGap}`
                                            : `0 ${circumference}`
                                    }
                                    strokeDashoffset={mounted ? -arc.offset : 0}
                                    strokeLinecap="butt"
                                    className="transition-all duration-300 ease-out"
                                    style={{
                                        transform: "rotate(-90deg)",
                                        transformOrigin: "center",
                                        opacity: isDimmed ? 0.35 : 1,
                                        cursor: "pointer",
                                    }}
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    onClick={() => handleSegmentClick(segment.label)}
                                />
                            )
                        })}
                </svg>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs text-muted-foreground transition-all duration-200">
                        {hoveredIndex !== null ? segments[hoveredIndex]?.emoji : ""}{" "}
                        {centerLabel}
                    </span>
                    <span className="text-lg font-bold text-slate-900 dark:text-slate-50 transition-all duration-200">
                        ${centerValue.toLocaleString("es-AR")}
                    </span>
                </div>
            </div>

            {/* Legend */}
            {hasData ? (
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {segments.map((segment, i) => {
                        const pct = ((segment.value / total) * 100).toFixed(0)
                        const isEmpty = segment.value === 0
                        const isHovered = hoveredIndex === i
                        const isSelected = selectedCategory === segment.label

                        return (
                            <div
                                key={i}
                                className={`flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer transition-all duration-200
                  ${isHovered || isSelected ? "bg-blue-50 dark:bg-blue-950/40" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}
                `}
                                onMouseEnter={() => setHoveredIndex(i)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                onClick={() => handleSegmentClick(segment.label)}
                            >
                                <span
                                    className="inline-block h-3 w-3 rounded-full shrink-0 transition-transform duration-200"
                                    style={{
                                        backgroundColor: segment.color,
                                        transform: isHovered ? "scale(1.3)" : "scale(1)",
                                    }}
                                />
                                <span
                                    className={`transition-colors duration-200 ${isHovered || isSelected
                                        ? "text-[#2A87CF] font-medium"
                                        : "text-muted-foreground"
                                        }`}
                                >
                                    {segment.emoji} {segment.label}
                                </span>
                                {isEmpty ? (
                                    <span className="ml-auto text-xs text-green-600 dark:text-green-400 font-medium">
                                        ✨ ¡Sin fugas!
                                    </span>
                                ) : (
                                    <span
                                        className={`ml-auto font-medium transition-colors duration-200 ${isHovered || isSelected
                                            ? "text-[#2A87CF]"
                                            : "text-slate-900 dark:text-slate-50"
                                            }`}
                                    >
                                        {pct}%
                                    </span>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-sm text-center text-green-600 dark:text-green-400 font-medium max-w-[260px]">
                    ¡Excelente! En esta categoría no hubo fugas este mes. ¡Suma puntos
                    para tu ahorro! 🌲
                </p>
            )}
        </div>
    )
}
