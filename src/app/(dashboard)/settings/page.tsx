"use client";

import { useState } from "react";
import { useBusinessStore } from "@/lib/store/business-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { resetToBaseline, scenarios, deleteScenario } = useBusinessStore();
  const [businessName, setBusinessName] = useState("Acme Retail Co.");
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your workspace and simulation defaults.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
          <CardDescription>Displayed across the dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground/90 mb-1.5 block">Business Name</label>
            <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          </div>
          <Button
            size="sm"
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}
          >
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Get notified when risk thresholds are crossed.</CardDescription>
        </CardHeader>
        <CardContent>
          <button
            onClick={() => setNotifications((n) => !n)}
            className={`relative h-6 w-11 rounded-full transition-colors ${notifications ? "bg-violet-500" : "bg-white/10"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${notifications ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
          <span className="ml-3 text-sm text-muted-foreground align-middle">{notifications ? "Enabled" : "Disabled"}</span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Simulation Data</CardTitle>
          <CardDescription>Reset the twin or clear saved scenarios.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="secondary" size="sm" onClick={resetToBaseline}>
            <RotateCcw className="h-4 w-4" /> Reset simulation to baseline
          </Button>
          {scenarios.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-sm text-foreground/90">Saved scenarios ({scenarios.length})</p>
              {scenarios.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2">
                  <span className="text-sm text-muted-foreground">{s.name}</span>
                  <Button size="icon" variant="ghost" onClick={() => deleteScenario(s.id)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
