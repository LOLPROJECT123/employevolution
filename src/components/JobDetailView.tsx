
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
