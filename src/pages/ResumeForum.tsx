
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ResumePost } from "@/types/resumePost";
import { ArrowUpIcon, ArrowDownIcon, MessageCircleIcon, Upload } from "lucide-react";

// Sample data for resume posts
const samplePosts: ResumePost[] = [
  {
    id: "1",
    title: "Software Engineer Resume Review - 4 YOE",
    author: {
      id: "user1",
      name: "TechDev123",
      avatar: "https://i.pravatar.cc/150?img=1"
    },
    content: "I've been applying to FAANG companies but haven't heard back. Any tips on improving my resume?",
    resumeUrl: "/sample-resume.pdf",
    upvotes: 24,
    downvotes: 3,
    comments: [
      {
        id: "c1",
        author: {
          id: "user2",
          name: "HiringManager",
          avatar: "https://i.pravatar.cc/150?img=2"
        },
        content: "You should quantify your achievements more. Instead of 'developed features', say 'developed 5 key features that increased user engagement by 30%'.",
        upvotes: 15,
        downvotes: 0,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    tags: ["Software Engineer", "FAANG", "4 YOE"],
    matchPercentage: 75
  },
  {
    id: "2",
    title: "New Grad Resume - CS Degree",
    author: {
      id: "user3",
      name: "GradStudent2024",
      avatar: "https://i.pravatar.cc/150?img=3"
    },
    content: "Just graduated with a CS degree. Looking for entry-level positions. Would appreciate feedback on my resume.",
    upvotes: 18,
    downvotes: 1,
    comments: [
      {
        id: "c2",
        author: {
          id: "user4",
          name: "SeniorRecruiter",
          avatar: "https://i.pravatar.cc/150?img=4"
        },
        content: "Your projects section is strong, but I'd move it above your education since it's more relevant to the jobs you're applying for.",
        upvotes: 10,
        downvotes: 1,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    tags: ["New Grad", "Entry Level", "Computer Science"],
    matchPercentage: 62
  }
];

const ResumeForum = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<ResumePost[]>(samplePosts);
  const [activeTab, setActiveTab] = useState("browse");
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");

  const handleCreatePost = () => {
    if (!newPostTitle || !newPostContent) return;
    
    const newPost: ResumePost = {
      id: `post-${Date.now()}`,
      title: newPostTitle,
      author: {
        id: "current-user",
        name: "CurrentUser",
        avatar: "https://i.pravatar.cc/150?img=5"
      },
      content: newPostContent,
      upvotes: 0,
      downvotes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      tags: [],
      matchPercentage: 50 // Default value
    };
    
    setPosts([newPost, ...posts]);
    setNewPostTitle("");
    setNewPostContent("");
    setActiveTab("browse");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 flex-1">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Resume Forum</h1>
          <p className="text-muted-foreground mb-8 text-center">
            Share your resume, get feedback from the community, and help others improve their job applications.
          </p>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
              <TabsTrigger value="browse">Browse Resumes</TabsTrigger>
              <TabsTrigger value="create">Create Post</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6">
              <div className="flex flex-col space-y-4">
                {posts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="font-medium text-xl">{post.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={post.author.avatar} />
                              <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">{post.author.name}</span>
                          </div>
                        </div>
                        {post.matchPercentage && (
                          <div className="flex flex-col items-end">
                            <span className="text-sm text-muted-foreground">Match</span>
                            <span className={`font-bold ${post.matchPercentage >= 70 ? 'text-green-500' : post.matchPercentage >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                              {post.matchPercentage}%
                            </span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-base">{post.content}</p>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm">
                            <ArrowUpIcon className="h-4 w-4" />
                          </Button>
                          <span>{post.upvotes - post.downvotes}</span>
                          <Button variant="ghost" size="sm">
                            <ArrowDownIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircleIcon className="h-4 w-4" />
                          <span>{post.comments.length}</span>
                        </div>
                      </div>
                      {post.resumeUrl && (
                        <Button variant="outline" size="sm" className="flex items-center space-x-1">
                          <span>View Resume</span>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="create" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create a New Post</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Title</label>
                    <Input 
                      placeholder="E.g., Senior Frontend Developer Resume Review" 
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Content</label>
                    <Textarea 
                      placeholder="Describe your background and what specific feedback you're looking for..."
                      className="min-h-[100px]"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Upload Resume (PDF)</label>
                    <div className="border-2 border-dashed rounded-lg p-6 flex justify-center items-center">
                      <div className="text-center">
                        <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Drag & drop your resume here, or <span className="text-primary">browse</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleCreatePost}>Submit Post</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ResumeForum;
