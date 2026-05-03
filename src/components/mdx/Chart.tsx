import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  AreaChart, Area,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

type Row = Record<string, string | number>;

export interface ChartProps {
  /** "line" | "bar" | "area" | "pie" | "radar" */
  type?: "line" | "bar" | "area" | "pie" | "radar";
  /** Array of data rows. Each row is an object: { x: "Jan", y: 10, z: 20 } */
  data: Row[];
  /** Field used for the x-axis / category. Defaults to first key. */
  x?: string;
  /** One or more numeric fields to plot. Defaults to every non-x key. */
  series?: string[];
  title?: string;
  caption?: string;
  height?: number;
  /** show grid (default true) */
  grid?: boolean;
  /** stack multiple series (bar/area only) */
  stacked?: boolean;
}

// Palette pulled from CSS tokens so charts auto-theme with light/dark.
const PALETTE = [
  "hsl(var(--accent))",
  "hsl(340 85% 60%)",
  "hsl(220 90% 60%)",
  "hsl(150 65% 50%)",
  "hsl(45 95% 55%)",
  "hsl(280 75% 65%)",
];

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--foreground))",
};
const tooltipItemStyle = { color: "hsl(var(--foreground))" };
const tooltipLabelStyle = { color: "hsl(var(--foreground))", fontWeight: 600 };

export const Chart = ({
  type = "line",
  data,
  x,
  series,
  title,
  caption,
  height = 280,
  grid = true,
  stacked = false,
}: ChartProps) => {
  const { xKey, keys } = useMemo(() => {
    if (!data || data.length === 0) return { xKey: "x", keys: [] as string[] };
    const all = Object.keys(data[0]);
    const xk = x ?? all[0];
    const ks = series ?? all.filter((k) => k !== xk);
    return { xKey: xk, keys: ks };
  }, [data, x, series]);

  if (!data || data.length === 0) {
    return (
      <div className="my-6 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Chart has no data.
      </div>
    );
  }

  const renderInner = () => {
    switch (type) {
      case "bar":
        return (
          <BarChart data={data}>
            {grid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
            <XAxis dataKey={xKey} stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} cursor={{ fill: "hsl(var(--muted) / 0.4)" }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {keys.map((k, i) => (
              <Bar
                key={k}
                dataKey={k}
                stackId={stacked ? "a" : undefined}
                fill={PALETTE[i % PALETTE.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );
      case "area":
        return (
          <AreaChart data={data}>
            <defs>
              {keys.map((k, i) => (
                <linearGradient key={k} id={`grad-${k}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            {grid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
            <XAxis dataKey={xKey} stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {keys.map((k, i) => (
              <Area
                key={k}
                dataKey={k}
                stackId={stacked ? "a" : undefined}
                stroke={PALETTE[i % PALETTE.length]}
                fill={`url(#grad-${k})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        );
      case "pie":
        return (
          <PieChart>
            <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Pie
              data={data}
              dataKey={keys[0]}
              nameKey={xKey}
              outerRadius="75%"
              innerRadius="45%"
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
          </PieChart>
        );
      case "radar":
        return (
          <RadarChart data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey={xKey} stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
            <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {keys.map((k, i) => (
              <Radar
                key={k}
                dataKey={k}
                stroke={PALETTE[i % PALETTE.length]}
                fill={PALETTE[i % PALETTE.length]}
                fillOpacity={0.25}
              />
            ))}
          </RadarChart>
        );
      case "line":
      default:
        return (
          <LineChart data={data}>
            {grid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
            <XAxis dataKey={xKey} stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {keys.map((k, i) => (
              <Line
                key={k}
                type="monotone"
                dataKey={k}
                stroke={PALETTE[i % PALETTE.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <figure className="my-8 rounded-xl border border-border bg-card/40 p-4 sm:p-5">
      {title && <h4 className="mb-1 text-sm font-semibold">{title}</h4>}
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>{renderInner()}</ResponsiveContainer>
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
