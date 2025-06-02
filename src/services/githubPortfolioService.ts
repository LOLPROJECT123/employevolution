
import { supabase } from '@/integrations/supabase/client';

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  languages_url: string;
  topics: string[];
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  visibility: string;
}

export interface GitHubLanguages {
  [language: string]: number;
}

export class GitHubPortfolioService {
  private static readonly GITHUB_API_BASE = 'https://api.github.com';

  static async fetchUserRepositories(username: string): Promise<GitHubRepository[]> {
    try {
      const response = await fetch(`${this.GITHUB_API_BASE}/users/${username}/repos?sort=updated&per_page=50`);
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const repos: GitHubRepository[] = await response.json();
      return repos.filter(repo => !repo.name.includes('fork') && repo.visibility === 'public');
    } catch (error) {
      console.error('Error fetching GitHub repositories:', error);
      throw error;
    }
  }

  static async fetchRepositoryLanguages(repoFullName: string): Promise<GitHubLanguages> {
    try {
      const response = await fetch(`${this.GITHUB_API_BASE}/repos/${repoFullName}/languages`);
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching repository languages:', error);
      return {};
    }
  }

  static async syncUserRepositories(userId: string, githubUsername: string): Promise<void> {
    try {
      const repos = await this.fetchUserRepositories(githubUsername);
      
      for (const repo of repos) {
        const languages = await this.fetchRepositoryLanguages(repo.full_name);
        
        const { error } = await supabase
          .from('github_repositories')
          .upsert({
            user_id: userId,
            github_repo_id: repo.id,
            name: repo.name,
            full_name: repo.full_name,
            description: repo.description,
            html_url: repo.html_url,
            language: repo.language,
            languages: languages,
            topics: repo.topics,
            stars_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            last_synced_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,github_repo_id'
          });

        if (error) {
          console.error('Error saving repository:', error);
        }
      }
    } catch (error) {
      console.error('Error syncing repositories:', error);
      throw error;
    }
  }

  static async getUserRepositories(userId: string) {
    const { data, error } = await supabase
      .from('github_repositories')
      .select('*')
      .eq('user_id', userId)
      .order('stars_count', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async setFeaturedRepositories(userId: string, repoIds: string[]): Promise<void> {
    // First, unset all featured repositories
    await supabase
      .from('github_repositories')
      .update({ is_featured: false })
      .eq('user_id', userId);

    // Then set the selected ones as featured
    if (repoIds.length > 0) {
      const { error } = await supabase
        .from('github_repositories')
        .update({ is_featured: true })
        .eq('user_id', userId)
        .in('id', repoIds);

      if (error) throw error;
    }
  }

  static async getFeaturedRepositories(userId: string) {
    const { data, error } = await supabase
      .from('github_repositories')
      .select('*')
      .eq('user_id', userId)
      .eq('is_featured', true)
      .order('stars_count', { ascending: false })
      .limit(6);

    if (error) throw error;
    return data || [];
  }

  static generatePortfolioMarkdown(repos: any[]): string {
    let markdown = '# Portfolio Projects\n\n';
    
    repos.forEach(repo => {
      markdown += `## [${repo.name}](${repo.html_url})\n`;
      if (repo.description) {
        markdown += `${repo.description}\n\n`;
      }
      
      if (repo.language) {
        markdown += `**Primary Language:** ${repo.language}\n`;
      }
      
      if (repo.topics && repo.topics.length > 0) {
        markdown += `**Topics:** ${repo.topics.join(', ')}\n`;
      }
      
      markdown += `⭐ ${repo.stars_count} stars | 🍴 ${repo.forks_count} forks\n\n`;
      markdown += '---\n\n';
    });
    
    return markdown;
  }
}
