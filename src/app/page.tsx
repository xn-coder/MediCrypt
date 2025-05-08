
"use client";

import * as React from "react";
import { LoginRegisterForm } from "@/components/auth/login-register-form";
import { MediCryptApp } from "@/components/medi-crypt-app";
import { useToast } from "@/hooks/use-toast";
import type { MockUser } from "@/types/user"; // Import MockUser type

const MOCK_USER_STORAGE_KEY = "mockUserData_v2"; 
// const ADMIN_DOMAIN_FOR_DEMO = "medicrypt.com"; // Removed: Admin role no longer tied to email domain

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<MockUser | null>(null);
  const [mockUsersData, setMockUsersData] = React.useState<MockUser[]>([]); // Stores array of users
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem(MOCK_USER_STORAGE_KEY);
      let usersToStore: MockUser[] = [];
      if (storedData) {
        try {
          let parsedData = JSON.parse(storedData);

          if (Array.isArray(parsedData)) {
            // New format (array of users)
            usersToStore = parsedData.map((user: any) => ({ 
              email: user.email,
              passwordHash: user.passwordHash,
              keyFileData: user.keyFileData,
              encryptedFiles: user.encryptedFiles || {},
              role: user.role || 'user', // Default to 'user' if role is missing
            }));
          } else if (typeof parsedData === 'object' && parsedData !== null && parsedData.email) {
            // Attempt to migrate old format (single user object)
            console.warn("Migrating old single-user data format to new array format.");
            usersToStore = [{
              email: parsedData.email,
              passwordHash: parsedData.passwordHash,
              keyFileData: parsedData.keyFileData,
              encryptedFiles: parsedData.encryptedFiles || {},
              role: parsedData.role || 'user', // Default to 'user' if role is missing
            }];
          } else {
            // Invalid data format
            console.error("Invalid data format in localStorage, clearing.");
            localStorage.removeItem(MOCK_USER_STORAGE_KEY);
          }
        } catch (e) {
          console.error("Failed to parse or migrate user data from localStorage", e);
          localStorage.removeItem(MOCK_USER_STORAGE_KEY); // Clear invalid data
        }
      }
      setMockUsersData(usersToStore.filter(user => user.email && user.passwordHash && user.keyFileData)); // Ensure basic validity
    }
    setIsLoading(false);
  }, []);

  const getMockUsers = (): MockUser[] => {
    return mockUsersData;
  };

  const saveMockUsers = (users: MockUser[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(users));
    }
    setMockUsersData(users);
  };

  const updateUserEncryptedFiles = (originalFilename: string, decryptionKey: string) => {
    if (currentUser && mockUsersData) {
      const updatedUsers = mockUsersData.map(user => {
        if (user.email.toLowerCase() === currentUser.email.toLowerCase()) {
          return {
            ...user,
            encryptedFiles: {
              ...(user.encryptedFiles || {}),
              [originalFilename]: decryptionKey,
            },
          };
        }
        return user;
      });
      saveMockUsers(updatedUsers);

      setCurrentUser(prevUser => {
        if (prevUser && prevUser.email.toLowerCase() === currentUser.email.toLowerCase()) {
          return {
            ...prevUser,
            encryptedFiles: {
              ...(prevUser.encryptedFiles || {}),
              [originalFilename]: decryptionKey,
            }
          };
        }
        return prevUser;
      });

      toast({
        title: "Encryption Key Saved",
        description: `Key for '${originalFilename}' stored in your profile.`,
      });
    } else {
      console.error("Attempted to update encrypted files, but no current user or user data found.");
      toast({
        title: "Error Saving Key",
        description: "Could not save the encryption key. User data not found.",
        variant: "destructive",
      });
    }
  };

  const handleLoginSuccess = (loggedInUser: MockUser) => {
    setIsAuthenticated(true);
    const userWithInitializedFiles: MockUser = {
        ...loggedInUser,
        encryptedFiles: loggedInUser.encryptedFiles || {}
    };
    setCurrentUser(userWithInitializedFiles);
    toast({ title: "Login Successful", description: `Welcome back, ${loggedInUser.email} (${loggedInUser.role})!` });
  };

  const handleRegisterSuccess = (email: string, keyBlob: Blob) => {
    const passwordHash = `hashed_${email}_password`;
    const reader = new FileReader();

    reader.onload = (event) => {
      const keyFileData = event.target?.result as string;
      if (!keyFileData) {
        toast({ title: "Registration Failed", description: "Could not read generated key file.", variant: "destructive" });
        return;
      }
      // All new registrations through this form are 'user' role
      const role: 'user' = 'user'; 
      const newUser: MockUser = { email, passwordHash, keyFileData, encryptedFiles: {}, role };

      try {
        const url = URL.createObjectURL(keyBlob);
        const a = document.createElement("a");
        a.href = url;
        const emailPrefix = email.includes('@') ? email.split('@')[0] : email;
        a.download = `${emailPrefix}_medicrypt_key.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const currentUsers = getMockUsers();
        const updatedUsers = [...currentUsers, newUser];
        saveMockUsers(updatedUsers);

        toast({
          title: "Registration Successful",
          description: `Account created as ${role}. Key file downloaded. Please log in.`,
        });
      } catch (downloadError) {
        console.error("Failed to trigger key file download:", downloadError);
        toast({ title: "Registration Warning", description: "Account not created. Key file download failed. Please try registering again.", variant: "destructive" });
      }
    };
    reader.onerror = () => {
      toast({ title: "Registration Failed", description: "Could not process key file data.", variant: "destructive" });
    };
    reader.readAsText(keyBlob);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 lg:p-12 bg-secondary">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 lg:p-12 bg-secondary">
      {!isAuthenticated || !currentUser ? (
        <LoginRegisterForm
          onLoginSuccess={handleLoginSuccess}
          onRegisterSuccess={handleRegisterSuccess}
          getMockUsers={getMockUsers}
        />
      ) : (
        <MediCryptApp
          onLogout={handleLogout}
          currentUser={currentUser}
          onUpdateEncryptedFiles={updateUserEncryptedFiles}
          // Pass all users if current user is admin, excluding the admin themselves from the list.
          allUsers={currentUser.role === 'admin' ? mockUsersData.filter(u => u.email.toLowerCase() !== currentUser.email.toLowerCase()) : undefined}
        />
      )}
    </main>
  );
}
