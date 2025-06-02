
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { RealTimeService } from '@/services/realTimeService';
import { OperationalTransformService, Operation, CursorPosition } from '@/services/operationalTransformService';
import { Users, MessageSquare, History, Save } from 'lucide-react';

interface CollaborativeEditorProps {
  documentId: string;
  initialContent: string;
  onSave: (content: string) => void;
  title: string;
}

export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  documentId,
  initialContent,
  onSave,
  title
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState(initialContent);
  const [version, setVersion] = useState(1);
  const [collaborators, setCollaborators] = useState<CursorPosition[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [pendingOperations, setPendingOperations] = useState<Operation[]>([]);

  const getUserColor = useCallback((userId: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }, []);

  useEffect(() => {
    if (!user) return;

    // Subscribe to document changes
    const unsubscribeDoc = RealTimeService.subscribeToResumeChanges(
      documentId,
      (change) => {
        if (change.operation) {
          handleRemoteOperation(change.operation);
        }
      }
    );

    // Subscribe to collaborator presence
    const unsubscribePresence = RealTimeService.subscribeToPresence(
      `document_${documentId}`,
      (presences) => {
        const cursors = presences
          .filter(p => p.user_id !== user.id)
          .map(p => ({
            userId: p.user_id,
            position: 0,
            userInfo: {
              name: p.name,
              color: getUserColor(p.user_id)
            }
          }));
        setCollaborators(cursors);
      }
    );

    setIsConnected(true);

    return () => {
      unsubscribeDoc();
      unsubscribePresence();
    };
  }, [user, documentId, getUserColor]);

  const handleRemoteOperation = (operation: Operation) => {
    if (operation.userId === user?.id) return;

    setContent(prev => OperationalTransformService.applyOperation(prev, operation));
    setVersion(prev => prev + 1);

    // Transform local cursors
    setCollaborators(prev => 
      prev.map(cursor => OperationalTransformService.transformCursor(cursor, operation))
    );
  };

  const handleTextChange = (newContent: string) => {
    if (!user || !textareaRef.current) return;

    const oldContent = content;
    const cursorPos = textareaRef.current.selectionStart;

    // Create operation based on the change
    let operation: Operation;

    if (newContent.length > oldContent.length) {
      // Insert operation
      const insertPos = findInsertPosition(oldContent, newContent);
      const insertedText = newContent.slice(insertPos, insertPos + (newContent.length - oldContent.length));
      
      operation = {
        type: 'insert',
        position: insertPos,
        text: insertedText,
        userId: user.id,
        timestamp: Date.now()
      };
    } else if (newContent.length < oldContent.length) {
      // Delete operation
      const deletePos = findDeletePosition(oldContent, newContent);
      const deleteLength = oldContent.length - newContent.length;
      
      operation = {
        type: 'delete',
        position: deletePos,
        length: deleteLength,
        userId: user.id,
        timestamp: Date.now()
      };
    } else {
      return; // No change
    }

    setContent(newContent);
    setPendingOperations(prev => [...prev, operation]);

    // Broadcast operation to other clients
    broadcastOperation(operation);
  };

  const findInsertPosition = (oldContent: string, newContent: string): number => {
    for (let i = 0; i < Math.min(oldContent.length, newContent.length); i++) {
      if (oldContent[i] !== newContent[i]) {
        return i;
      }
    }
    return oldContent.length;
  };

  const findDeletePosition = (oldContent: string, newContent: string): number => {
    for (let i = 0; i < Math.min(oldContent.length, newContent.length); i++) {
      if (oldContent[i] !== newContent[i]) {
        return i;
      }
    }
    return newContent.length;
  };

  const broadcastOperation = async (operation: Operation) => {
    try {
      await RealTimeService.broadcastMessage(
        `document_${documentId}`,
        'operation',
        { operation, documentId, version }
      );
    } catch (error) {
      console.error('Failed to broadcast operation:', error);
    }
  };

  const handleCursorChange = () => {
    if (!user || !textareaRef.current) return;

    const cursorPos = textareaRef.current.selectionStart;
    RealTimeService.updatePresence(`document_${documentId}`, {
      user_id: user.id,
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
      status: 'online',
      current_section: `cursor:${cursorPos}`
    });
  };

  const addComment = () => {
    if (!user || !textareaRef.current) return;

    const selection = {
      start: textareaRef.current.selectionStart,
      end: textareaRef.current.selectionEnd
    };

    const newComment = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
      text: `Comment on selection: "${content.slice(selection.start, selection.end)}"`,
      position: selection,
      timestamp: new Date(),
      resolved: false
    };

    setComments(prev => [...prev, newComment]);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle>{title}</CardTitle>
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              <Badge variant="outline">v{version}</Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Comments ({comments.length})
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={addComment}
                disabled={!textareaRef.current?.selectionStart}
              >
                Add Comment
              </Button>
              
              <Button size="sm" onClick={() => onSave(content)}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
          
          {/* Collaborators */}
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {collaborators.length} collaborator{collaborators.length !== 1 ? 's' : ''}
            </span>
            <div className="flex -space-x-2">
              {collaborators.map((collaborator) => (
                <Avatar key={collaborator.userId} className="h-6 w-6 border-2 border-background">
                  <AvatarFallback 
                    className="text-xs"
                    style={{ backgroundColor: collaborator.userInfo.color }}
                  >
                    {collaborator.userInfo.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Editor */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleTextChange(e.target.value)}
          onSelect={handleCursorChange}
          onKeyUp={handleCursorChange}
          className="min-h-[400px] font-mono text-sm"
          placeholder="Start typing to collaborate..."
        />
        
        {/* Cursor indicators */}
        {collaborators.map((collaborator) => (
          <div
            key={collaborator.userId}
            className="absolute pointer-events-none"
            style={{
              top: `${Math.floor(collaborator.position / 80) * 1.5}rem`,
              left: `${(collaborator.position % 80) * 0.6}ch`,
              borderLeft: `2px solid ${collaborator.userInfo.color}`,
              height: '1.2rem'
            }}
          >
            <div
              className="absolute -top-6 left-0 px-1 py-0.5 text-xs text-white rounded"
              style={{ backgroundColor: collaborator.userInfo.color }}
            >
              {collaborator.userInfo.name}
            </div>
          </div>
        ))}
      </div>

      {/* Comments Panel */}
      {showComments && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Comments & Annotations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-muted-foreground">No comments yet. Select text and click "Add Comment" to get started.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{comment.userName}</span>
                    <span className="text-xs text-muted-foreground">
                      {comment.timestamp.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{comment.text}</p>
                  {!comment.resolved && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setComments(prev =>
                          prev.map(c => c.id === comment.id ? { ...c, resolved: true } : c)
                        );
                      }}
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
