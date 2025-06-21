"use client"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useState } from "react"
import { Github, Facebook } from "lucide-react"

interface SocialLoginProps {
  redirectTo?: string
}

export default function SocialLogin({ redirectTo = "/dashboard" }: SocialLoginProps) {
  const [isLoading, setIsLoading] = useState<{
    github: boolean
    facebook: boolean
  }>({
    github: false,
    facebook: false,
  })

  const handleSocialLogin = async (provider: "github" | "facebook") => {
    setIsLoading({ ...isLoading, [provider]: true })
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}${redirectTo}`,
        },
      })
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error)
    } finally {
      setIsLoading({ ...isLoading, [provider]: false })
    }
  }

  return (
    <div className="flex flex-col space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">Hoặc đăng nhập với</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" type="button" disabled={isLoading.github} onClick={() => handleSocialLogin("github")}>
          <Github className="mr-2 h-4 w-4" />
          GitHub
        </Button>
        <Button
          variant="outline"
          type="button"
          disabled={isLoading.facebook}
          onClick={() => handleSocialLogin("facebook")}
        >
          <Facebook className="mr-2 h-4 w-4" />
          Facebook
        </Button>
      </div>
    </div>
  )
}
