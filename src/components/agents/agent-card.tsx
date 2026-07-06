"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Bot, Loader2, CheckCircle2, AlertTriangle, TrendingUp, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgentReport, AgentStatus } from "@/lib/agents/base-agent";
import { cn } from "@/lib/utils";

const severityIcon = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertTriangle,
  positive: TrendingUp,
};

const severityColor = {
  info: "text-cyan-300",
  warning: "text-amber-300",
  critical: "text-red-300",
  positive: "text-emerald-300",
};

interface AgentCardProps {
  name: string;
  role: string;
  status: AgentStatus;
  report?: AgentReport;
  onRun: () => void;
}

export function AgentCard({ name, role, status, report, onRun }: AgentCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center border", status === "running" || status === "thinking" ? "border-violet-400/50 bg-violet-500/10" : "border-white/10 bg-white/5")}>
            {status === "running" || status === "thinking" ? (
              <Loader2 className="h-5 w-5 text-violet-300 animate-spin" />
            ) : (
              <Bot className="h-5 w-5 text-violet-300" />
            )}
          </div>
          <div>
            <CardTitle>{name}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{role}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </CardHeader>
      <CardContent className="pt-0">
        <AnimatePresence mode="wait">
          {report ? (
            <motion.div key="report" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
              <p className="text-sm text-foreground/90">{report.summary}</p>
              <div className="space-y-1.5">
                {report.findings.slice(0, 3).map((f, i) => {
                  const Icon = severityIcon[f.severity];
                  return (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <Icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", severityColor[f.severity])} />
                      <span className="text-muted-foreground"><span className="text-foreground/80 font-medium">{f.label}:</span> {f.detail}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                <span>Confidence: <span className="text-foreground font-medium">{report.confidence}%</span></span>
                <span>{report.runtimeMs}ms</span>
              </div>
            </motion.div>
          ) : (
            <p className="text-sm text-muted-foreground">Not run yet. Click &quot;Run Agent&quot; to analyze current business state.</p>
          )}
        </AnimatePresence>
        <Button size="sm" variant="secondary" className="mt-4 w-full" onClick={onRun} disabled={status === "running" || status === "thinking"}>
          {status === "running" || status === "thinking" ? "Analyzing…" : report ? "Re-run Agent" : "Run Agent"}
        </Button>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: AgentStatus }) {
  if (status === "completed") return <Badge variant="success"><CheckCircle2 className="h-3 w-3" />Completed</Badge>;
  if (status === "running") return <Badge variant="info">Running…</Badge>;
  if (status === "thinking") return <Badge variant="violet">Thinking…</Badge>;
  if (status === "error") return <Badge variant="danger">Error</Badge>;
  return <Badge variant="default">Idle</Badge>;
}
