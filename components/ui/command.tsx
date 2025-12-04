"use client"

import React from "react"

type CommandDialogProps = {
  open: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
  className?: string
}

export function CommandDialog({ open, onOpenChange, children, className }: CommandDialogProps) {
  if (!open) return null

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.3)",
          zIndex: 50,
        }}
        onClick={() => onOpenChange?.(false)}
      />
      <div
        className={className}
      >
        {children}
      </div>
    </>
  )
}

type CommandInputProps = {
  value: string
  onValueChange?: (v: string) => void
  placeholder?: string
  className?: string
}

export function CommandInput({ value, onValueChange, placeholder, className }: CommandInputProps) {
  return (
    <input
      className={className}
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      placeholder={placeholder}
      autoFocus
    />
  )
}

type CommandListProps = {
  children?: React.ReactNode
  className?: string
}

export function CommandList({ children, className }: CommandListProps) {
  return <div className={className}>{children}</div>
}

type CommandEmptyProps = {
  children?: React.ReactNode
  className?: string
}

export function CommandEmpty({ children, className }: CommandEmptyProps) {
  return <div className={className}>{children}</div>
}
