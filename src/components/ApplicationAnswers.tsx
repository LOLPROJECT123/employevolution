
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  PenIcon, 
  SaveIcon, 
  XIcon, 
  PlusIcon,
  TrashIcon,
  CopyIcon,
  CheckIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface SavedAnswer {
  id: string;
  category: string;
  question: string;
  answer: string;
  lastUsed?: string;
  usageCount?: number;
}

export function ApplicationAnswers() {
  const { toast } = useToast();
  const [savedAnswers, setSavedAnswers] = useState<SavedAnswer[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState("General");
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const categories = [
    "General",
    "Work Experience",
    "Skills",
    "Education",
    "Achievements",
    "Leadership",
    "Teamwork",
    "Problem Solving",
    "Challenges Overcome",
    "Project Highlights",
    "Career Goals"
  ];

  // Load saved answers from localStorage on initial load
  useEffect(() => {
    const storedAnswers = localStorage.getItem("savedApplicationAnswers");
    if (storedAnswers) {
      try {
        setSavedAnswers(JSON.parse(storedAnswers));
      } catch (e) {
        console.error("Error loading saved answers:", e);
      }
    }
  }, []);

  // Save answers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("savedApplicationAnswers", JSON.stringify(savedAnswers));
  }, [savedAnswers]);

  const handleSaveNew = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast({
        title: "Please fill in all fields",
        description: "Both question and answer are required.",
        variant: "destructive"
      });
      return;
    }

    const newId = Date.now().toString();
    const newSavedAnswer: SavedAnswer = {
      id: newId,
      category: newCategory,
      question: newQuestion,
      answer: newAnswer,
      lastUsed: new Date().toISOString(),
      usageCount: 0
    };

    setSavedAnswers([...savedAnswers, newSavedAnswer]);
    setNewCategory("General");
    setNewQuestion("");
    setNewAnswer("");
    setShowAddForm(false);

    toast({
      title: "Answer saved",
      description: "Your answer has been saved for future use."
    });
  };

  const handleUpdate = (id: string, updatedData: Partial<SavedAnswer>) => {
    setSavedAnswers(
      savedAnswers.map((answer) =>
        answer.id === id ? { ...answer, ...updatedData } : answer
      )
    );
    setEditingId(null);
    toast({
      title: "Answer updated",
      description: "Your changes have been saved."
    });
  };

  const handleDelete = (id: string) => {
    setSavedAnswers(savedAnswers.filter((answer) => answer.id !== id));
    toast({
      title: "Answer deleted",
      description: "The answer has been removed from your saved answers."
    });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    
    // Update usage count and last used
    setSavedAnswers(
      savedAnswers.map((answer) =>
        answer.id === id 
          ? { 
              ...answer, 
              usageCount: (answer.usageCount || 0) + 1,
              lastUsed: new Date().toISOString() 
            } 
          : answer
      )
    );
    
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
    
    toast({
      title: "Copied to clipboard",
      description: "Answer copied and ready to paste."
    });
  };

  // Filter answers based on search term
  const filteredAnswers = savedAnswers.filter(
    (answer) =>
      answer.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      answer.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      answer.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group answers by category
  const groupedAnswers = filteredAnswers.reduce((groups, answer) => {
    const category = answer.category || "Uncategorized";
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(answer);
    return groups;
  }, {} as Record<string, SavedAnswer[]>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Saved Application Answers</h2>
          <p className="text-muted-foreground">
            Store and reuse your answers to common application questions
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="sm:w-auto w-full">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add New Answer
        </Button>
      </div>

      <div className="relative">
        <Input
          type="text"
          placeholder="Search your saved answers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            onClick={() => setSearchTerm("")}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Answer</CardTitle>
            <CardDescription>
              Save an answer that you can reuse across job applications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                placeholder="e.g., Describe a time you overcame a challenge"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">Your Answer</Label>
              <Textarea
                id="answer"
                placeholder="Type your answer here..."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                rows={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNew}>
              <SaveIcon className="mr-2 h-4 w-4" />
              Save Answer
            </Button>
          </CardFooter>
        </Card>
      )}

      {filteredAnswers.length === 0 && !showAddForm && (
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-background p-3 mb-4">
              <SaveIcon className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No saved answers yet</h3>
            <p className="text-muted-foreground max-w-md">
              {searchTerm
                ? "No answers match your search. Try a different term or clear your search."
                : "Save your answers to common job application questions to reuse them across applications."}
            </p>
            {searchTerm ? (
              <Button variant="outline" className="mt-4" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            ) : (
              <Button className="mt-4" onClick={() => setShowAddForm(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Your First Answer
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {Object.entries(groupedAnswers).map(([category, answers]) => (
        <div key={category} className="space-y-3">
          <h3 className="text-lg font-semibold">{category}</h3>
          <div className="space-y-4">
            {answers.map((answer) => (
              <Card key={answer.id} className="overflow-hidden">
                {editingId === answer.id ? (
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`edit-category-${answer.id}`}>Category</Label>
                      <select
                        id={`edit-category-${answer.id}`}
                        defaultValue={answer.category}
                        onChange={(e) => handleUpdate(answer.id, { category: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edit-question-${answer.id}`}>Question</Label>
                      <Input
                        id={`edit-question-${answer.id}`}
                        defaultValue={answer.question}
                        onChange={(e) => handleUpdate(answer.id, { question: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edit-answer-${answer.id}`}>Answer</Label>
                      <Textarea
                        id={`edit-answer-${answer.id}`}
                        defaultValue={answer.answer}
                        onChange={(e) => handleUpdate(answer.id, { answer: e.target.value })}
                        rows={6}
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                      <Button onClick={() => setEditingId(null)}>
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                ) : (
                  <>
                    <CardHeader className="p-4 pb-0">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{answer.question}</CardTitle>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleCopy(answer.answer, answer.id)}
                          >
                            {copiedId === answer.id ? (
                              <CheckIcon className="h-4 w-4 text-green-500" />
                            ) : (
                              <CopyIcon className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingId(answer.id)}
                          >
                            <PenIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(answer.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <p className="whitespace-pre-wrap text-sm">{answer.answer}</p>
                      {(answer.usageCount || answer.lastUsed) && (
                        <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                          {answer.usageCount !== undefined && (
                            <span>Used {answer.usageCount} times</span>
                          )}
                          {answer.lastUsed && (
                            <span>
                              Last used: {new Date(answer.lastUsed).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
