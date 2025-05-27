
import { ScrapedJob } from "@/components/resume/job-application/types";
import { createEnhancedJobScraper } from "./jobScraper/jobScraper";

/**
 * Create a job scraper instance
 * This function now returns our enhanced job scraper implementation
 */
export function createJobScraper() {
  return createEnhancedJobScraper();
}

/**
 * Export the main function for using Crawl4AI for job searches
 */
export async function searchJobsWithCrawl4AI(
  query: string,
  location: string = '',
  platforms: string[] = [],
  options: any = {}
): Promise<ScrapedJob[]> {
  const scraper = createJobScraper();
  return scraper.searchJobs(query, location, platforms);
}
