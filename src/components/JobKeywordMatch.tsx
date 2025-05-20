
import { getMatchColor, getMatchBgColor } from "@/utils/jobMatchingUtils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface JobKeywordMatchProps {
  matchScore: number;
  keywordsFound: number;
  keywordsTotal: number;
  keywordsList: string[];
  compact?: boolean;
}

const JobKeywordMatch = ({
  matchScore,
  keywordsFound,
  keywordsTotal,
  keywordsList,
  compact = false
}: JobKeywordMatchProps) => {
  return (
    <div className={`${compact ? "" : "space-y-3"}`}>
      <h3 className={`font-medium ${compact ? "text-sm" : ""}`}>
        Skills Match
      </h3>

      <div className="flex items-center gap-2">
        <div className={`${compact ? "text-base" : "text-xl"} font-bold ${getMatchColor(matchScore)}`}>
          {matchScore}%
        </div>
        <div className="text-sm text-gray-600">
          {keywordsFound} of {keywordsTotal} matched
        </div>
      </div>

      <Progress value={matchScore} className="h-1.5 mt-1" />

      {!compact && (
        <div className="mt-2">
          <h4 className="text-sm font-medium mb-2">Matched Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {keywordsList.slice(0, Math.min(10, keywordsList.length)).map((keyword, index) => (
              <Badge
                key={index}
                className={`${
                  index < keywordsFound
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-gray-50 text-gray-600 border-gray-200"
                } dark:bg-opacity-20 border`}
              >
                {keyword}
              </Badge>
            ))}
            
            {keywordsList.length > 10 && (
              <Badge variant="outline">
                +{keywordsList.length - 10} more
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobKeywordMatch;
