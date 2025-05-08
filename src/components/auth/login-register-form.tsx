
"use client";

import * as React from "react";
import { Lock, UserPlus, KeyRound, FileText, Loader2, Mail, UserCog, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { MockUser } from "@/types/user"; // Import MockUser type
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface LoginRegisterFormProps {
  onLoginSuccess: (user: MockUser) => void; // Pass the full user object
  onRegisterSuccess: (email: string, keyBlob: Blob, role: 'user' | 'admin') => void;
  getMockUsers: () => MockUser[]; // Function to retrieve all mock users
}

export function LoginRegisterForm({ onLoginSuccess, onRegisterSuccess, getMockUsers }: LoginRegisterFormProps) {
  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [selectedRole, setSelectedRole] = React.useState<'user' | 'admin'>('user');
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [keyFile, setKeyFile] = React.useState<File | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setKeyFile(file);
    setError(null);
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setKeyFile(null);
    setIsLoading(false);
    setError(null);
    // setSelectedRole('user'); // Optionally reset role or keep last selection
    const fileInputLogin = document.getElementById('key-file-input-login') as HTMLInputElement;
    if (fileInputLogin) fileInputLogin.value = "";
  }

  const handleTabChange = (value: string) => {
    setMode(value as "login" | "register");
    resetForm();
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Email and password are required.");
      setIsLoading(false);
      return;
    }
    if (mode === 'login' && !keyFile) {
      setError("Key file is required for login.");
      setIsLoading(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

    try {
      const allUsers = getMockUsers();

      if (mode === "login") {
        const storedUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!storedUser) {
          throw new Error("User not found. Please register first or check your email.");
        }
        // Password check simulation
        const simulatedCorrectPasswordHash = `hashed_${storedUser.email}_password`; 
        if (password !== "password" && `hashed_${email}_password` !== storedUser.passwordHash) {
             if (`hashed_${email}_password` !== storedUser.passwordHash) { 
                throw new Error("Invalid password.");
            }
        }

        if (keyFile) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const uploadedKeyData = e.target?.result as string;
            if (uploadedKeyData?.trim() === storedUser.keyFileData?.trim()) {
              // Check if selected role matches stored role for login - optional strict check
              // if (selectedRole !== storedUser.role) {
              //   setError(`This account is a ${storedUser.role} account. Please select the correct role to log in.`);
              //   setIsLoading(false);
              //   return;
              // }
              onLoginSuccess(storedUser); 
              resetForm();
            } else {
              setError("Invalid key file content.");
              setIsLoading(false);
            }
          };
          reader.onerror = () => {
            setError("Failed to read key file.");
            setIsLoading(false);
          };
          reader.readAsText(keyFile);
        } else {
          throw new Error("Key file is required.");
        }

      } else { // Register mode
        if (allUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error("Email already exists. Please choose another or log in.");
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
          throw new Error("Please enter a valid email address.");
        }

        const keyFileContent = `USER_KEY_FOR_${email.toUpperCase()}_ROLE_${selectedRole.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        const keyBlob = new Blob([keyFileContent], { type: "text/plain" });
        
        onRegisterSuccess(email, keyBlob, selectedRole); 

        resetForm();
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-accent">
            <path fillRule="evenodd" d="M12.75 2.25a.75.75 0 0 1 .75.75v5.25H18a.75.75 0 0 1 0 1.5h-4.5V15a.75.75 0 0 1-1.5 0v-4.5H7.5a.75.75 0 0 1 0-1.5h4.5V3a.75.75 0 0 1 .75-.75ZM18.375 16.125a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75ZM5.625 16.125a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75ZM12 16.125a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
            <path d="M4.72 3.97a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1-1.06 1.06L4.72 5.03a.75.75 0 0 1 0-1.06ZM18.28 3.97a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l3.75-3.75a.75.75 0 0 1 1.06 0ZM4.72 20.03a.75.75 0 0 1 0-1.06l3.75-3.75a.75.75 0 0 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0ZM18.28 20.03a.75.75 0 0 1-1.06 0l-3.75-3.75a.75.75 0 1 1 1.06-1.06l3.75 3.75a.75.75 0 0 1 0 1.06Z" />
          </svg>
          MediCrypt Access
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {mode === "login" ? "Log in using your credentials and key file." : "Create a new account."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={mode} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <form onSubmit={handleSubmit}>
            <div className="space-y-3 mt-4">
               {/* Role Selection for Registration - always visible for clarity, but only impacts registration */}
               <RadioGroup
                value={selectedRole}
                onValueChange={(value: 'user' | 'admin') => setSelectedRole(value)}
                className="flex space-x-4 mb-3 justify-center items-center pt-2"
                aria-label="Account Type"
                // disabled={isLoading} // Keep enabled to allow selection before form submission
               >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="user" id="role-user" />
                  <Label htmlFor="role-user" className="flex items-center gap-1 cursor-pointer">
                    <User className="h-4 w-4"/> User
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="role-admin" />
                  <Label htmlFor="role-admin" className="flex items-center gap-1 cursor-pointer">
                    <UserCog className="h-4 w-4"/> Admin
                  </Label>
                </div>
              </RadioGroup>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10"
                  disabled={isLoading}
                  aria-label="Email"
                />
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Password (demo: 'password' or actual)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                  disabled={isLoading}
                  aria-label="Password"
                />
              </div>
            </div>

            <TabsContent value="login" className="mt-4 space-y-3">
              <div className="relative">
                <Label htmlFor="key-file-input-login" className="sr-only">Select Key File</Label>
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="key-file-input-login"
                  type="file"
                  onChange={handleFileChange}
                  required={mode === 'login'}
                  className="pl-10 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-accent-foreground hover:file:bg-accent/90"
                  accept=".txt"
                  disabled={isLoading}
                  aria-label="Key File"
                />
              </div>
              {keyFile && <p className="text-xs text-muted-foreground text-center">Selected key: {keyFile.name}</p>}
               <p className="text-xs text-muted-foreground text-center pt-1">
                Log in as a {selectedRole}. The system will verify your actual role.
              </p>
            </TabsContent>

            <TabsContent value="register" className="mt-4">
              <p className="text-sm text-muted-foreground text-center">
                Registering as a <span className="font-semibold text-accent">{selectedRole}</span>.
                A unique security key file will be generated and downloaded. Keep it safe!
              </p>
            </TabsContent>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full mt-6 bg-accent hover:bg-accent/90" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (mode === 'login' ? <Lock className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />)}
              {isLoading ? "Processing..." : (mode === "login" ? "Login" : `Register as ${selectedRole}`)}
            </Button>
          </form>
        </Tabs>
      </CardContent>
      <CardFooter className="text-center text-xs text-muted-foreground">
        Security is paramount. Never share your password or key file.
      </CardFooter>
    </Card>
  );
}
