"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useFilter } from "@/context/filter-context"
import Link from "next/link"

export function Sidebar() {
  return (
    <>
      <div className="hidden md:block">
        <div className="w-64 p-4" />
      </div>
      <Sheet>
        <SheetContent side="left" className="w-[320px] sm:w-[400px]" />
      </Sheet>
    </>
  )
}

