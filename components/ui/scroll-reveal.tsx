"use client"

import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
    children?: React.ReactNode
    delay?: number
    y?: number
    duration?: number
    once?: boolean
}

export function ScrollReveal({
    children,
    delay = 0,
    y = 50,
    duration = 0.5,
    once = true,
    className,
    ...props
}: ScrollRevealProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once, margin: "-100px" }}
            transition={{ duration, delay, ease: "easeOut" }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    )
}
