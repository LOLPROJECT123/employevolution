
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
import { MessageSquarePlus, ThumbsUp, MessageCircle, Send, PlusCircle, Filter, SortDesc, SortAsc } from "lucide-react";
import { ResumePost, ResumeComment } from "@/types/resumePost";

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
          createdAt: "2 days ago"
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
          createdAt: "1 day ago"
        }
      ],
      createdAt: "3 days ago",
      tags: ["Software Engineering", "Google", "Full Stack", "Resume Review"]
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
          createdAt: "12 hours ago"
        }
      ],
      createdAt: "2 days ago",
      tags: ["Data Science", "Meta", "Success Story", "Machine Learning"]
    }
  ]);

  const [selectedPost, setSelectedPost] = useState<ResumePost | null>(null);
  const [newComment, setNewComment] = useState("");
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    tags: "",
    isAnonymous: false,
    resumeFile: null as File | null
  });
  
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isNewPostDialogOpen, setIsNewPostDialogOpen] = useState(false);

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
      tags: tagsArray
    };
    
    setPosts([post, ...posts]);
    setNewPost({
      title: "",
      content: "",
      tags: "",
      isAnonymous: false,
      resumeFile: null
    });
    
    setIsNewPostDialogOpen(false);
    toast({
      title: "Post Created",
      description: "Your post has been successfully published."
    });
  };

  const handleSubmitComment = () => {
    if (!selectedPost || !newComment.trim()) return;

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
      createdAt: "Just now"
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
    setNewComment("");
    setIsReplyDialogOpen(false);
    toast({
      title: "Reply Posted",
      description: "Your comment has been added to the discussion."
    });
  };

  const handleUpvote = (postId: string) => {
    setPosts(
      posts.map(post => {
        if (post.id === postId) {
          return { ...post, upvotes: post.upvotes + 1 };
        }
        return post;
      })
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewPost({ ...newPost, resumeFile: e.target.files[0] });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <h2 className="text-2xl font-semibold">Resume Forum</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="flex items-center">
            <SortDesc className="h-4 w-4 mr-2" />
            Sort
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

      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="space-y-6 pr-4">
          {posts.map(post => (
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
                <CardTitle className="text-lg mt-2">{post.title}</CardTitle>
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
                    className="flex gap-1 text-muted-foreground"
                    onClick={() => handleUpvote(post.id)}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {post.upvotes}
                  </Button>
                  <Dialog open={selectedPost?.id === post.id && isReplyDialogOpen} onOpenChange={(open) => {
                    setIsReplyDialogOpen(open);
                    if (open) setSelectedPost(post);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex gap-1 text-muted-foreground">
                        <MessageCircle className="h-4 w-4" />
                        {post.comments.length}
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
                              <div className="flex items-center space-x-2 mb-2">
                                <Avatar className="h-6 w-6">
                                  {comment.author.avatar && <AvatarImage src={comment.author.avatar} />}
                                  <AvatarFallback>{comment.author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="text-sm font-medium">{comment.author.name}</div>
                                  <div className="text-xs text-muted-foreground">{comment.createdAt}</div>
                                </div>
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
                          placeholder="Write your reply..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          size="icon" 
                          onClick={handleSubmitComment}
                          disabled={!newComment.trim()}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardFooter>
            </Card>
          ))}
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
