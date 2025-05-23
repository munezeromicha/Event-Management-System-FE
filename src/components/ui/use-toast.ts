// import * as React from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

const useToast = () => {
  const toast = (props: ToastProps) => {
    // Basic implementation
    console.log("Toast:", props)
  }

  return { toast }
}

export { useToast } 