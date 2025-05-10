
import { Job } from "@/types/job";

interface MobileJobListProps {
  jobs: Job[];
  savedJobIds: string[];
  appliedJobIds: string[];
  onSelect: (job: Job) => void;
  onSave: (job: Job) => void;
  onApply: (job: Job) => void;
}

export const MobileJobList = ({ 
  jobs, 
  savedJobIds, 
  appliedJobIds, 
  onSelect, 
  onSave, 
  onApply 
}: MobileJobListProps) => {
  if (jobs.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-500">No jobs found.</p>
        <p className="text-sm text-gray-400 mt-2">Try different search criteria or check back later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div 
          key={job.id} 
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
          onClick={() => onSelect(job)}
        >
          <h3 className="font-medium text-lg">{job.title}</h3>
          <p className="text-gray-600 dark:text-gray-400">{job.company}</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">{job.location}</p>
          
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-500">{job.postedAt}</span>
            
            <div className="flex gap-2">
              <button 
                className={`p-2 rounded-full ${savedJobIds.includes(job.id) ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSave(job);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={savedJobIds.includes(job.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
              </button>
              
              <button 
                className={`p-2 rounded-full ${appliedJobIds.includes(job.id) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onApply(job);
                }}
                disabled={appliedJobIds.includes(job.id)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
