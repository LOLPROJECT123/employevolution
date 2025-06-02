import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { MessageSquarePlus, ThumbsUp, MessageCircle, Share2, PlusCircle, Filter, SortDesc, SortAsc, Link, Pencil, Trash2, X } from "lucide-react";
import { ResumePost, ResumeComment } from "@/types/resumePost";
import { Alert } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ResumeForum = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<ResumePost[]>([
    {
      id: "1",
      title: "Software Engineer Resume Review - Google Interview Next Week",
      author: {
        id: "user1",
        name: "Dev_Seeker",
        avatar: "/lovable-uploads/8d78f162-7185-4058-b018-02e6724321d1.png"
      },
      content: "I've been working as a full-stack developer for 3 years and finally got an interview with Google! I've attached my resume - would appreciate any feedback, especially on how to highlight my system design experience. I've worked on scaling applications but not sure if I'm presenting it correctly.",
      resumeUrl: "https://example.com/resume1.pdf",
      upvotes: 24,
      downvotes: 2,
      comments: [
        {
          id: "c1",
          author: {
            id: "user2",
            name: "GoogleHiringManager",
            avatar: "/lovable-uploads/81cda60f-8675-4248-93bc-1d140295a4f5.png"
          },
          content: "Your technical skills section is impressive, but I'd recommend quantifying your achievements more. For example, instead of 'Improved application performance', say 'Reduced page load time by 40% by implementing code splitting and lazy loading'.",
          upvotes: 18,
          downvotes: 0,
          createdAt: "2 days ago",
          isCurrentUser: false
        },
        {
          id: "c2",
          author: {
            id: "user3",
            name: "TechRecruiter123",
            avatar: "/lovable-uploads/47a5c183-6462-4482-85b2-320da7ad9a4e.png"
          },
          content: "I'd move your education section below your professional experience since you have 3 years of relevant work. Also, consider adding a brief (2-3 line) professional summary at the top that highlights your expertise in full stack development.",
          upvotes: 12,
          downvotes: 1,
          createdAt: "1 day ago",
          isCurrentUser: false
        }
      ],
      createdAt: "3 days ago",
      tags: ["Software Engineering", "Google", "Full Stack", "Resume Review"],
      company: "Google",
      role: "Software Engineer"
    },
    {
      id: "2",
      title: "Data Scientist Resume - Just Got Hired at Meta!",
      author: {
        id: "user4",
        name: "DataWizard",
      },
      content: "After 6 months of job hunting and 24 applications, I finally landed a role at Meta as a Data Scientist! I wanted to share my resume and some tips that helped me stand out. The key was highlighting specific ML projects and their business impact, rather than just listing technologies.",
      resumeUrl: "https://example.com/resume2.pdf",
      upvotes: 56,
      downvotes: 3,
      comments: [
        {
          id: "c3",
          author: {
            id: "user5",
            name: "ML_Enthusiast",
          },
          content: "Congratulations! Could you share more about how you structured your projects section? Did you use the STAR method?",
          upvotes: 8,
          downvotes: 0,
          createdAt: "12 hours ago",
          isCurrentUser: false
        }
      ],
      createdAt: "2 days ago",
      tags: ["Data Science", "Meta", "Success Story", "Machine Learning"],
      company: "Meta",
      role: "Data Scientist"
    }
  ]);

  const [selectedPost, setSelectedPost] = useState<ResumePost | null>(null);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState<{id: string, content: string} | null>(null);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    tags: "",
    isAnonymous: false,
    resumeFile: null as File | null,
    company: "",
    role: ""
  });
  
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isNewPostDialogOpen, setIsNewPostDialogOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [activeFilters, setActiveFilters] = useState<{
    company: string | null;
    role: string | null;
  }>({
    company: null,
    role: null,
  });
  const [linkCopiedAlert, setLinkCopiedAlert] = useState(false);

  // Track liked posts
  const [likedPosts, setLikedPosts] = useState<{[key: string]: boolean}>({});

  // Get unique companies and roles from posts
  const getFilterOptions = () => {
    return {
      companies: [...new Set(posts.map(p => p.company).filter(Boolean))],
      roles: [...new Set(posts.map(p => p.role).filter(Boolean))]
    };
  };

  const filterOptions = getFilterOptions();

  // Apply filters and sorting
  const getFilteredPosts = () => {
    // First filter posts
    const filtered = posts.filter(post => {
      const matchesCompany = !activeFilters.company || post.company === activeFilters.company;
      const matchesRole = !activeFilters.role || post.role === activeFilters.role;
      return matchesCompany && matchesRole;
    });

    // Then sort posts
    return filtered.sort((a, b) => {
      // Simple sort by assumed date in createdAt string
      // In a real app, you'd parse actual dates
      if (sortOrder === 'newest') {
        return a.createdAt.includes('3 days') ? 1 : -1;
      } else {
        return a.createdAt.includes('3 days') ? -1 : 1;
      }
    });
  };

  const filteredPosts = getFilteredPosts();
  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  const handleSubmitPost = () => {
    const tagsArray = newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    const post: ResumePost = {
      id: Date.now().toString(),
      title: newPost.title,
      author: {
        id: "current-user",
        name: newPost.isAnonymous ? "Anonymous" : "Current User",
      },
      content: newPost.content,
      resumeUrl: newPost.resumeFile ? URL.createObjectURL(newPost.resumeFile) : undefined,
      upvotes: 0,
      downvotes: 0,
      comments: [],
      createdAt: "Just now",
      tags: tagsArray,
      company: newPost.company,
      role: newPost.role
    };
    
    setPosts([post, ...posts]);
    setNewPost({
      title: "",
      content: "",
      tags: "",
      isAnonymous: false,
      resumeFile: null,
      company: "",
      role: ""
    });
    
    setIsNewPostDialogOpen(false);
    toast({
      title: "Post Created",
      description: "Your post has been successfully published."
    });
  };

  const handleSubmitComment = () => {
    if (!selectedPost || !newComment.trim()) return;

    if (editingComment) {
      // Update existing comment
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === selectedPost.id) {
            return {
              ...post,
              comments: post.comments.map(comment => 
                comment.id === editingComment.id
                  ? { ...comment, content: newComment }
                  : comment
              )
            };
          }
          return post;
        })
      );

      setEditingComment(null);
      toast({
        title: "Comment Updated",
        description: "Your comment has been updated successfully."
      });
    } else {
      // Add new comment
      const comment: ResumeComment = {
        id: Date.now().toString(),
        author: {
          id: "current-user",
          name: "Current User",
          avatar: "/lovable-uploads/47a5c183-6462-4482-85b2-320da7ad9a4e.png"
        },
        content: newComment,
        upvotes: 0,
        downvotes: 0,
        createdAt: "Just now",
        isCurrentUser: true
      };

      const updatedPosts = posts.map(post => {
        if (post.id === selectedPost.id) {
          return {
            ...post,
            comments: [...post.comments, comment]
          };
        }
        return post;
      });

      setPosts(updatedPosts);
      toast({
        title: "Reply Posted",
        description: "Your comment has been added to the discussion."
      });
    }

    setNewComment("");
    setIsReplyDialogOpen(false);
  };

  const handleToggleLike = (postId: string) => {
    setPosts(
      posts.map(post => {
        if (post.id === postId) {
          // If already liked, unlike it (decrease upvotes)
          if (likedPosts[postId]) {
            return { ...post, upvotes: post.upvotes - 1 };
          } 
          // If not liked, like it (increase upvotes)
          else {
            return { ...post, upvotes: post.upvotes + 1 };
          }
        }
        return post;
      })
    );
    
    // Toggle like status for this post
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleEditComment = (postId: string, commentId: string) => {
    const post = posts.find(p => p.id === postId);
    const comment = post?.comments.find(c => c.id === commentId);
    
    if (comment) {
      setSelectedPost(post);
      setEditingComment({ id: commentId, content: comment.content });
      setNewComment(comment.content);
      setIsReplyDialogOpen(true);
    }
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    // Find the post and filter out the deleted comment
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments.filter(comment => comment.id !== commentId)
          };
        }
        return post;
      })
    );

    toast({
      title: "Comment Deleted",
      description: "Your comment has been removed from the discussion."
    });
  };

  const handleSharePost = (post: ResumePost) => {
    // Create a URL with post ID as parameter
    const shareUrl = `${window.location.origin}/resume-tools?postId=${post.id}`;
    
    // Try to use the clipboard API
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          setLinkCopiedAlert(true);
          setTimeout(() => setLinkCopiedAlert(false), 3000); // Hide after 3 seconds
          
          toast({
            title: "Link Copied",
            description: "Post link has been copied to clipboard."
          });
        })
        .catch(() => {
          // Fallback: show the link in an alert
          prompt("Copy this link to share:", shareUrl);
        });
    } else {
      // Fallback for browsers that don't support clipboard API
      prompt("Copy this link to share:", shareUrl);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewPost({ ...newPost, resumeFile: e.target.files[0] });
    }
  };

  const handleFilterChange = (filterType: 'company' | 'role', value: string | null) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({
      company: null,
      role: null
    });
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest');
  };

  return (
    <div className="space-y-6">
      {/* Link Copied Alert */}
      {linkCopiedAlert && (
        <div className="fixed bottom-4 right-4 z-50">
          <Alert className="bg-background border-border shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium">Link Copied</h5>
                <p className="text-sm text-muted-foreground">Post link has been copied to clipboard.</p>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setLinkCopiedAlert(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <h2 className="text-2xl font-semibold">Resume Forum</h2>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 rounded-full h-5 w-5 p-0 flex items-center justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter Posts</DropdownMenuLabel>
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
              
              {activeFilterCount > 0 && (
                <div className="p-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs h-8"
                    onClick={clearAllFilters}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center"
            onClick={toggleSortOrder}
          >
            {sortOrder === 'newest' ? (
              <SortDesc className="h-4 w-4 mr-2" />
            ) : (
              <SortAsc className="h-4 w-4 mr-2" />
            )}
            {sortOrder === 'newest' ? 'Newest' : 'Oldest'} First
          </Button>
          
          <Dialog open={isNewPostDialogOpen} onOpenChange={setIsNewPostDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <MessageSquarePlus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Create a Forum Post</DialogTitle>
                <DialogDescription>
                  Share your resume for feedback or ask a resume-related question
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <label htmlFor="post-title" className="text-sm font-medium mb-1 block">Title</label>
                  <Input
                    id="post-title"
                    placeholder="E.g., Need feedback on my Software Engineer resume"
                    value={newPost.title}
                    onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="post-content" className="text-sm font-medium mb-1 block">Content</label>
                  <Textarea
                    id="post-content"
                    placeholder="Describe your resume, ask specific questions, or share your experience..."
                    rows={5}
                    value={newPost.content}
                    onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="post-company" className="text-sm font-medium mb-1 block">Company</label>
                    <Input
                      id="post-company"
                      placeholder="E.g., Google, Apple, etc."
                      value={newPost.company}
                      onChange={e => setNewPost({ ...newPost, company: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="post-role" className="text-sm font-medium mb-1 block">Role</label>
                    <Input
                      id="post-role"
                      placeholder="E.g., Software Engineer, PM, etc."
                      value={newPost.role}
                      onChange={e => setNewPost({ ...newPost, role: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="post-tags" className="text-sm font-medium mb-1 block">Tags (comma-separated)</label>
                  <Input
                    id="post-tags"
                    placeholder="E.g., Resume Review, Tech, Entry Level"
                    value={newPost.tags}
                    onChange={e => setNewPost({ ...newPost, tags: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Upload Resume (optional)</label>
                  <Input 
                    id="resume-upload" 
                    type="file"
                    accept=".pdf,.doc,.docx" 
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Max file size: 5MB. Accepted formats: PDF, DOC, DOCX.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="post-anonymous"
                    checked={newPost.isAnonymous}
                    onCheckedChange={(checked) => 
                      setNewPost({ ...newPost, isAnonymous: checked as boolean })
                    }
                  />
                  <label htmlFor="post-anonymous" className="text-sm font-medium cursor-pointer">
                    Post anonymously
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewPostDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitPost}
                  disabled={!newPost.title.trim() || !newPost.content.trim()}
                >
                  Post
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          <div className="flex flex-wrap gap-1">
            {activeFilters.company && (
              <Badge variant="outline" className="flex items-center gap-1">
                Company: {activeFilters.company}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleFilterChange('company', null)}
                >
                  <span className="sr-only">Remove filter</span>
                  ✕
                </Button>
              </Badge>
            )}
            {activeFilters.role && (
              <Badge variant="outline" className="flex items-center gap-1">
                Role: {activeFilters.role}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => handleFilterChange('role', null)}
                >
                  <span className="sr-only">Remove filter</span>
                  ✕
                </Button>
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

      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="space-y-6 pr-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <Card key={post.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        {post.author.avatar && <AvatarImage src={post.author.avatar} />}
                        <AvatarFallback>{post.author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{post.author.name}</div>
                        <div className="text-xs text-muted-foreground">{post.createdAt}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-2">
                    {post.title}
                    {post.company && post.role && (
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">{post.company}</Badge>
                        <Badge variant="outline" className="text-xs">{post.role}</Badge>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-sm whitespace-pre-line">{post.content}</p>
                  {post.resumeUrl && (
                    <div className="mt-4">
                      <Button variant="outline" size="sm" className="text-sm" asChild>
                        <a href={post.resumeUrl} target="_blank" rel="noopener noreferrer">
                          View Resume
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="border-t pt-3 flex justify-between">
                  <div className="flex gap-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`flex gap-1 ${likedPosts[post.id] ? "text-primary" : "text-muted-foreground"}`}
                      onClick={() => handleToggleLike(post.id)}
                    >
                      <ThumbsUp className={`h-4 w-4 ${likedPosts[post.id] ? "fill-primary" : ""}`} />
                      <span>{post.upvotes}</span>
                    </Button>
                    <Dialog open={selectedPost?.id === post.id && isReplyDialogOpen} onOpenChange={(open) => {
                      if (!open) {
                        setEditingComment(null);
                      }
                      setIsReplyDialogOpen(open);
                      if (open) setSelectedPost(post);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="flex gap-1 text-muted-foreground">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments.length}</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Replies to: {post.title}</DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[400px] overflow-y-auto py-4">
                          {post.comments.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No replies yet. Be the first to respond!</p>
                          ) : (
                            post.comments.map((comment) => (
                              <div key={comment.id} className="mb-4 border-b pb-4 last:border-0">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <Avatar className="h-6 w-6">
                                      {comment.author.avatar && <AvatarImage src={comment.author.avatar} />}
                                      <AvatarFallback>{comment.author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="text-sm font-medium">{comment.author.name}</div>
                                      <div className="text-xs text-muted-foreground">{comment.createdAt}</div>
                                    </div>
                                  </div>
                                  
                                  {comment.isCurrentUser && (
                                    <div className="flex items-center gap-1">
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6" 
                                        onClick={() => handleEditComment(post.id, comment.id)}
                                      >
                                        <Pencil className="h-3 w-3" />
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 text-destructive hover:text-destructive" 
                                        onClick={() => handleDeleteComment(post.id, comment.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                                <p className="text-sm pl-8">{comment.content}</p>
                                <div className="flex gap-2 mt-2 pl-8">
                                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                    <ThumbsUp className="h-3 w-3 mr-1" />
                                    {comment.upvotes}
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Textarea
                            placeholder={editingComment ? "Edit your reply..." : "Write your reply..."}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="flex-1"
                          />
                          <Button 
                            size="icon" 
                            onClick={handleSubmitComment}
                            disabled={!newComment.trim()}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground"
                    onClick={() => handleSharePost(post)}
                  >
                    <Link className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts found matching your criteria</p>
              {activeFilterCount > 0 && (
                <Button variant="link" onClick={clearAllFilters}>Clear filters</Button>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex justify-center py-4">
        <Button variant="outline" className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4" />
          Load More
        </Button>
      </div>
    </div>
  );
};

export default ResumeForum;
