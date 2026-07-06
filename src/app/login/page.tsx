"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Sparkles, Chrome, UserRound, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BackgroundFX } from "@/components/dashboard/background-fx";

export default function LoginPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleLogin(provider: "google" | "guest" | "demo") {
    setLoading(provider);
    await signIn(provider, { callbackUrl: "/overview" });
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4">
      <BackgroundFX />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="w-full max-w-md p-8">
          <div className="flex items-center gap-2 justify-center mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">Nexus OS</span>
          </div>

          <h1 className="text-xl font-semibold text-center text-foreground mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground text-center mb-8">Sign in to access your business digital twin.</p>

          <div className="space-y-3">
            <Button className="w-full" variant="secondary" onClick={() => handleLogin("google")} disabled={loading !== null}>
              <Chrome className="h-4 w-4" /> {loading === "google" ? "Redirecting…" : "Continue with Google"}
            </Button>
            <Button className="w-full" onClick={() => handleLogin("demo")} disabled={loading !== null}>
              <PlayCircle className="h-4 w-4" /> {loading === "demo" ? "Loading…" : "Try Demo Mode"}
            </Button>
            <Button className="w-full" variant="outline" onClick={() => handleLogin("guest")} disabled={loading !== null}>
              <UserRound className="h-4 w-4" /> {loading === "guest" ? "Loading…" : "Continue as Guest"}
            </Button>
          </div>

          <p className="text-[11px] text-muted-foreground text-center mt-6">
            Google login requires OAuth credentials configured in <code>.env.local</code>. Demo and Guest modes work instantly.
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
