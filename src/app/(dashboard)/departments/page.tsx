"use client";

import { useBusinessStore } from "@/lib/store/business-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DigitalTwin3DClient as DigitalTwin3D } from "@/components/twin/digital-twin-3d-client";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function DepartmentsPage() {
  const departments = useBusinessStore((s) => s.current.departments);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Departments</h1>
        <p className="text-sm text-muted-foreground mt-1">Every department is a connected node in the digital twin.</p>
      </div>

      <Card className="h-[420px] overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle>3D Department Graph</CardTitle>
          <CardDescription>Drag to rotate. Node size and color reflect department health.</CardDescription>
        </CardHeader>
        <div className="h-[340px]">
          <DigitalTwin3D departments={departments} />
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <Card key={dept.id} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">{dept.label}</h3>
              <Badge variant={dept.score >= 65 ? "success" : dept.score >= 40 ? "warning" : "danger"}>
                {dept.trend === "up" ? <TrendingUp className="h-3 w-3" /> : dept.trend === "down" ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                {Math.round(dept.score)}
              </Badge>
            </div>
            <Progress value={dept.score} className="mb-3" />
            <p className="text-sm text-muted-foreground">{dept.summary}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
