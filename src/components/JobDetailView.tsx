
import { Job } from "@/types/job";

interface JobDetailViewProps {
  job: Job | null;
  onApply: (job: Job) => void;
  onSave: (job: Job) => void;
  isSaved?: boolean;
  isApplied?: boolean;
}

// Function to get the appropriate background color based on match percentage
const getMatchBgColor = (percentage?: number) => {
  if (!percentage) return "bg-gray-100 dark:bg-gray-800";
  if (percentage >= 70) return "bg-green-50 dark:bg-green-900/30";
  if (percentage >= 50) return "bg-amber-50 dark:bg-amber-900/30";
  return "bg-red-50 dark:bg-red-900/30";
};

// Function to get the appropriate text color based on match percentage
const getMatchColor = (percentage?: number) => {
  if (!percentage) return "";
  if (percentage >= 70) return "text-green-500";
  if (percentage >= 50) return "text-amber-500";
  return "text-red-500";
};

// Function to get the match label based on percentage
const getMatchLabel = (percentage?: number) => {
  if (!percentage) return "";
  if (percentage >= 70) return "GOOD MATCH";
  if (percentage >= 50) return "FAIR MATCH";
  return "WEAK MATCH";
};

export const JobDetailView = ({ 
  job, 
  onApply, 
  onSave,
  isSaved,
  isApplied
}: JobDetailViewProps) => {
  if (!job) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <p>No job selected</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      {job.matchPercentage && (
        <div className={`p-4 rounded-lg ${getMatchBgColor(job.matchPercentage)} mb-4`}>
          <div className="flex items-center gap-2">
            <div className={`text-xl font-bold ${getMatchColor(job.matchPercentage)}`}>{job.matchPercentage}</div>
            <div className={`font-semibold ${getMatchColor(job.matchPercentage)}`}>
              {getMatchLabel(job.matchPercentage)}
            </div>
          </div>
          <p className="text-sm mt-1">Based on your profile, skills, and experience</p>
        </div>
      )}
      
      {/* Add the rest of your job detail view implementation here */}
      <h1 className="text-2xl font-bold">{job.title}</h1>
      <div className="mt-2 text-lg">{job.company}</div>
      <div className="mt-1 text-gray-500">{job.location}</div>
      
      {/* Salary information */}
      <div className="mt-4 p-4 border rounded-lg">
        <div className="font-semibold">Salary Range</div>
        <div className="text-xl font-bold mt-1">
          {job.salary.currency}{job.salary.min.toLocaleString()} - {job.salary.currency}{job.salary.max.toLocaleString()}
        </div>
      </div>
      
      {/* Job description */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Description</h2>
        <p className="whitespace-pre-line">{job.description}</p>
      </div>
      
      {/* Requirements */}
      {job.requirements && job.requirements.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Requirements</h2>
          <ul className="list-disc pl-5 space-y-2">
            {job.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Required Skills</h2>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
