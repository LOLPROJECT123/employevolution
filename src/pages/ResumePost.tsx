import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { useMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Upload, 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown,
  Star,
  Eye,
  Calendar,
  Tag
} from 'lucide-react';
import { ResumePost as ResumePostType, ResumeComment } from '@/types/resumePost';
import { useAuth } from '@/hooks/useAuth';

const samplePosts: ResumePostType[] = [
  {
    id: '1',
    title: 'Software Engineer Resume - Need feedback for FAANG applications',
    author: { id: '1', name: 'Alex Chen', avatar: undefined },
    content: 'Looking for feedback on my resume for Software Engineer positions at FAANG companies. I have 3 years of experience and want to improve my chances.',
    resumeUrl: '/sample-resume.pdf',
    upvotes: 24,
    downvotes: 3,
    comments: [
      {
        id: '1',
        author: { id: '2', name: 'Sarah Wilson' },
        content: 'Great experience section! I would suggest adding more quantifiable achievements.',
        upvotes: 8,
        downvotes: 0,
        createdAt: '2024-01-15T10:30:00Z',
        isCurrentUser: false
      }
    ],
    createdAt: '2024-01-15T09:00:00Z',
    tags: ['Software Engineer', 'FAANG', 'Frontend', 'React'],
    company: 'Google',
    role: 'Software Engineer',
    matchPercentage: 85
  },
  {
    id: '2',
    title: 'Product Manager Resume Review - Transitioning from Engineering',
    author: { id: '3', name: 'Michael Rodriguez' },
    content: 'Transitioning from a senior engineering role to product management. Would love feedback on how to highlight transferable skills.',
    upvotes: 18,
    downvotes: 1,
    comments: [],
    createdAt: '2024-01-14T14:20:00Z',
    tags: ['Product Manager', 'Career Change', 'Engineering'],
    company: 'Meta',
    role: 'Product Manager',
    matchPercentage: 72
  }
];

const ResumePost = () => {
  const isMobile = useMobile();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('browse');
  const [posts, setPosts] = useState<ResumePostType[]>(samplePosts);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    tags: '',
    company: '',
    role: ''
  });

  const handleCreatePost = () => {
    if (!user) {
      navigate('/auth?mode=signin');
      return;
    }

    if (!newPost.title.trim() || !newPost.content.trim()) {
      return;
    }

    const post: ResumePostType = {
      id: Date.now().toString(),
      title: newPost.title,
      author: { 
        id: user.id, 
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous'
      },
      content: newPost.content,
      upvotes: 0,
      downvotes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      company: newPost.company,
      role: newPost.role
    };

    setPosts([post, ...posts]);
    setNewPost({ title: '', content: '', tags: '', company: '', role: '' });
    setActiveTab('browse');
  };

  const handleVote = (postId: string, voteType: 'up' | 'down') => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        if (voteType === 'up') {
          return { ...post, upvotes: post.upvotes + 1 };
        } else {
          return { ...post, downvotes: post.downvotes + 1 };
        }
      }
      return post;
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader title="Resume Forum" />}
      
      <div className="bg-blue-600 dark:bg-blue-900 py-4 px-4 md:py-6 md:px-6">
        <div className="container mx-auto max-w-screen-xl">
          <h1 className="text-xl md:text-3xl font-bold text-white">
            Resume Forum
          </h1>
          <p className="text-blue-100 mt-2">
            Get feedback on your resume from the community and professionals
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-screen-xl py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Posts</TabsTrigger>
            <TabsTrigger value="create">Create Post</TabsTrigger>
            <TabsTrigger value="my-posts">My Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6 mt-6">
            <div className="grid gap-6">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {post.author.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg">{post.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            by {post.author.name} • {formatDate(post.createdAt)}
                          </p>
                        </div>
                      </div>
                      {post.matchPercentage && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {post.matchPercentage}% match
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">{post.content}</p>
                    
                    {post.company && post.role && (
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>📍 {post.company}</span>
                        <span>💼 {post.role}</span>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={() => handleVote(post.id, 'up')}
                          className="flex items-center space-x-1 text-sm hover:text-green-600 transition-colors"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>{post.upvotes}</span>
                        </button>
                        <button 
                          onClick={() => handleVote(post.id, 'down')}
                          className="flex items-center space-x-1 text-sm hover:text-red-600 transition-colors"
                        >
                          <ThumbsDown className="h-4 w-4" />
                          <span>{post.downvotes}</span>
                        </button>
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments.length} comments</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {post.resumeUrl && (
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            View Resume
                          </Button>
                        )}
                        <Button variant="default" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Comment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Post Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Software Engineer Resume - Need feedback for FAANG"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Target Company (Optional)</Label>
                    <Input
                      id="company"
                      placeholder="e.g., Google, Meta, Amazon"
                      value={newPost.company}
                      onChange={(e) => setNewPost({ ...newPost, company: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Target Role (Optional)</Label>
                    <Input
                      id="role"
                      placeholder="e.g., Software Engineer, Product Manager"
                      value={newPost.role}
                      onChange={(e) => setNewPost({ ...newPost, role: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="e.g., React, Frontend, Senior Level"
                    value={newPost.tags}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="content">Post Description</Label>
                  <Textarea
                    id="content"
                    placeholder="Describe what kind of feedback you're looking for..."
                    rows={4}
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label>Resume Upload</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Drop your resume here or click to browse
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Choose File
                    </Button>
                  </div>
                </div>
                
                <Button onClick={handleCreatePost} className="w-full">
                  Create Post
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-posts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No posts yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab('create')}
                  >
                    Create Your First Post
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ResumePost;
