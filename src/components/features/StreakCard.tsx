
"use client"

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Flame } from 'lucide-react';

interface StreakCardProps {
  daysStreak: number;
  isAllStar?: boolean;
}

const StreakCard = ({ daysStreak, isAllStar = false }: StreakCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-[#FFE4D6] p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Daily Streak</h3>
          {isAllStar && <Badge variant="outline">All-Star</Badge>}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
            <Flame className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{daysStreak} Day Streak</p>
            <p className="text-sm text-muted-foreground">Keep up the momentum!</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakCard;
