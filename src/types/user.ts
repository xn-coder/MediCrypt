// src/types/user.ts
export interface MockUser {
  email: string;
  passwordHash: string; // Simulate a hashed password
  keyFileData: string; // Simulate key file content
  encryptedFiles: { [originalFilename: string]: string }; // Store { originalFilename: decryptionKey }
  role: 'admin' | 'user';
}
