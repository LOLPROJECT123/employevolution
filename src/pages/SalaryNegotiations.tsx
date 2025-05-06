import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { useMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { FilterIcon, PlusSquare } from "lucide-react";
import NegotiationForum from "@/components/salary/NegotiationForum";
import NegotiationGuides from "@/components/salary/NegotiationGuides";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const SalaryNegotiations = () => {
  const isMobile = useMobile();
  const [activeTab, setActiveTab] = useState<"forum" | "guides">("forum");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<{
    company: string | null;
    role: string | null;
    position: string | null;
  }>({
    company: null,
    role: null,
    position: null,
  });
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Sample filter options (in a real app, these would come from API data)
  const filterOptions = {
    companies: ["Google", "Amazon", "Microsoft", "Apple", "Meta"],
    roles: ["Software Engineer", "Product Manager", "Designer", "Data Scientist"],
    positions: ["Entry", "Mid-level", "Senior", "Lead"]
  };

  const handleFilterChange = (filterType: 'company' | 'role' | 'position', value: string | null) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      company: null,
      role: null,
      position: null
    });
    setSearchTerm("");
  };

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length + (searchTerm ? 1 : 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader title="Salary Negotiations" />}
      
      <div className={`container mx-auto px-4 ${isMobile ? 'pt-16' : 'pt-20'} pb-12 flex-1`}>
        <Tabs 
          defaultValue="forum" 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "forum" | "guides")}
          className="max-w-5xl mx-auto"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Salary Negotiations</h1>
              <p className="text-muted-foreground mt-1">
                Learn strategies and share experiences to maximize your compensation
              </p>
            </div>
            
            <TabsList className="self-start">
              <TabsTrigger value="forum">Forum</TabsTrigger>
              <TabsTrigger value="guides">Guides</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="forum" className="space-y-6">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative">
                  <Input
                    placeholder="Search discussions..."
                    className="w-full md:w-60"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <FilterIcon className="h-4 w-4 mr-2" />
                      Filter
                      {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-2 rounded-full h-5 w-5 p-0 flex items-center justify-center">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Filter Discussions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs font-medium">Company</DropdownMenuLabel>
                      <Select 
                        value={activeFilters.company || "all"} 
                        onValueChange={(value) => handleFilterChange('company', value === "all" ? null : value)}
                      >
                        <SelectTrigger className="h-8 w-full">
                          <SelectValue placeholder="All Companies" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Companies</SelectItem>
                          {filterOptions.companies.map(company => (
                            <SelectItem key={company} value={company}>{company}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </DropdownMenuGroup>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs font-medium">Role</DropdownMenuLabel>
                      <Select 
                        value={activeFilters.role || "all"} 
                        onValueChange={(value) => handleFilterChange('role', value === "all" ? null : value)}
                      >
                        <SelectTrigger className="h-8 w-full">
                          <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          {filterOptions.roles.map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </DropdownMenuGroup>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs font-medium">Position</DropdownMenuLabel>
                      <Select 
                        value={activeFilters.position || "all"} 
                        onValueChange={(value) => handleFilterChange('position', value === "all" ? null : value)}
                      >
                        <SelectTrigger className="h-8 w-full">
                          <SelectValue placeholder="All Positions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Positions</SelectItem>
                          {filterOptions.positions.map(position => (
                            <SelectItem key={position} value={position}>{position}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </DropdownMenuGroup>
                    
                    <DropdownMenuSeparator />
                    
                    <div className="p-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-xs h-8"
                        onClick={clearAllFilters}
                      >
                        <X className="h-4 w-4 mr-2" /> Clear All Filters
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Select
                  value={sortOrder}
                  onValueChange={(value) => setSortOrder(value as "newest" | "oldest")}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="ml-auto">
                <PlusSquare className="h-4 w-4 mr-2" />
                New Discussion
              </Button>
            </div>
            
            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                <div className="flex flex-wrap gap-1">
                  {activeFilters.company && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      Company: {activeFilters.company}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleFilterChange('company', null)}
                      />
                    </Badge>
                  )}
                  {activeFilters.role && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      Role: {activeFilters.role}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleFilterChange('role', null)}
                      />
                    </Badge>
                  )}
                  {activeFilters.position && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      Position: {activeFilters.position}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleFilterChange('position', null)}
                      />
                    </Badge>
                  )}
                  {searchTerm && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      Search: {searchTerm}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => setSearchTerm("")}
                      />
                    </Badge>
                  )}
                  {activeFilterCount > 1 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs"
                      onClick={clearAllFilters}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            <NegotiationForum 
              filters={{
                search: searchTerm,
                company: activeFilters.company,
                role: activeFilters.role,
                position: activeFilters.position,
                sortOrder: sortOrder
              }}
            />
          </TabsContent>
          
          <TabsContent value="guides">
            <NegotiationGuides />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SalaryNegotiations;
