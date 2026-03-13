"use client"

import React from "react"
import { motion } from "framer-motion"

export function SubtleDataFlow({ children }: { children?: React.ReactNode }) {
    return (
        <div className="relative overflow-hidden w-full">
            {/* Background data flow effect */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30 dark:opacity-20">
                <motion.div
                    animate={{
                        x: ["-100%", "100%"],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: 8,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                    className="absolute top-[20%] left-0 w-[40%] h-[1px] bg-gradient-to-r from-transparent via-[#2A87CF] to-transparent blur-[1px]"
                />
                <motion.div
                    animate={{
                        x: ["-100%", "100%"],
                        opacity: [0, 0.8, 0],
                    }}
                    transition={{
                        duration: 12,
                        ease: "linear",
                        repeat: Infinity,
                        delay: 4,
                    }}
                    className="absolute top-[60%] left-0 w-[50%] h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-[1px]"
                />
                <motion.div
                    animate={{
                        x: ["100%", "-100%"],
                        opacity: [0, 0.6, 0],
                    }}
                    transition={{
                        duration: 15,
                        ease: "linear",
                        repeat: Infinity,
                        delay: 2,
                    }}
                    className="absolute top-[80%] right-0 w-[60%] h-[1px] bg-gradient-to-l from-transparent via-[#2A87CF] to-transparent blur-[2px]"
                />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full flex flex-col items-center justify-center">
                {children}
            </div>
        </div>
    )
}
