
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchIcon, ExternalLinkIcon, BookmarkIcon } from "lucide-react";
import { CompanyLeetcodeProblem, fetchCompanyProblems, getTopTechCompanies } from "@/utils/leetcodeScraperUtils";

const CompanyProblems = () => {
  const [company, setCompany] = useState<string>("");
  const [companyInput, setCompanyInput] = useState<string>("");
  const [problems, setProblems] = useState<CompanyLeetcodeProblem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const topCompanies = getTopTechCompanies();

  const handleSearch = async () => {
    if (!company) return;
    
    setIsLoading(true);
    try {
      const fetchedProblems = await fetchCompanyProblems(company);
      setProblems(fetchedProblems);
    } catch (error) {
      console.error("Error in handleSearch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanySelect = (value: string) => {
    setCompany(value);
    setCompanyInput(value);
  };

  const handleCustomCompanyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyInput(e.target.value);
    setCompany(e.target.value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company-Specific LeetCode Problems</CardTitle>
          <CardDescription>
            Find problems frequently asked in interviews at top tech companies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <div className="flex-1">
                <Select value={company} onValueChange={handleCompanySelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {topCompanies.map((companyName) => (
                      <SelectItem key={companyName} value={companyName}>
                        {companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Or type a company name..."
                  className="pl-8"
                  value={companyInput}
                  onChange={handleCustomCompanyInput}
                />
              </div>
              
              <Button 
                onClick={handleSearch} 
                disabled={isLoading || !company}
                className="min-w-24"
              >
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>
            
            {problems.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Problems for {company}</h3>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Pattern</TableHead>
                      <TableHead className="w-[80px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {problems.map((problem) => (
                      <TableRow key={problem.id}>
                        <TableCell>{problem.id}</TableCell>
                        <TableCell>
                          <a 
                            href={problem.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            {problem.title}
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            problem.difficulty === "Easy" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" :
                            problem.difficulty === "Medium" ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100" :
                            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                          }>
                            {problem.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{problem.frequency || "Common"}</Badge>
                        </TableCell>
                        <TableCell>{problem.pattern}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <a 
                              href={problem.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-sm hover:bg-accent hover:text-accent-foreground"
                            >
                              <ExternalLinkIcon className="h-4 w-4" />
                              <span className="sr-only">Open problem</span>
                            </a>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <BookmarkIcon className="h-4 w-4" />
                              <span className="sr-only">Save problem</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {problems.length === 0 && company && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No problems found for {company}. Try another company.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyProblems;
