import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Heart, TrendingUp, Lightbulb } from "lucide-react";

interface SessionData {
  duration: number;
  averageBpm: number;
  timeInZones: {
    relaxed: number;
    elevated: number;
    anxious: number;
  };
}

interface SessionSummaryProps {
  data: SessionData;
}

export function SessionSummary({ data }: SessionSummaryProps) {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const timeInZones = data.timeInZones || { relaxed: 0, elevated: 0, anxious: 0 };
  const totalTime = timeInZones.relaxed + timeInZones.elevated + timeInZones.anxious;

  const getZonePercentage = (time: number) => {
    return totalTime > 0 ? Math.round((time / totalTime) * 100) : 0;
  };

  const generateFeedback = () => {
    const relaxedPercentage = getZonePercentage(timeInZones.relaxed);
    const anxiousPercentage = getZonePercentage(timeInZones.anxious);

    if (relaxedPercentage >= 70) {
      return {
        type: "excellent",
        message: "Excellent! You maintained a relaxed state throughout most of your session.",
        tip: "Keep up the great work with your breathing techniques."
      };
    } else if (anxiousPercentage >= 50) {
      return {
        type: "needs-improvement",
        message: "Your heart rate was elevated during much of the session.",
        tip: "Try focusing on slower, deeper breaths. Consider extending your exhale phase."
      };
    } else {
      return {
        type: "good",
        message: "Good session! You showed a balanced heart rate pattern.",
        tip: "Continue practicing mindful breathing to improve consistency."
      };
    }
  };

  const feedback = generateFeedback();

  return (
    <Card className="border-2 border-primary/20 bg-primary-light/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Session Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Duration</span>
            </div>
            <div className="text-2xl font-bold">{formatDuration(data.duration)}</div>
          </div>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Avg BPM</span>
            </div>
            <div className="text-2xl font-bold">{data.averageBpm}</div>
          </div>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Dominant Zone</span>
            </div>
            <div className="text-lg font-medium">
              {getZonePercentage(timeInZones.relaxed) >= 50 ? (
                <Badge className="zone-relaxed text-relaxed-foreground border-0">Relaxed</Badge>
              ) : getZonePercentage(timeInZones.elevated) >= 50 ? (
                <Badge className="zone-elevated text-elevated-foreground border-0">Elevated</Badge>
              ) : (
                <Badge className="zone-anxious text-anxious-foreground border-0">Anxious</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Zone Breakdown */}
        <div className="space-y-4">
          <h4 className="font-medium">Time in Heart Rate Zones</h4>

          {(['relaxed', 'elevated', 'anxious'] as const).map(zone => (
            <div className="space-y-2" key={zone}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-${zone}`}></div>
                  <span className="text-sm capitalize">
                    {zone} {zone === 'relaxed' ? '(<70 BPM)' : zone === 'elevated' ? '(70–90 BPM)' : '(>90 BPM)'}
                  </span>
                </div>
                <span className="text-sm font-medium">{getZonePercentage(timeInZones[zone])}%</span>
              </div>
              <Progress value={getZonePercentage(timeInZones[zone])} className="h-2" />
            </div>
          ))}
        </div>

        {/* Feedback */}
        <div
          className={`p-4 rounded-lg border-l-4 ${
            feedback.type === 'excellent'
              ? 'bg-relaxed-light border-relaxed'
              : feedback.type === 'needs-improvement'
              ? 'bg-anxious-light border-anxious'
              : 'bg-elevated-light border-elevated'
          }`}
        >
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 mt-0.5 text-primary" />
            <div className="space-y-1">
              <p className="font-medium text-sm">{feedback.message}</p>
              <p className="text-xs text-muted-foreground">{feedback.tip}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}