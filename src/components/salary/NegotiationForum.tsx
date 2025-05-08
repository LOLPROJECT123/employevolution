import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, MessageCircle, Link, Filter, PlusCircle, Pencil, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ForumPost, ForumComment } from "@/types/forumPost";
import { Alert } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface NegotiationForumProps {
  filters?: {
    search?: string;
    company?: string | null;
    role?: string | null;
    position?: string | null;
    sortOrder?: "newest" | "oldest";
  };
}

const NegotiationForum = ({ filters }: NegotiationForumProps) => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<ForumPost[]>([
    {
      id: "1",
      author: {
        name: "Anonymous",
        initials: "A",
      },
      title: "Negotiated $20k more at FAANG - My Strategy",
      content: "I recently received an offer from a FAANG company that was below market rate. Using data from Levels.fyi, I countered with specific examples of my experience and skills. They came back with a $20k higher base salary plus additional RSUs. Happy to share the exact script I used.",
      tags: ["FAANG", "Success Story", "Tech"],
      likes: 42,
      comments: 18,
      timestamp: "2 days ago",
      isAnonymous: true,
      company: "Google",
      role: "Software Engineer",
      position: "Senior"
    },
    {
      id: "2",
      author: {
        name: "Jessica Miller",
        avatar: "/lovable-uploads/8d78f162-7185-4058-b018-02e6724321d1.png",
        initials: "JM",
      },
      title: "How to negotiate as a junior developer?",
      content: "I'm about to graduate and have my first job offer as a junior developer. The salary is $75k, but I've seen on Glassdoor that similar positions pay up to $85k. I don't have much work experience - is it reasonable to negotiate? Any advice on how to approach this?",
      tags: ["Junior", "First Job", "Advice Needed"],
      likes: 31,
      comments: 24,
      timestamp: "5 days ago",
      isAnonymous: false,
      company: "Microsoft",
      role: "Software Engineer",
      position: "Entry"
    },
    {
      id: "3",
      author: {
        name: "Marcus Chen",
        avatar: "/lovable-uploads/81cda60f-8675-4248-93bc-1d140295a4f5.png",
        initials: "MC",
      },
      title: "Remote work vs. higher salary - what I chose",
      content: "I had two offers: one with a higher salary but required relocation, and another that was 100% remote but paid about 10% less. I chose the remote position and negotiated additional equity to bridge some of the gap. Here's how I approached the conversation...",
      tags: ["Remote Work", "Equity", "Work-Life Balance"],
      likes: 57,
      comments: 32,
      timestamp: "1 week ago",
      isAnonymous: false,
      company: "Amazon",
      role: "Product Manager",
      position: "Mid-level"
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [editingComment, setEditingComment] = useState<{id: string, text: string} | null>(null);
  const [likedPosts, setLikedPosts] = useState<{[key: string]: boolean}>({});
  const [comments, setComments] = useState<{[key: string]: ForumComment[]}>({
    "1": [
      {id: "1-1", author: "TechManager", text: "Thank you for sharing! Could you elaborate on how you found comparable salary data?", timestamp: "1 day ago", isCurrentUser: false},
      {id: "1-2", author: "SalaryExpert", text: "I used a similar approach and got a 15% increase. The key is having market data ready.", timestamp: "2 days ago", isCurrentUser: false}
    ],
    "2": [
      {id: "2-1", author: "SeniorDev", text: "Always negotiate! The worst they can say is no. Be confident but respectful.", timestamp: "3 days ago", isCurrentUser: false},
      {id: "2-2", author: "HiringManager", text: "I respect candidates who negotiate thoughtfully. Show you've done research.", timestamp: "4 days ago", isCurrentUser: false}
    ],
    "3": [
      {id: "3-1", author: "RemoteWorker", text: "Did you ask for any additional stipend for home office setup?", timestamp: "5 days ago", isCurrentUser: false},
      {id: "3-2", author: "WorkLifeBalance", text: "Remote work saved me 2 hours commuting daily. Worth every penny of the salary difference.", timestamp: "6 days ago", isCurrentUser: false}
    ]
  });
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    tags: "",
    isAnonymous: false
  });
  const [linkCopiedAlert, setLinkCopiedAlert] = useState(false);

  const handleSubmitPost = () => {
    const tagsArray = newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    
    const post: ForumPost = {
      id: Date.now().toString(),
      author: {
        name: newPost.isAnonymous ? "Anonymous" : "Current User",
        initials: newPost.isAnonymous ? "A" : "CU",
        avatar: newPost.isAnonymous ? undefined : "/lovable-uploads/47a5c183-6462-4482-85b2-320da7ad9a4e.png",
      },
      title: newPost.title,
      content: newPost.content,
      tags: tagsArray,
      likes: 0,
      comments: 0,
      timestamp: "Just now",
      isAnonymous: newPost.isAnonymous
    };
    
    setPosts([post, ...posts]);
    setNewPost({
      title: "",
      content: "",
      tags: "",
      isAnonymous: false
    });
    setIsDialogOpen(false);
  };

  const handleToggleLike = (postId: string) => {
    setPosts(
      posts.map(post => {
        if (post.id === postId) {
          // If already liked, unlike it
          if (likedPosts[postId]) {
            return { ...post, likes: post.likes - 1 };
          } 
          // If not liked, like it
          else {
            return { ...post, likes: post.likes + 1 };
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

  const handleSubmitComment = () => {
    if (!selectedPostId || !newComment.trim()) return;

    if (editingComment) {
      // Update existing comment
      setComments(prev => {
        const postComments = prev[selectedPostId] || [];
        return {
          ...prev,
          [selectedPostId]: postComments.map(comment => 
            comment.id === editingComment.id 
              ? {...comment, text: newComment} 
              : comment
          )
        };
      });

      setEditingComment(null);
      toast({
        title: "Comment Updated",
        description: "Your comment has been updated successfully."
      });
    } else {
      // Add new comment
      setComments(prev => {
        const postComments = prev[selectedPostId] || [];
        return {
          ...prev,
          [selectedPostId]: [
            ...postComments,
            {
              id: `${selectedPostId}-${Date.now()}`,
              author: "You",
              text: newComment,
              timestamp: "Just now",
              isCurrentUser: true
            }
          ]
        };
      });

      // Update comment count in the post
      setPosts(
        posts.map(post => {
          if (post.id === selectedPostId) {
            return { ...post, comments: post.comments + 1 };
          }
          return post;
        })
      );
      
      toast({
        title: "Comment Posted",
        description: "Your comment has been added to the discussion."
      });
    }

    // Reset and close
    setNewComment("");
  };

  const handleEditComment = (postId: string, commentId: string) => {
    const comment = comments[postId]?.find(c => c.id === commentId);
    if (comment) {
      setSelectedPostId(postId);
      setEditingComment({ id: commentId, text: comment.text });
      setNewComment(comment.text);
      setCommentDialogOpen(true);
    }
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    // Remove the comment
    setComments(prev => {
      const postComments = prev[postId] || [];
      return {
        ...prev,
        [postId]: postComments.filter(comment => comment.id !== commentId)
      };
    });

    // Update comment count in the post
    setPosts(
      posts.map(post => {
        if (post.id === postId) {
          return { ...post, comments: Math.max(0, post.comments - 1) };
        }
        return post;
      })
    );

    toast({
      title: "Comment Deleted",
      description: "Your comment has been removed from the discussion."
    });
  };

  const handleSharePost = (postId: string) => {
    // Create a URL with post ID as parameter
    const shareUrl = `${window.location.origin}/salary-negotiations?postId=${postId}`;
    
    // Try to use the clipboard API
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          setLinkCopiedAlert(true);
          setTimeout(() => setLinkCopiedAlert(false), 3000); // Hide after 3 seconds
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

  const filteredPosts = React.useMemo(() => {
    if (!filters) return posts;
    
    return posts.filter(post => {
      if (filters.search && !post.title.toLowerCase().includes(filters.search.toLowerCase()) && 
          !post.content.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      if (filters.company && post.company !== filters.company) {
        return false;
      }
      
      if (filters.role && post.role !== filters.role) {
        return false;
      }
      
      if (filters.position && post.position !== filters.position) {
        return false;
      }
      
      return true;
    });
  }, [posts, filters]);

  const sortedPosts = React.useMemo(() => {
    if (!filters?.sortOrder || filters.sortOrder === "newest") {
      return [...filteredPosts].sort((a, b) => {
        return a.timestamp > b.timestamp ? -1 : 1;
      });
    } else {
      return [...filteredPosts].sort((a, b) => {
        return a.timestamp > b.timestamp ? 1 : -1;
      });
    }
  }, [filteredPosts, filters?.sortOrder]);

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

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Salary Negotiation Forum</h2>
        <div className="flex justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
                <DialogDescription>
                  Share your salary negotiation experience or ask for advice
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Share your experience or ask a question..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Tags (comma separated)"
                    value={newPost.tags}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={newPost.isAnonymous}
                    onCheckedChange={(checked) => 
                      setNewPost({ ...newPost, isAnonymous: checked as boolean })
                    }
                  />
                  <label htmlFor="anonymous">Post anonymously</label>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmitPost}>Post Discussion</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {sortedPosts.length > 0 ? (
          sortedPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      {post.author.avatar && <AvatarImage src={post.author.avatar} alt={post.author.name} />}
                      <AvatarFallback>{post.author.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{post.author.name}</div>
                      <div className="text-xs text-muted-foreground">{post.timestamp}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {post.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <CardTitle className="text-lg mt-2">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{post.content}</p>
              </CardContent>
              <CardFooter className="border-t pt-3 flex justify-between">
                <div className="flex gap-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`flex gap-1 ${likedPosts[post.id] ? "text-primary" : "text-muted-foreground"}`}
                    onClick={() => handleToggleLike(post.id)}
                  >
                    <ThumbsUp className={`h-4 w-4 ${likedPosts[post.id] ? "fill-primary" : ""}`} />
                    <span>{post.likes}</span>
                  </Button>
                  <Dialog open={commentDialogOpen && selectedPostId === post.id} onOpenChange={(isOpen) => {
                    if (!isOpen) {
                      setEditingComment(null);
                    }
                    setCommentDialogOpen(isOpen);
                    if (isOpen) {
                      setSelectedPostId(post.id);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex gap-1 text-muted-foreground">
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comments}</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Comments on: {post.title}</DialogTitle>
                      </DialogHeader>
                      <div className="max-h-[400px] overflow-y-auto py-4">
                        {comments[post.id] && comments[post.id].length > 0 ? (
                          comments[post.id].map((comment, index) => (
                            <div key={index} className="mb-4 border-b pb-4 last:border-0">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback>{comment.author.slice(0, 2).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="text-sm font-medium">{comment.author}</div>
                                    <div className="text-xs text-muted-foreground">{comment.timestamp}</div>
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
                              <p className="text-sm pl-8">{comment.text}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to comment!</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Textarea
                          placeholder={editingComment ? "Edit your comment..." : "Write your comment..."}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          size="icon" 
                          onClick={handleSubmitComment}
                          disabled={!newComment.trim()}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground"
                  onClick={() => handleSharePost(post.id)}
                >
                  <Link className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No posts match your filters.</p>
          </div>
        )}
        
        <div className="flex justify-center py-4">
          <Button variant="outline" className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" />
            Load More
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NegotiationForum;
