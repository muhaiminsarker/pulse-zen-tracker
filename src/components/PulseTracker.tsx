// PulseTracker.tsx
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Play, Square, Settings, Clock, ActivitySquare } from "lucide-react";
import { HeartRateChart } from "./HeartRateChart";
import { BreathingGuide } from "./BreathingGuide";
import { SessionSummary } from "./SessionSummary";
import { SessionHistory } from "./SessionHistory";
import { useToast } from "@/hooks/use-toast";
import { io, Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:5000");

type HeartRateZone = "relaxed" | "elevated" | "anxious";

interface HeartRateData {
  timestamp: number;
  bpm: number;
}

interface SessionRecord {
  id: string;
  type: "simulated" | "live";
  finalZone: HeartRateZone;
  startTime: number;
  averageBpm: number;
  durationSec: number;
  timeInZones: {
    relaxed: number;
    elevated: number;
    anxious: number;
  };
}

export function PulseTracker() {
  const [currentBpm, setCurrentBpm] = useState<number>(72);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSimulated, setIsSimulated] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [heartRateData, setHeartRateData] = useState<HeartRateData[]>([]);
  const [sessionData, setSessionData] = useState<SessionRecord | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>([]);
  const { toast } = useToast();

  function getHeartRateZone(bpm: number): HeartRateZone {
    if (bpm > 85) return "anxious";
    if (bpm > 70) return "elevated";
    return "relaxed";
  }

  const currentZone = getHeartRateZone(currentBpm);

  const getZoneStyles = useCallback((zone: HeartRateZone) => {
    switch (zone) {
      case "relaxed":
        return "zone-relaxed text-relaxed-foreground";
      case "elevated":
        return "zone-elevated text-elevated-foreground";
      case "anxious":
        return "zone-anxious text-anxious-foreground";
    }
  }, []);

  useEffect(() => {
    const handleBpm = (bpm: number) => {
      setCurrentBpm(bpm);
      if (isSessionActive) {
        const newDataPoint: HeartRateData = {
          timestamp: Date.now(),
          bpm,
        };
        setHeartRateData((prev) => [...prev.slice(-29), newDataPoint]);
      }
    };
    socket.on("bpm", handleBpm);
    return () => socket.off("bpm", handleBpm);
  }, [isSessionActive]);

  const startSession = () => {
    setIsSessionActive(true);
    setSessionStartTime(Date.now());
    setHeartRateData([]);
    setSessionData(null);
    socket.emit("toggleSession", true);

    toast({
      title: "Session Started",
      description: "Begin your relaxation session. Focus on your breathing.",
    });
  };

  const endSession = () => {
    if (!sessionStartTime) return;

    const durationSec = Math.round((Date.now() - sessionStartTime) / 1000);
    const averageBpm =
      heartRateData.reduce((sum, point) => sum + point.bpm, 0) /
        heartRateData.length || 0;

    const timeInZones = heartRateData.reduce(
      (acc, point) => {
        const zone = getHeartRateZone(point.bpm);
        acc[zone]++;
        return acc;
      },
      { relaxed: 0, elevated: 0, anxious: 0 }
    );

    const finalZone = getHeartRateZone(currentBpm);

    const session: SessionRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: isSimulated ? "simulated" : "live",
      finalZone,
      startTime: sessionStartTime,
      averageBpm: Math.round(averageBpm),
      durationSec,
      timeInZones,
    };

    setSessionData(session);
    setSessionHistory((prev) => [session, ...prev]);

    setIsSessionActive(false);
    setSessionStartTime(null);
    socket.emit("toggleSession", false);

    toast({
      title: "Session Complete",
      description: `Your ${Math.round(durationSec / 60)}-minute session is complete.`,
    });
  };

  return (
    <div className="min-h-screen p-4 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">CalmPulse</h1>
        <p className="text-muted-foreground">Heart rate monitoring with mindful awareness</p>
      </div>

      {/* Live and Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Heart className="h-5 w-5" />
              Live BPM
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className={`text-6xl font-bold ${getZoneStyles(currentZone)}`}>{currentBpm}</div>
            <Badge variant="secondary" className={`text-sm px-4 py-2 ${getZoneStyles(currentZone)} border-0`}>
              {currentZone.toUpperCase()}
            </Badge>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Mode: {isSimulated ? "Simulated" : "Live ECG"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newMode = !isSimulated;
                  setIsSimulated(newMode);
                  socket.emit("setMode", newMode ? "sim" : "live");
                }}
                className="w-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                Switch to {isSimulated ? "Live" : "Simulated"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ActivitySquare className="h-5 w-5" />
              Heart Rate Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HeartRateChart data={heartRateData} currentZone={currentZone} />
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Session Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <Button onClick={startSession} disabled={isSessionActive} className="flex-1" size="lg">
                <Play className="h-4 w-4 mr-2" />
                Start Session
              </Button>
              <Button
                onClick={endSession}
                disabled={!isSessionActive}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                <Square className="h-4 w-4 mr-2" />
                End Session
              </Button>
            </div>

            {isSessionActive && sessionStartTime && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Session Duration</span>
                  <span>
                    {Math.floor((Date.now() - sessionStartTime) / 60000)}:
                    {String(Math.floor(((Date.now() - sessionStartTime) % 60000) / 1000)).padStart(2, "0")}
                  </span>
                </div>
                <Progress value={((Date.now() - sessionStartTime) % 300000) / 3000} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        <BreathingGuide isActive={isSessionActive} currentZone={currentZone} />
      </div>

{sessionData && (
  <SessionSummary
    data={{
      duration: sessionData.durationSec,
      averageBpm: sessionData.averageBpm,
      timeInZones: sessionData.timeInZones,
    }}
  />
)}
      <SessionHistory records={sessionHistory} />
    </div>
  );
}