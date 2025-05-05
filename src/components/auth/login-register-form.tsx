
"use client";

import * as React from "react";
import { Lock, UserPlus, KeyRound, FileText, Loader2, Mail } from "lucide-react"; // Replaced User with Mail
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define the type for the mock user data structure expected by this component
interface MockUser {
  email: string; // Changed from username
  passwordHash: string; // Simulate a hashed password
  keyFileData: string; // Simulate key file content
}

interface LoginRegisterFormProps {
  onLoginSuccess: (email: string) => void; // Changed param name
  onRegisterSuccess: (email: string, keyBlob: Blob) => void; // Changed param name
  getMockUser: () => MockUser | null; // Function to retrieve mock user data
}

export function LoginRegisterForm({ onLoginSuccess, onRegisterSuccess, getMockUser }: LoginRegisterFormProps) {
  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [email, setEmail] = React.useState(""); // Changed from username
  const [password, setPassword] = React.useState("");
  const [keyFile, setKeyFile] = React.useState<File | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setKeyFile(file);
    setError(null); // Clear error on new file selection
  };

   const resetForm = () => {
    setEmail(""); // Changed from setUsername
    setPassword("");
    setKeyFile(null);
    setIsLoading(false);
    setError(null);
    // Reset file input visually if possible (difficult to do reliably cross-browser)
    const fileInputLogin = document.getElementById('key-file-input-login') as HTMLInputElement;
    if (fileInputLogin) fileInputLogin.value = "";
     const fileInputRegister = document.getElementById('key-file-input-register') as HTMLInputElement; // Assuming register has a different ID if needed
     if (fileInputRegister) fileInputRegister.value = "";
  }

   const handleTabChange = (value: string) => {
    setMode(value as "login" | "register");
    resetForm(); // Reset form when switching tabs
   }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // Basic validation
    if (!email || !password) { // Changed from username
        setError("Email and password are required."); // Changed message
        setIsLoading(false);
        return;
    }
     if (mode === 'login' && !keyFile) {
        setError("Key file is required for login.");
        setIsLoading(false);
        return;
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      if (mode === "login") {
        // --- Mock Login Logic ---
        const storedUser = getMockUser();
        if (!storedUser) {
            throw new Error("No registered user found. Please register first.");
        }
        if (email.toLowerCase() !== storedUser.email.toLowerCase()) { // Changed from username
            throw new Error("Invalid email."); // Changed message
        }
        // Simulate password check (replace with actual hash comparison)
        // In a real app, the password would be sent to the server for verification.
        // Here, we just simulate checking against a locally derived "hash".
        const simulatedCorrectPasswordHash = `hashed_${storedUser.email}_password`; // Used email
        if (`hashed_${email}_password` !== simulatedCorrectPasswordHash) { // Check against entered email for simulation consistency
             throw new Error("Invalid password.");
        }
        // Simulate key file check
        if (keyFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const uploadedKeyData = e.target?.result as string;
                 // Trim both strings to handle potential whitespace differences from file saving/reading
                 // Add null/undefined checks for safety
                if (uploadedKeyData?.trim() === storedUser.keyFileData?.trim()) {
                    onLoginSuccess(email); // Changed param
                    resetForm(); // Reset after successful login confirmation
                    // No need to setIsLoading(false) here as the parent component will re-render
                } else {
                    setError("Invalid key file content.");
                    setIsLoading(false);
                }
            };
             reader.onerror = () => {
                setError("Failed to read key file.");
                setIsLoading(false);
            };
            reader.readAsText(keyFile); // Or readAsDataURL if stored as base64
        } else {
             throw new Error("Key file is required."); // Should be caught earlier, but safety check
        }
        // Note: onLoginSuccess is called inside the FileReader onload if successful

      } else {
        // --- Mock Registration Logic ---
         const existingUser = getMockUser();
         // Check if existingUser exists AND its email matches the one being registered
         if (existingUser && existingUser.email && existingUser.email.toLowerCase() === email.toLowerCase()) { // Added check for existingUser.email
            throw new Error("Email already exists. Please choose another or log in."); // Changed message
         }

        // Validate email format (basic)
        if (!/\S+@\S+\.\S+/.test(email)) {
            throw new Error("Please enter a valid email address.");
        }


        // Generate mock key file content (using email for uniqueness)
        const keyFileContent = `USER_KEY_FOR_${email.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        const keyBlob = new Blob([keyFileContent], { type: "text/plain" });

        // Parent component handles saving user and triggering download
        onRegisterSuccess(email, keyBlob); // Changed param

        // Reset form and potentially switch to login view after parent confirms success
        // For now, just reset and stay on register tab, parent shows toast
        resetForm();
        setIsLoading(false); // Reset loading after mock "work" is done
        // Optional: Switch to login tab after registration
        // setMode("login");
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
             {/* Shared Fields */}
            <div className="space-y-3 mt-4">
               <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /> {/* Changed icon */}
                 <Input
                    id="email" // Changed id
                    type="email" // Changed type
                    placeholder="Email" // Changed placeholder
                    value={email}
                    onChange={(e) => setEmail(e.target.value)} // Changed state setter
                    required
                    className="pl-10"
                    disabled={isLoading}
                    aria-label="Email" // Changed label
                  />
               </div>
                <div className="relative">
                 <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                 <Input
                    id="password"
                    type="password"
                    placeholder="Password"
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
                    id="key-file-input-login" // Specific ID for login file input
                    type="file"
                    onChange={handleFileChange}
                    required={mode === 'login'} // Required only for login
                    className="pl-10 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-accent-foreground hover:file:bg-accent/90"
                    accept=".txt" // Restrict to text files or specific extension
                    disabled={isLoading}
                    aria-label="Key File"
                 />
                 </div>
                 {keyFile && <p className="text-xs text-muted-foreground text-center">Selected key: {keyFile.name}</p>}
            </TabsContent>

            <TabsContent value="register" className="mt-4">
              <p className="text-sm text-muted-foreground text-center">
                A unique security key file will be generated and downloaded upon registration. Keep it safe!
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
                {isLoading ? "Processing..." : (mode === "login" ? "Login" : "Register")}
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
