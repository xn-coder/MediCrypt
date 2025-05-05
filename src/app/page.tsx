
"use client";

import * as React from "react";
import { LoginRegisterForm } from "@/components/auth/login-register-form";
import { MediCryptApp } from "@/components/medi-crypt-app";
import { useToast } from "@/hooks/use-toast";
// Toaster is typically in layout.tsx, but kept here for standalone demo potential
// import { Toaster } from "@/components/ui/toaster";

// --- Mock User Data Store ---
// In a real application, this would be replaced by a secure backend and database.
interface MockUser {
  username: string;
  passwordHash: string; // Simulate a hashed password
  keyFileData: string; // Simulate key file content
  encryptedFiles?: { [originalFilename: string]: string }; // Store { originalFilename: decryptionKey }
}

const MOCK_USER_STORAGE_KEY = "mockUserData";

// --- Component ---

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<MockUser | null>(null);
  // Use state to manage mock user data to avoid direct localStorage access during SSR/initial render
  const [mockUser, setMockUser] = React.useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(true); // Track initial loading state
  const { toast } = useToast();

   // Load user data from localStorage only on the client-side after hydration
   React.useEffect(() => {
     if (typeof window !== 'undefined') {
        const storedData = localStorage.getItem(MOCK_USER_STORAGE_KEY);
        if (storedData) {
            try {
                const parsedUser: MockUser = JSON.parse(storedData);
                // Ensure encryptedFiles exists
                if (!parsedUser.encryptedFiles) {
                    parsedUser.encryptedFiles = {};
                }
                setMockUser(parsedUser);
                // Optionally, you could auto-login here if a session token was stored
                // For this demo, we require login each time.
            } catch (e) {
                console.error("Failed to parse user data from localStorage", e);
                localStorage.removeItem(MOCK_USER_STORAGE_KEY); // Clear invalid data
            }
        }
     }
     setIsLoading(false); // Finished loading attempt
   }, []);

    // Function to get the current mock user (avoids direct localStorage reads in child components)
    const getMockUser = (): MockUser | null => {
        return mockUser;
    };

    // Function to save the mock user (updates state and localStorage)
    const saveMockUser = (user: MockUser | null) => {
        if (user) {
             if (typeof window !== 'undefined') {
                localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(user));
             }
            setMockUser(user);
        } else {
            if (typeof window !== 'undefined') {
                 localStorage.removeItem(MOCK_USER_STORAGE_KEY);
            }
            setMockUser(null);
        }
    };

    // Function to clear the mock user (updates state and localStorage)
    const clearMockUser = () => {
        saveMockUser(null);
    }

    // Function to update only the encrypted files part of the user data
    const updateUserEncryptedFiles = (originalFilename: string, decryptionKey: string) => {
        if (mockUser) {
            const updatedUser: MockUser = {
                ...mockUser,
                encryptedFiles: {
                    ...mockUser.encryptedFiles,
                    [originalFilename]: decryptionKey,
                },
            };
            saveMockUser(updatedUser);
            // Update currentUser state as well if the logged-in user is the one being updated
            if (currentUser && currentUser.username === updatedUser.username) {
                 setCurrentUser(updatedUser);
            }
             toast({
                title: "Encryption Key Saved",
                description: `Key for '${originalFilename}' stored in your profile.`,
            });
        } else {
            console.error("Attempted to update encrypted files, but no user data found.");
             toast({
                title: "Error Saving Key",
                description: "Could not save the encryption key. User data not found.",
                variant: "destructive",
             });
        }
    };


  const handleLoginSuccess = (username: string) => {
    const user = getMockUser(); // Use the state-backed getter
    // Basic check - in reality, server validates credentials & key
    // The login form already performed the necessary checks based on getMockUser() data
    if (user && user.username.toLowerCase() === username.toLowerCase()) {
      setIsAuthenticated(true);
      // Ensure encryptedFiles is initialized if missing
      const loggedInUser = { ...user, encryptedFiles: user.encryptedFiles || {} };
      setCurrentUser(loggedInUser); // Set the currently logged-in user state
      toast({ title: "Login Successful", description: `Welcome back, ${username}!` });
    } else {
        // This case should ideally not happen if LoginRegisterForm logic is correct
        console.error("Login success handler called but user data mismatch.");
        toast({ title: "Login Failed", description: "An unexpected error occurred during login.", variant: "destructive" });
    }
  };

  const handleRegisterSuccess = (username: string, keyBlob: Blob) => {
    // Simulate password hashing and prepare user data
    // In a real app, the server would handle password hashing.
    const passwordHash = `hashed_${username}_password`; // Simple simulation
    const reader = new FileReader();

    reader.onload = (event) => {
        const keyFileData = event.target?.result as string;
        if (!keyFileData) {
             toast({ title: "Registration Failed", description: "Could not read generated key file.", variant: "destructive" });
             return;
        }
        // Initialize encryptedFiles as an empty object for new users
        const newUser: MockUser = { username, passwordHash, keyFileData, encryptedFiles: {} };
        saveMockUser(newUser); // Save the new user to state and localStorage

        // Trigger key file download
        try {
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
                description: "Key file downloaded. Please log in with your new credentials.",
            });
        } catch (downloadError) {
             console.error("Failed to trigger key file download:", downloadError);
             toast({ title: "Registration Warning", description: "Account created, but key file download failed. Please try registering again or contact support.", variant: "destructive" });
              // Consider rolling back the user save or providing manual download instructions
              clearMockUser(); // Rollback user save on download failure for this demo
        }
    };
     reader.onerror = () => {
        toast({ title: "Registration Failed", description: "Could not process key file data.", variant: "destructive" });
    };
    // Read blob as text to store it; adjust if storing as base64 needed later
    reader.readAsText(keyBlob);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    // It's generally good practice to clear sensitive user data on logout,
    // even in a mock scenario, unless you specifically need persistence across sessions without login.
    // clearMockUser(); // Uncomment if you want to force re-registration/login after logout
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  };

   // Show loading state until client-side check is complete
   if (isLoading) {
        return (
             <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 lg:p-12 bg-secondary">
                <p>Loading...</p>
             </main>
        );
    }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 lg:p-12 bg-secondary">
      {!isAuthenticated ? (
        <LoginRegisterForm
          onLoginSuccess={handleLoginSuccess}
          onRegisterSuccess={handleRegisterSuccess}
          getMockUser={getMockUser} // Pass state-backed getter function
        />
      ) : (
        // Pass encryptedFiles and the update function to MediCryptApp
        <MediCryptApp
            onLogout={handleLogout}
            username={currentUser?.username || 'User'}
            encryptedFiles={currentUser?.encryptedFiles || {}}
            onUpdateEncryptedFiles={updateUserEncryptedFiles}
        />
      )}
       {/* Toaster is included via RootLayout */}
    </main>
  );
}
