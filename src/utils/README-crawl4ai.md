
# Crawl4AI Integration

This folder contains an integration of the [Crawl4AI library](https://github.com/unclecode/crawl4ai) for job scraping functionality. The implementation provides a clean interface for scraping job listings from multiple job platforms.

## Features

- Search jobs across multiple platforms (LinkedIn, Indeed, Glassdoor, etc.)
- Verify job URLs to ensure they are still active
- Extract detailed job information from listings
- Support for proxy rotation and rate limiting

## Usage

```typescript
import { searchJobsWithCrawl4AI } from "@/utils/crawl4ai";

// Basic usage
const jobs = await searchJobsWithCrawl4AI("Software Engineer", "San Francisco");

// Advanced usage with options
const jobs = await searchJobsWithCrawl4AI(
  "Data Scientist", 
  "Remote",
  ["linkedin", "indeed", "glassdoor"],
  {
    maxResults: 50,
    maxPages: 3,
    timeout: 30000
  }
);
```

## Implementation Details

The implementation includes:

1. `Crawl4AI` class - Core functionality for job scraping
2. `JOB_SITE_CONFIGS` - Configuration for different job platforms
3. Helper functions for job verification and details extraction
4. Mock data generation for demo purposes

In a production environment, this would be connected to a server-side implementation that uses headless browsers or APIs to perform the actual scraping.
