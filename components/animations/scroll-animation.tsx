"use client"

import React from "react"

import { useEffect, useRef, type ReactNode } from "react"
import { motion, useInView, useAnimation, type Variants } from "framer-motion"

interface ScrollAnimationProps {
  children: ReactNode
  delay?: number
  duration?: number
  once?: boolean
  className?: string
  animation?: "fadeIn" | "fadeUp" | "fadeLeft" | "fadeRight" | "scale" | "stagger"
  staggerChildren?: number
}

const animations: Record<string, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  fadeUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
  stagger: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
}

export function ScrollAnimation({
  children,
  delay = 0,
  duration = 0.5,
  once = true,
  className = "",
  animation = "fadeUp",
  staggerChildren = 0.1,
}: ScrollAnimationProps) {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount: 0.2 })

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    } else if (!once) {
      controls.start("hidden")
    }
  }, [isInView, controls, once])

  const selectedAnimation = animations[animation]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: delay,
        staggerChildren: animation === "stagger" ? staggerChildren : 0,
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={animation === "stagger" ? containerVariants : selectedAnimation}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {animation === "stagger"
        ? React.Children.map(children, (child, i) => (
            <motion.div key={i} variants={animations.stagger}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  )
}

