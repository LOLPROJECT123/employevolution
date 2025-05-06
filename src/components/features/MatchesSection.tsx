
"use client"

import { Match } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MatchesSectionProps {
  matches: Match[];
}

const MatchesSection = ({ matches }: MatchesSectionProps) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Job Matches</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Match Preferences
          </Button>
          <Link to="/matches">
            <Button size="sm">
              View All Matches
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.length > 0 ? (
          matches.map((match) => (
            <Link to={`/jobs/${match.id}`} key={match.id}>
              <Card className="hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium line-clamp-1">{match.title}</h3>
                      <p className="text-sm text-muted-foreground">{match.company}</p>
                    </div>
                    <Badge 
                      variant={match.matchPercentage > 85 ? "default" : "outline"}
                      className={match.matchPercentage > 85 ? "bg-primary" : ""}
                    >
                      {match.matchPercentage}% Match
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">{match.location}</div>
                    <div className="text-primary flex items-center text-sm">
                      <span>View</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center p-12 border rounded-lg bg-slate-50 dark:bg-slate-900">
            <p className="text-muted-foreground">Complete your profile to see job matches</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchesSection;
