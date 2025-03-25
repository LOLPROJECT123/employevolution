
import { toast } from "sonner";

export interface CompanyLeetcodeProblem {
  id: number;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  url: string;
  frequency?: string; // How frequently this appears in interviews (e.g. "Very Common", "Rare")
  companies: string[];
  pattern: string;
}

// This is a mock function that simulates fetching company-specific problems
// In a real implementation, this would connect to an API or scraper service
export const fetchCompanyProblems = async (
  company: string
): Promise<CompanyLeetcodeProblem[]> => {
  console.log(`Fetching problems for ${company}`);
  
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  try {
    // Mock data for demonstration - in a real implementation, this would be fetched from an API
    const mockProblems: Record<string, CompanyLeetcodeProblem[]> = {
      "google": [
        {
          id: 42,
          title: "Trapping Rain Water",
          difficulty: "Hard",
          tags: ["Array", "Two Pointers", "Dynamic Programming", "Stack"],
          url: "https://leetcode.com/problems/trapping-rain-water/",
          frequency: "Very Common",
          companies: ["Google", "Amazon", "Microsoft"],
          pattern: "Two Pointers"
        },
        {
          id: 68,
          title: "Text Justification",
          difficulty: "Hard",
          tags: ["String", "Simulation"],
          url: "https://leetcode.com/problems/text-justification/",
          frequency: "Common",
          companies: ["Google", "Facebook", "LinkedIn"],
          pattern: "String Manipulation"
        },
        {
          id: 843,
          title: "Guess the Word",
          difficulty: "Hard",
          tags: ["Array", "Math", "Interactive", "Game Theory"],
          url: "https://leetcode.com/problems/guess-the-word/",
          frequency: "Common",
          companies: ["Google", "Facebook"],
          pattern: "Interactive"
        },
        {
          id: 1293,
          title: "Shortest Path in a Grid with Obstacles Elimination",
          difficulty: "Hard",
          tags: ["Array", "BFS", "Matrix"],
          url: "https://leetcode.com/problems/shortest-path-in-a-grid-with-obstacles-elimination/",
          frequency: "Common",
          companies: ["Google", "Amazon"],
          pattern: "Graphs"
        }
      ],
      "amazon": [
        {
          id: 146,
          title: "LRU Cache",
          difficulty: "Medium",
          tags: ["Hash Table", "Linked List", "Design"],
          url: "https://leetcode.com/problems/lru-cache/",
          frequency: "Very Common",
          companies: ["Amazon", "Microsoft", "Google"],
          pattern: "Design"
        },
        {
          id: 200,
          title: "Number of Islands",
          difficulty: "Medium",
          tags: ["Array", "DFS", "BFS", "Union Find", "Matrix"],
          url: "https://leetcode.com/problems/number-of-islands/",
          frequency: "Very Common",
          companies: ["Amazon", "Google", "Facebook", "Microsoft"],
          pattern: "Graphs"
        },
        {
          id: 1192,
          title: "Critical Connections in a Network",
          difficulty: "Hard",
          tags: ["DFS", "Graph", "Biconnected Component"],
          url: "https://leetcode.com/problems/critical-connections-in-a-network/",
          frequency: "Common",
          companies: ["Amazon"],
          pattern: "Graphs"
        }
      ],
      "facebook": [
        {
          id: 523,
          title: "Continuous Subarray Sum",
          difficulty: "Medium",
          tags: ["Array", "Hash Table", "Math", "Prefix Sum"],
          url: "https://leetcode.com/problems/continuous-subarray-sum/",
          frequency: "Common",
          companies: ["Facebook", "Amazon"],
          pattern: "Arrays & Hashing"
        },
        {
          id: 301,
          title: "Remove Invalid Parentheses",
          difficulty: "Hard",
          tags: ["String", "BFS", "Backtracking"],
          url: "https://leetcode.com/problems/remove-invalid-parentheses/",
          frequency: "Common",
          companies: ["Facebook", "Amazon", "Microsoft"],
          pattern: "Backtracking"
        },
        {
          id: 158,
          title: "Read N Characters Given Read4 II - Call multiple times",
          difficulty: "Hard",
          tags: ["String", "Interactive", "Simulation"],
          url: "https://leetcode.com/problems/read-n-characters-given-read4-ii-call-multiple-times/",
          frequency: "Common",
          companies: ["Facebook", "Google"],
          pattern: "Design"
        }
      ],
      "microsoft": [
        {
          id: 138,
          title: "Copy List with Random Pointer",
          difficulty: "Medium",
          tags: ["Hash Table", "Linked List"],
          url: "https://leetcode.com/problems/copy-list-with-random-pointer/",
          frequency: "Common",
          companies: ["Microsoft", "Amazon", "Facebook"],
          pattern: "Linked List"
        },
        {
          id: 348,
          title: "Design Tic-Tac-Toe",
          difficulty: "Medium",
          tags: ["Array", "Hash Table", "Design", "Matrix"],
          url: "https://leetcode.com/problems/design-tic-tac-toe/",
          frequency: "Common",
          companies: ["Microsoft", "Amazon"],
          pattern: "Design"
        }
      ],
      "apple": [
        {
          id: 238,
          title: "Product of Array Except Self",
          difficulty: "Medium",
          tags: ["Array", "Prefix Sum"],
          url: "https://leetcode.com/problems/product-of-array-except-self/",
          frequency: "Very Common",
          companies: ["Apple", "Amazon", "Facebook", "Google"],
          pattern: "Arrays & Hashing"
        },
        {
          id: 54,
          title: "Spiral Matrix",
          difficulty: "Medium",
          tags: ["Array", "Matrix", "Simulation"],
          url: "https://leetcode.com/problems/spiral-matrix/",
          frequency: "Common",
          companies: ["Apple", "Microsoft", "Amazon", "Google"],
          pattern: "Math & Geometry"
        }
      ],
      "netflix": [
        {
          id: 1167,
          title: "Minimum Cost to Connect Sticks",
          difficulty: "Medium",
          tags: ["Array", "Greedy", "Heap"],
          url: "https://leetcode.com/problems/minimum-cost-to-connect-sticks/",
          frequency: "Common",
          companies: ["Netflix", "Amazon"],
          pattern: "Heap / Priority Queue"
        },
        {
          id: 146,
          title: "LRU Cache",
          difficulty: "Medium",
          tags: ["Hash Table", "Linked List", "Design"],
          url: "https://leetcode.com/problems/lru-cache/",
          frequency: "Very Common",
          companies: ["Netflix", "Amazon", "Microsoft", "Google"],
          pattern: "Design"
        }
      ]
    };

    // Convert company name to lowercase for case-insensitive lookup
    const companyLower = company.toLowerCase();
    
    // Return the problems for the specified company, or an empty array if none found
    const problems = mockProblems[companyLower] || [];
    
    if (problems.length === 0) {
      toast.warning(`No specific problems found for ${company}. Try another company like Google, Amazon, Facebook, Microsoft, Apple, or Netflix.`);
    } else {
      toast.success(`Found ${problems.length} problems for ${company}`);
    }
    
    return problems;
  } catch (error) {
    console.error("Error fetching company problems:", error);
    toast.error("Failed to fetch company-specific problems. Please try again later.");
    return [];
  }
};

// Function to get a list of top tech companies
export const getTopTechCompanies = (): string[] => {
  return [
    "Google",
    "Amazon",
    "Facebook",
    "Microsoft",
    "Apple",
    "Netflix",
    "Uber",
    "LinkedIn",
    "Twitter",
    "Airbnb"
  ];
};
