import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HeartRateData {
  timestamp: number;
  bpm: number;
}

interface HeartRateChartProps {
  data: HeartRateData[];
  currentZone: 'relaxed' | 'elevated' | 'anxious';
}

export function HeartRateChart({ data, currentZone }: HeartRateChartProps) {
  // Format data for chart
  const chartData = data.map((point, index) => ({
    time: index,
    bpm: point.bpm,
  }));

  // Zone color mapping
  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'relaxed': return 'hsl(var(--relaxed))';
      case 'elevated': return 'hsl(var(--elevated))';
      case 'anxious': return 'hsl(var(--anxious))';
      default: return 'hsl(var(--primary))';
    }
  };

  const formatTooltip = (value: any, name: string) => {
    if (name === 'bpm') {
      return [`${value} BPM`, 'Heart Rate'];
    }
    return [value, name];
  };

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
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              domain={[50, 120]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              formatter={formatTooltip}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Line 
              type="monotone" 
              dataKey="bpm" 
              stroke={getZoneColor(currentZone)}
              strokeWidth={3}
              dot={false}
              activeDot={{ 
                r: 6, 
                fill: getZoneColor(currentZone),
                stroke: 'hsl(var(--background))',
                strokeWidth: 2
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