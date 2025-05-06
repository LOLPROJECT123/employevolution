import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, MessageCircle, Share2, Filter, PlusCircle } from "lucide-react";

type ForumPost = {
  id: string;
  author: {
    name: string;
    avatar?: string;
    initials: string;
  };
  title: string;
  content: string;
  tags: string[];
  likes: number;
  comments: number;
  timestamp: string;
  isAnonymous: boolean;
  company?: string;
  role?: string;
  position?: string;
};

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
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    tags: "",
    isAnonymous: false
  });

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
                  <Button variant="ghost" size="sm" className="flex gap-1 text-muted-foreground">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{post.likes}</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="flex gap-1 text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments}</span>
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Share2 className="h-4 w-4 mr-1" />
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
