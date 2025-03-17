
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { CopyIcon, KeyIcon, RefreshCwIcon, CheckIcon } from 'lucide-react';

type PasswordLength = 8 | 12;

interface SavedPassword {
  website: string;
  username: string;
  password: string;
  length: PasswordLength;
  createdAt: string;
}

export const PasswordManager = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [passwordLength, setPasswordLength] = useState<PasswordLength>(12);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [savedPasswords, setSavedPasswords] = useState<SavedPassword[]>([]);
  const [website, setWebsite] = useState('');
  const [username, setUsername] = useState('');
  const [copied, setCopied] = useState(false);

  // Load saved passwords from localStorage
  useEffect(() => {
    const storedPasswords = localStorage.getItem('savedJobPasswords');
    if (storedPasswords) {
      setSavedPasswords(JSON.parse(storedPasswords));
    }
    
    // Generate initial password
    generatePassword(passwordLength);
  }, []);

  // Save passwords to localStorage when updated
  useEffect(() => {
    if (savedPasswords.length > 0) {
      localStorage.setItem('savedJobPasswords', JSON.stringify(savedPasswords));
    }
  }, [savedPasswords]);

  const generatePassword = (length: PasswordLength) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let newPassword = "";
    
    // Ensure at least one uppercase, one lowercase, one number, one special char
    newPassword += "A"; // Uppercase
    newPassword += "a"; // Lowercase
    newPassword += "1"; // Number
    newPassword += "!"; // Special
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      newPassword += charset[randomIndex];
    }
    
    // Shuffle the password
    newPassword = newPassword
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
    
    setGeneratedPassword(newPassword);
    setPasswordLength(length);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: "Password Copied",
        description: "Password has been copied to clipboard",
      });
    });
  };

  const savePassword = () => {
    if (!website || !username || !generatedPassword) {
      toast({
        title: "Missing Information",
        description: "Please provide the website, username, and password",
        variant: "destructive",
      });
      return;
    }
    
    const newPassword: SavedPassword = {
      website,
      username,
      password: generatedPassword,
      length: passwordLength,
      createdAt: new Date().toISOString(),
    };
    
    setSavedPasswords([...savedPasswords, newPassword]);
    
    toast({
      title: "Password Saved",
      description: `Password for ${website} has been saved`,
    });
    
    // Reset form
    setWebsite('');
    setUsername('');
    generatePassword(passwordLength);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center">
          <KeyIcon className="w-4 h-4 mr-2" />
          Password Manager
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Job Application Password Manager</DialogTitle>
          <DialogDescription>
            Generate and save passwords for job application websites.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Button 
                variant={passwordLength === 8 ? "default" : "outline"} 
                size="sm"
                onClick={() => generatePassword(8)}
              >
                8 Characters
              </Button>
              <Button 
                variant={passwordLength === 12 ? "default" : "outline"} 
                size="sm"
                onClick={() => generatePassword(12)}
              >
                12 Characters
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => generatePassword(passwordLength)}
              >
                <RefreshCwIcon className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="relative">
              <Input 
                value={generatedPassword} 
                readOnly 
                className="pr-10"
              />
              <Button 
                size="sm"
                variant="ghost"
                className="absolute right-0 top-0 h-full px-3"
                onClick={copyToClipboard}
              >
                {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="website">Website/Company</Label>
              <Input 
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username/Email</Label>
              <Input 
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            
            <Button onClick={savePassword} className="w-full">
              Save Password
            </Button>
          </div>
          
          {savedPasswords.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Saved Passwords</h3>
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {savedPasswords.map((saved, index) => (
                  <div key={index} className="border rounded-md p-3 text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{saved.website}</p>
                        <p className="text-muted-foreground text-xs">{saved.username}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(saved.password);
                          toast({
                            title: "Password Copied",
                            description: `Password for ${saved.website} copied to clipboard`,
                          });
                        }}
                      >
                        <CopyIcon className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
