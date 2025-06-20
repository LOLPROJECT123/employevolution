
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Star, 
  ExternalLink, 
  Eye,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useRealtimeJobRecommendations } from '@/hooks/useRealtimeJobRecommendations';
import { formatDistanceToNow } from 'date-fns';

export const RealtimeJobAlerts: React.FC = () => {
  const { 
    recommendations, 
    unreadCount, 
    loading, 
    markAsViewed 
  } = useRealtimeJobRecommendations();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Job Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Real-time Job Alerts
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="h-6 w-6 p-0 flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {recommendations.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No job alerts yet</p>
            <p className="text-xs">You'll be notified when perfect matches are found</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recommendations.slice(0, 5).map((recommendation) => (
              <div
                key={recommendation.id}
                className={`p-3 rounded-lg border transition-all ${
                  !recommendation.is_viewed 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm line-clamp-1">
                      {recommendation.job_data.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {recommendation.job_data.company}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <div className="flex items-center gap-1 text-xs">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      <span className="font-medium text-green-600">
                        {recommendation.match_percentage}%
                      </span>
                    </div>
                    {!recommendation.is_viewed && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-3">
                  {recommendation.recommendation_reason}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(recommendation.created_at), { addSuffix: true })}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {!recommendation.is_viewed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => markAsViewed(recommendation.id)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Mark Read
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      asChild
                    >
                      <a 
                        href={recommendation.job_data.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {recommendations.length > 5 && (
          <div className="mt-3 pt-3 border-t">
            <Button variant="outline" size="sm" className="w-full">
              View All {recommendations.length} Alerts
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealtimeJobAlerts;
