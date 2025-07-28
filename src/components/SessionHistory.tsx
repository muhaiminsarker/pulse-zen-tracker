import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";

interface SessionRecord {
  id: string;
  type: 'simulated' | 'live';
  finalZone: 'relaxed' | 'elevated' | 'anxious';
  startTime: number;
  averageBpm: number;
  durationSec: number;
}

interface SessionHistoryProps {
  records?: SessionRecord[];
}

export function SessionHistory({ records = [] }: SessionHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Session History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {records.length === 0 ? (
          <div className="text-muted-foreground text-sm">No sessions recorded yet.</div>
        ) : (
          <ul className="space-y-3">
            {records
              .slice()
              .reverse()
              .map((record) => (
                <li key={record.id} className="text-sm p-3 rounded-md border bg-muted/50">
                  <div className="flex justify-between items-center font-medium">
                    <span>
                      {record.type === 'simulated' ? 'Simulated' : 'Live ECG'} —{" "}
                      {record.finalZone.toUpperCase()}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(record.startTime).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1 text-muted-foreground text-xs">
                    Avg BPM: <span className="font-medium">{record.averageBpm}</span> | Duration:{" "}
                    {record.durationSec}s
                  </div>
                </li>
              ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
