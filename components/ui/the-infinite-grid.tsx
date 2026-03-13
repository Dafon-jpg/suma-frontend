"use client"

import React, { useRef } from "react"
import { cn } from "@/lib/utils"
import {
    motion,
    useMotionValue,
    useMotionTemplate,
    useAnimationFrame,
} from "framer-motion"

export function TheInfiniteGrid() {
    const containerRef = useRef<HTMLDivElement>(null)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const gridOffsetX = useMotionValue(0)
    const gridOffsetY = useMotionValue(0)

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top } = e.currentTarget.getBoundingClientRect()
        mouseX.set(e.clientX - left)
        mouseY.set(e.clientY - top)
    }

    useAnimationFrame(() => {
        gridOffsetX.set((gridOffsetX.get() + 0.4) % 40)
        gridOffsetY.set((gridOffsetY.get() + 0.4) % 40)
    })

    const maskImage = useMotionTemplate`radial-gradient(350px circle at ${mouseX}px ${mouseY}px, black, transparent)`

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className={cn(
                "absolute inset-0 overflow-hidden"
            )}
        >
            {/* Static faint grid */}
            <div className="absolute inset-0 z-0 opacity-[0.04]">
                <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
            </div>

            {/* Interactive hover grid */}
            <motion.div
                className="absolute inset-0 z-0 opacity-30"
                style={{ maskImage, WebkitMaskImage: maskImage }}
            >
                <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} />
            </motion.div>

            {/* Glow blobs — Suma blue palette */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute right-[-15%] top-[-15%] w-[35%] h-[35%] rounded-full bg-[#2A87CF]/30 dark:bg-[#2A87CF]/15 blur-[120px]" />
                <div className="absolute right-[15%] top-[-5%] w-[20%] h-[20%] rounded-full bg-[#60b5f7]/25 blur-[100px]" />
                <div className="absolute left-[-10%] bottom-[-15%] w-[35%] h-[35%] rounded-full bg-[#1e6aa8]/30 dark:bg-[#1e6aa8]/15 blur-[120px]" />
            </div>
        </div>
    )
}

function GridPattern({ offsetX, offsetY }: { offsetX: any; offsetY: any }) {
    return (
        <svg className="w-full h-full">
            <defs>
                <motion.pattern
                    id="suma-grid-pattern"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                    x={offsetX}
                    y={offsetY}
                >
                    <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-[#2A87CF]"
                    />
                </motion.pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#suma-grid-pattern)" />
        </svg>
    )
}
