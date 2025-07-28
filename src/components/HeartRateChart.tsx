import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";

interface HeartRateData {
  timestamp: number;
  bpm: number;
}

interface HeartRateChartProps {
  data: HeartRateData[];
  currentZone: 'relaxed' | 'elevated' | 'anxious';
}

const getZoneColor = (zone: string) => {
  switch (zone) {
    case "relaxed":
      return "hsl(var(--relaxed))";
    case "elevated":
      return "hsl(var(--elevated))";
    case "anxious":
      return "hsl(var(--anxious))";
    default:
      return "hsl(var(--primary))";
  }
};

const getZone = (bpm: number) => {
  if (bpm > 85) return "anxious";
  if (bpm > 70) return "elevated";
  return "relaxed";
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) return null;
  const bpm = payload[0].value;
  const zone = getZone(bpm);
  const color = getZoneColor(zone);
  return (
    <div className="p-2 rounded-md border bg-card shadow-md text-sm space-y-1 min-w-[140px]">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Heart Rate</span>
        <span className="font-semibold">{bpm} BPM</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Zone</span>
        <span className="font-semibold" style={{ color }}>
          {zone.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export function HeartRateChart({ data, currentZone }: HeartRateChartProps) {
  const chartData = data.map((point, index) => ({
    time: index, // seconds since start
    bpm: point.bpm,
  }));

  return (
    <div className="h-64">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            >
              <Label
                value="Time (s)"
                offset={-5}
                position="insideBottom"
                style={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
            </XAxis>
            <YAxis
              domain={[50, 120]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            >
              <Label
                value="BPM"
                angle={-90}
                offset={10}
                position="insideLeft"
                style={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
            </YAxis>
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="bpm"
              stroke={getZoneColor(currentZone)}
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 6,
                fill: getZoneColor(currentZone),
                stroke: "hsl(var(--background))",
                strokeWidth: 2,
              }}
            />
            {/* Zone reference lines */}
            <Line
              type="monotone"
              dataKey={() => 70}
              stroke="hsl(var(--relaxed))"
              strokeDasharray="5 5"
              strokeWidth={1}
              dot={false}
              activeDot={false}
            />
            <Line
              type="monotone"
              dataKey={() => 90}
              stroke="hsl(var(--elevated))"
              strokeDasharray="5 5"
              strokeWidth={1}
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full flex items-center justify-center text-muted-foreground">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            </div>
            <p className="text-sm">Start a session to see your heart rate trend</p>
          </div>
        </div>
      )}
    </div>
  );
}
