import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Play, Square, Settings } from "lucide-react";
import { HeartRateChart } from "./HeartRateChart";
import { BreathingGuide } from "./BreathingGuide";
import { SessionSummary } from "./SessionSummary";
import { useToast } from "@/hooks/use-toast";

interface HeartRateData {
  timestamp: number;
  bpm: number;
}

interface SessionData {
  duration: number;
  averageBpm: number;
  timeInZones: {
    relaxed: number;
    elevated: number;
    anxious: number;
  };
}

type HeartRateZone = 'relaxed' | 'elevated' | 'anxious';

export function PulseTracker() {
  const [currentBpm, setCurrentBpm] = useState<number>(72);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSimulated, setIsSimulated] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [heartRateData, setHeartRateData] = useState<HeartRateData[]>([]);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const { toast } = useToast();

  // Determine heart rate zone
  const getHeartRateZone = useCallback((bpm: number): HeartRateZone => {
    if (bpm < 70) return 'relaxed';
    if (bpm < 90) return 'elevated';
    return 'anxious';
  }, []);

  const currentZone = getHeartRateZone(currentBpm);

  // Zone color mapping
  const getZoneColor = useCallback((zone: HeartRateZone) => {
    switch (zone) {
      case 'relaxed': return 'relaxed';
      case 'elevated': return 'elevated';
      case 'anxious': return 'anxious';
    }
  }, []);

  // Zone styling
  const getZoneStyles = useCallback((zone: HeartRateZone) => {
    switch (zone) {
      case 'relaxed': return 'zone-relaxed text-relaxed-foreground';
      case 'elevated': return 'zone-elevated text-elevated-foreground';
      case 'anxious': return 'zone-anxious text-anxious-foreground';
    }
  }, []);

  // Simulate heart rate data
  const simulateHeartRate = useCallback(() => {
    if (!isSimulated) return;
    
    const baseRate = isSessionActive ? 75 : 72;
    const variation = Math.random() * 20 - 10; // ±10 BPM variation
    const trend = isSessionActive ? Math.sin(Date.now() / 10000) * 8 : 0; // Gentle trending
    
    const newBpm = Math.max(50, Math.min(120, baseRate + variation + trend));
    setCurrentBpm(Math.round(newBpm));
  }, [isSimulated, isSessionActive]);

  // Update heart rate data
  useEffect(() => {
    const interval = setInterval(() => {
      simulateHeartRate();
      
      if (isSessionActive) {
        const newDataPoint: HeartRateData = {
          timestamp: Date.now(),
          bpm: currentBpm,
        };
        
        setHeartRateData(prev => [...prev.slice(-29), newDataPoint]); // Keep last 30 points
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [simulateHeartRate, currentBpm, isSessionActive]);

  // Start session
  const startSession = () => {
    setIsSessionActive(true);
    setSessionStartTime(Date.now());
    setHeartRateData([]);
    setSessionData(null);
    
    toast({
      title: "Session Started",
      description: "Begin your relaxation session. Focus on your breathing.",
    });
  };

  // End session
  const endSession = () => {
    if (!sessionStartTime) return;
    
    const duration = (Date.now() - sessionStartTime) / 1000; // in seconds
    const averageBpm = heartRateData.reduce((sum, point) => sum + point.bpm, 0) / heartRateData.length || 0;
    
    // Calculate time in zones
    const timeInZones = heartRateData.reduce((acc, point) => {
      const zone = getHeartRateZone(point.bpm);
      acc[zone] += 1; // 1 second per data point
      return acc;
    }, { relaxed: 0, elevated: 0, anxious: 0 });
    
    const newSessionData: SessionData = {
      duration,
      averageBpm: Math.round(averageBpm),
      timeInZones,
    };
    
    setSessionData(newSessionData);
    setIsSessionActive(false);
    setSessionStartTime(null);
    
    toast({
      title: "Session Complete",
      description: `Your ${Math.round(duration / 60)}-minute session is complete.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-light/20 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Pulse Zen Tracker
          </h1>
          <p className="text-muted-foreground">Heart rate monitoring with mindful awareness</p>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live BPM Display */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Heart className="h-5 w-5" />
                Live BPM
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className={`text-6xl font-bold transition-all duration-500 ${getZoneStyles(currentZone)}`}>
                {currentBpm}
              </div>
              <Badge 
                variant="secondary" 
                className={`text-sm px-4 py-2 ${getZoneStyles(currentZone)} border-0`}
              >
                {currentZone.toUpperCase()}
              </Badge>
              
              {/* Mode Toggle */}
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  Mode: {isSimulated ? 'Simulated' : 'Live ECG'}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsSimulated(!isSimulated)}
                  className="w-full"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Switch to {isSimulated ? 'Live' : 'Simulated'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Heart Rate Trend */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Heart Rate Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <HeartRateChart data={heartRateData} currentZone={currentZone} />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Session Controls & Status */}
          <Card>
            <CardHeader>
              <CardTitle>Session Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Session Buttons */}
              <div className="flex gap-4">
                <Button
                  onClick={startSession}
                  disabled={isSessionActive}
                  className="flex-1"
                  size="lg"
                >
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

              {/* Session Progress */}
              {isSessionActive && sessionStartTime && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Session Duration</span>
                    <span>{Math.floor((Date.now() - sessionStartTime) / 60000)}:{String(Math.floor(((Date.now() - sessionStartTime) % 60000) / 1000)).padStart(2, '0')}</span>
                  </div>
                  <Progress 
                    value={((Date.now() - sessionStartTime) % 300000) / 3000} // 5-minute cycles
                    className="h-2"
                  />
                </div>
              )}

              {/* Status Indicator */}
              <div className="text-center">
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 ${getZoneStyles(currentZone)} ${isSessionActive ? 'breathing-orb' : 'pulse-gentle'} flex items-center justify-center`}>
                  <Heart className="h-8 w-8 text-current" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {isSessionActive ? 'Session Active' : 'Ready to Start'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Breathing Guide */}
          <BreathingGuide isActive={isSessionActive} currentZone={currentZone} />
        </div>

        {/* Session Summary */}
        {sessionData && (
          <SessionSummary data={sessionData} />
        )}

        {/* Future Feature Placeholder */}
        <Card className="border-dashed border-2 opacity-60">
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">Coming Soon</h3>
            <p className="text-sm text-muted-foreground">
              User profiles, session history, and personalized insights
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}