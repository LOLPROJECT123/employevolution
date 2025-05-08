
import React, { useMemo } from "react";
import { getDetailedMatch, getMatchExplanation, getMatchColor, MatchScoreLevel, ComprehensiveMatch } from "@/utils/jobMatchingUtils";
import { Job } from "@/types/job";
import { Check, X, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface JobMatchDetailsProps {
  job: Job;
  userSkills?: string[];
  compact?: boolean;
}

export const JobMatchDetails = ({ job, userSkills = [], compact = false }: JobMatchDetailsProps) => {
  // Memoize match calculation to prevent unnecessary recalculations
  const match = useMemo(() => getDetailedMatch(job, userSkills), [job.id, userSkills.join(',')]);
  const explanation = useMemo(() => getMatchExplanation(match), [match.overallScore]);
  
  // Define color scheme based on match level
  const getColorByLevel = (level: MatchScoreLevel) => {
    switch (level) {
      case MatchScoreLevel.Excellent:
        return "text-emerald-500 dark:text-emerald-400";
      case MatchScoreLevel.Good:
        return "text-green-500 dark:text-green-400";
      case MatchScoreLevel.Fair:
        return "text-amber-500 dark:text-amber-400";
      case MatchScoreLevel.Weak:
        return "text-red-500 dark:text-red-400";
    }
  };
  
  // Get background color for skill badges
  const getSkillBadgeStyle = (matched: boolean, isHighPriority: boolean) => {
    if (matched) {
      return isHighPriority 
        ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
        : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
    } else {
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Ensure that if job already has a matchPercentage, we use it
  const overallScore = job.matchPercentage || match.overallScore;
  // Ensure skill match score is consistent with overall score
  const skillsScore = match.skills.score === 0 && overallScore > 0 ? overallScore : match.skills.score;

  if (compact) {
    return (
      <div className="rounded-lg border p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className={`text-lg font-semibold ${getColorByLevel(match.matchLevel)}`}>
            {overallScore}%
          </div>
          <Progress value={overallScore} className="h-2" />
        </div>
        <p className="text-sm text-muted-foreground">{explanation}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Match Score</h3>
          <div className={`text-xl font-bold ${getColorByLevel(match.matchLevel)}`}>
            {overallScore}%
          </div>
        </div>
        <Progress
          value={overallScore}
          className="h-2"
        />
        <p className="text-sm text-muted-foreground">{explanation}</p>
      </div>

      <Accordion type="single" collapsible className="w-full" defaultValue="skills">
        <AccordionItem value="skills">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full pr-2">
              <div>Skills Match</div>
              <div className={getMatchColor(skillsScore)}>
                {skillsScore}%
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {match.skills.matched.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-sm font-medium">Matching Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {match.skills.matched.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className={cn(
                          getSkillBadgeStyle(true, skill.isHighPriority),
                          "flex items-center gap-1"
                        )}
                      >
                        <Check className="h-3 w-3" />
                        {skill.skill}
                        {skill.isHighPriority && <Sparkles className="h-3 w-3" />}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {match.skills.missing.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-sm font-medium">Missing Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {match.skills.missing.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300 flex items-center gap-1"
                      >
                        <X className="h-3 w-3" />
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {match.skills.extras.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-sm font-medium">Additional Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {match.skills.extras.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-purple-50 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="experience">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full pr-2">
              <div>Experience Match</div>
              <div className={getMatchColor(match.experience.matchPercentage)}>
                {match.experience.matchPercentage}%
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">
              {match.experience.details}
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="education">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full pr-2">
              <div>Education Match</div>
              <div className={getMatchColor(match.education.matched ? 100 : 0)}>
                {match.education.matched ? "Yes" : "No"}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">
              {match.education.details}
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="location">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full pr-2">
              <div>Location Match</div>
              <div className={getMatchColor(match.location.matched ? 100 : 0)}>
                {match.location.matched ? "Yes" : "No"}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">
              {match.location.details}
              {match.location.distance !== undefined && match.location.distance > 0 && (
                <> ({match.location.distance} miles)</>
              )}
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default JobMatchDetails;
