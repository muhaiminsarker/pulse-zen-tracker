import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wind, Circle } from "lucide-react";

interface BreathingGuideProps {
  isActive: boolean;
  currentZone: 'relaxed' | 'elevated' | 'anxious';
}

export function BreathingGuide({ isActive, currentZone }: BreathingGuideProps) {
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [cycleCount, setCycleCount] = useState(0);

  // Breathing rhythm based on zone
  const getBreathingTiming = (zone: string) => {
    switch (zone) {
      case 'anxious': return { inhale: 4000, exhale: 6000 }; // Longer exhale for calming
      case 'elevated': return { inhale: 4000, exhale: 4000 }; // Balanced
      case 'relaxed': return { inhale: 3000, exhale: 3000 }; // Natural rhythm
      default: return { inhale: 4000, exhale: 4000 };
    }
  };

  const timing = getBreathingTiming(currentZone);

  useEffect(() => {
    if (!isActive) {
      setCycleCount(0);
      return;
    }

    const breathingCycle = () => {
      setBreathingPhase('inhale');
      
      setTimeout(() => {
        setBreathingPhase('exhale');
        
        setTimeout(() => {
          setCycleCount(prev => prev + 1);
          breathingCycle();
        }, timing.exhale);
      }, timing.inhale);
    };

    breathingCycle();
  }, [isActive, timing.inhale, timing.exhale]);

  const getZoneAdvice = (zone: string) => {
    switch (zone) {
      case 'anxious':
        return {
          title: "Deep Breathing",
          description: "Focus on longer exhales to activate your parasympathetic nervous system",
          tip: "Breathe in for 4 seconds, out for 6 seconds"
        };
      case 'elevated':
        return {
          title: "Balanced Breathing",
          description: "Maintain steady, even breaths to find your center",
          tip: "Equal inhale and exhale timing"
        };
      case 'relaxed':
        return {
          title: "Natural Rhythm",
          description: "You're in a good place. Continue with gentle, natural breathing",
          tip: "Follow your body's natural rhythm"
        };
      default:
        return {
          title: "Mindful Breathing",
          description: "Focus on your breath to center yourself",
          tip: "Breathe naturally and mindfully"
        };
    }
  };

  const advice = getZoneAdvice(currentZone);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wind className="h-5 w-5" />
          Breathing Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Breathing Visualization */}
        <div className="text-center space-y-4">
          <div className={`relative w-32 h-32 mx-auto ${isActive ? 'breathing-orb' : ''}`}>
            <div className={`
              w-full h-full rounded-full border-4 flex items-center justify-center
              transition-all duration-1000 ease-in-out
              ${breathingPhase === 'inhale' && isActive ? 'scale-110' : 'scale-100'}
              ${currentZone === 'relaxed' ? 'border-relaxed bg-relaxed/10' : ''}
              ${currentZone === 'elevated' ? 'border-elevated bg-elevated/10' : ''}
              ${currentZone === 'anxious' ? 'border-anxious bg-anxious/10' : ''}
            `}>
              <Circle className={`
                h-8 w-8 transition-all duration-1000
                ${breathingPhase === 'inhale' && isActive ? 'opacity-100' : 'opacity-60'}
                ${currentZone === 'relaxed' ? 'text-relaxed' : ''}
                ${currentZone === 'elevated' ? 'text-elevated' : ''}
                ${currentZone === 'anxious' ? 'text-anxious' : ''}
              `} />
            </div>
          </div>

          {isActive && (
            <div className="space-y-2">
              <p className="text-lg font-medium capitalize">
                {breathingPhase}
              </p>
              <Badge variant="outline" className="text-sm">
                Cycle {cycleCount}
              </Badge>
            </div>
          )}
        </div>

        {/* Zone-specific advice */}
        <div className="space-y-3 p-4 rounded-lg bg-muted/30">
          <h4 className="font-medium">{advice.title}</h4>
          <p className="text-sm text-muted-foreground">{advice.description}</p>
          <p className="text-xs font-medium text-primary">{advice.tip}</p>
        </div>

        {/* Breathing Instructions */}
        {!isActive && (
          <div className="text-center text-sm text-muted-foreground">
            Start a session to begin guided breathing
          </div>
        )}
      </CardContent>
    </Card>
  );
}