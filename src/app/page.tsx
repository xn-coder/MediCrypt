
"use client";

import * as React from "react";
import { LoginRegisterForm } from "@/components/auth/login-register-form";
import { MediCryptApp } from "@/components/medi-crypt-app";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster"; // Ensure Toaster is included

// --- Mock User Data Store ---
// In a real application, this would be replaced by a secure backend and database.
interface MockUser {
  username: string;
  passwordHash: string; // Simulate a hashed password
  keyFileData: string; // Simulate key file content
}

const MOCK_USER_STORAGE_KEY = "mockUserData";

const getMockUser = (): MockUser | null => {
  if (typeof window === 'undefined') return null; // Avoid server-side execution
  const storedData = localStorage.getItem(MOCK_USER_STORAGE_KEY);
  return storedData ? JSON.parse(storedData) : null;
};

const saveMockUser = (user: MockUser) => {
   if (typeof window === 'undefined') return; // Avoid server-side execution
  localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(user));
};

const clearMockUser = () => {
   if (typeof window === 'undefined') return; // Avoid server-side execution
  localStorage.removeItem(MOCK_USER_STORAGE_KEY);
}


export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<MockUser | null>(null);
  const { toast } = useToast();

   // Check authentication status on initial load (client-side only)
   React.useEffect(() => {
     const user = getMockUser();
     if (user) {
        // In a real app, you'd likely verify the session/token here
        // For this mock, we just assume if user data exists, they were logged in.
        // A more robust mock might store a session token.
        // setIsAuthenticated(true); // Let's require login every time for this demo
        // setCurrentUser(user);
     }
   }, []);


  const handleLoginSuccess = (username: string) => {
    const user = getMockUser();
    // Basic check - in reality, server validates credentials & key
    if (user && user.username.toLowerCase() === username.toLowerCase()) {
      setIsAuthenticated(true);
      setCurrentUser(user);
      toast({ title: "Login Successful", description: `Welcome back, ${username}!` });
    } else {
        // This case should ideally be handled within LoginRegisterForm's validation
        toast({ title: "Login Failed", description: "Invalid credentials or key file.", variant: "destructive" });
    }
  };

  const handleRegisterSuccess = (username: string, keyBlob: Blob) => {
    // Simulate password hashing and store user data
    const passwordHash = `hashed_${username}_password`; // Simple simulation
    const reader = new FileReader();
    reader.onload = (event) => {
        const keyFileData = event.target?.result as string;
        const newUser: MockUser = { username, passwordHash, keyFileData };
        saveMockUser(newUser);

        // Trigger key file download
        const url = URL.createObjectURL(keyBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${username}_medicrypt_key.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
            title: "Registration Successful",
            description: "Please log in with your new credentials and the downloaded key file.",
        });
        // Optionally automatically log in or redirect to login view
        // setIsAuthenticated(true);
        // setCurrentUser(newUser);
    };
     reader.onerror = () => {
        toast({ title: "Registration Failed", description: "Could not process key file.", variant: "destructive" });
    };
    reader.readAsText(keyBlob); // Or readAsDataURL if storing base64
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    // clearMockUser(); // Optionally clear stored user data on logout
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 lg:p-12 bg-secondary">
      {!isAuthenticated ? (
        <LoginRegisterForm
          onLoginSuccess={handleLoginSuccess}
          onRegisterSuccess={handleRegisterSuccess}
          getMockUser={getMockUser} // Pass getter function
        />
      ) : (
        <MediCryptApp onLogout={handleLogout} username={currentUser?.username || 'User'} />
      )}
       {/* Toaster should be at the root or layout level, but included here for self-containment */}
       {/* <Toaster /> */}
    </main>
  );
}
