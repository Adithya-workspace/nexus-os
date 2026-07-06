"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export interface ScenarioBarDatum {
  metric: string;
  [scenarioName: string]: string | number;
}


export function ScenarioBarChart({ data, scenarioNames, colors }: { data: ScenarioBarDatum[]; scenarioNames: string[]; colors: string[] }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="metric" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: "rgba(15,15,20,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} />
        <Legend wrapperStyle={{ fontSize: 12, color: "#9ca3af" }} />
        {scenarioNames.map((name, i) => (
          <Bar key={name} dataKey={name} fill={colors[i % colors.length]} radius={[6, 6, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
