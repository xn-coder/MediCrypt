

"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, Download, Lock, Unlock, Loader2, RotateCcw, FileKey, LogOut, ShieldCheck, Copy, Check, Mail, AlertCircle, Send, Users, Settings, MailPlus } from "lucide-react";
import emailjs from 'emailjs-com'; 

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/image-upload";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import type { MockUser } from "@/types/user";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

// --- EmailJS Configuration Check ---
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

const isEmailJsConfigured = EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY &&
                            EMAILJS_SERVICE_ID !== 'YOUR_EMAILJS_SERVICE_ID' && 
                            EMAILJS_TEMPLATE_ID !== 'YOUR_EMAILJS_TEMPLATE_ID' && 
                            EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY';   


// --- Mock/Placeholder Functions ---
const preprocessImage = async (file: File): Promise<File> => {
  console.log("Preprocessing image:", file.name);
  await new Promise(resolve => setTimeout(resolve, 500)); 
  console.log("Preprocessing complete.");
  return file; 
};

const encryptImageRubik = async (file: File, key: string, rotationLayers: number): Promise<{ encryptedFile: Blob, encryptionTime: number }> => {
  console.log("Encrypting image with Rubik's algorithm:", file.name, "using key:", key, "with layers:", rotationLayers);
  const startTime = performance.now();
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000)); 

  const arrayBuffer = await file.arrayBuffer();
  const dataView = new DataView(arrayBuffer);
  for (let i = 0; i < dataView.byteLength; i++) {
    dataView.setUint8(i, dataView.getUint8(i) ^ key.charCodeAt(i % key.length) ^ (rotationLayers % 256));
  }
  
  const metadataPrefix = `encrypted-${file.name}-type:${file.type}-key:${key}-layers:${rotationLayers}-`;
  const metadataBuffer = new TextEncoder().encode(metadataPrefix);

  const finalBuffer = new Uint8Array(metadataBuffer.byteLength + arrayBuffer.byteLength);
  finalBuffer.set(metadataBuffer, 0);
  finalBuffer.set(new Uint8Array(arrayBuffer), metadataBuffer.byteLength);

  const encryptedBlob = new Blob([finalBuffer], { type: "application/octet-stream" }); 

  const endTime = performance.now();
  console.log("Encryption complete.");
  return { encryptedFile: encryptedBlob, encryptionTime: endTime - startTime };
};

const generateKeySM4 = async (): Promise<string> => {
  console.log("Generating SM4-like key...");
  await new Promise(resolve => setTimeout(resolve, 300)); 
  const key = `sm4key-${Date.now()}-${Math.random().toString(16).substring(2, 10)}`;
  console.log("Key generated:", key);
  return key;
};

const decryptImageRubik = async (encryptedFile: Blob, providedKey: string): Promise<{ decryptedFile: Blob, decryptionTime: number, originalName: string, originalType: string, rotationLayersUsed: number }> => {
    console.log("Attempting to decrypt image with key:", providedKey);
    const startTime = performance.now();
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000)); 

    const buffer = await encryptedFile.arrayBuffer();
    const textDecoder = new TextDecoder('utf-8', { fatal: false }); 

    const encryptedMarker = `encrypted-`;
    const typeMarker = `-type:`;
    const keyMarker = `-key:`;
    const layersMarker = `-layers:`;
    const endMetadataMarker = '-'; 

    const metadataSearchLimit = Math.min(4096, buffer.byteLength);
    let headerText = '';
    try {
         headerText = textDecoder.decode(new Uint8Array(buffer.slice(0, metadataSearchLimit)));
    } catch (e) {
        console.error("Could not decode the beginning of the file as text for metadata extraction.", e);
         throw new Error("Invalid encrypted file format or corrupted data. Could not read metadata header.");
    }

    if (!headerText.startsWith(encryptedMarker)) {
        throw new Error(`Invalid encrypted file format: Missing '${encryptedMarker}' prefix. Ensure this file was encrypted by MediCrypt.`);
    }
    
    const nameEndIndex = headerText.indexOf(typeMarker, encryptedMarker.length);
    if (nameEndIndex === -1) throw new Error(`Invalid encrypted file: Missing '${typeMarker}' after filename.`);
    const originalName = headerText.substring(encryptedMarker.length, nameEndIndex);
    if (!originalName) throw new Error("Invalid encrypted file: Could not extract original filename.");

    const typeValueStartIndex = nameEndIndex + typeMarker.length;
    const typeEndIndex = headerText.indexOf(keyMarker, typeValueStartIndex);
    if (typeEndIndex === -1) throw new Error(`Invalid encrypted file: Missing '${keyMarker}' after type.`);
    const originalType = headerText.substring(typeValueStartIndex, typeEndIndex);
    
    const keyValueStartIndex = typeEndIndex + keyMarker.length;
    const keyEndIndex = headerText.indexOf(layersMarker, keyValueStartIndex); // Layers marker follows key
    if (keyEndIndex === -1) throw new Error(`Invalid encrypted file: Missing '${layersMarker}' after key.`);
    const embeddedKey = headerText.substring(keyValueStartIndex, keyEndIndex);

    const layersValueStartIndex = keyEndIndex + layersMarker.length;
    const layersEndIndex = headerText.indexOf(endMetadataMarker, layersValueStartIndex);
    if (layersEndIndex === -1) throw new Error("Invalid encrypted file: Missing end marker after rotation layers.");
    const rotationLayersStr = headerText.substring(layersValueStartIndex, layersEndIndex);
    const rotationLayersUsed = parseInt(rotationLayersStr, 10);
    if (isNaN(rotationLayersUsed)) throw new Error("Invalid encrypted file: Could not parse rotation layers from metadata.");

    if (providedKey.trim() !== embeddedKey.trim()) {
        console.error("Key mismatch. Provided:", providedKey, "Embedded:", embeddedKey);
        throw new Error("Incorrect decryption key provided. The key does not match the one embedded in the file metadata.");
    }

    const fullMetadataPrefix = `${encryptedMarker}${originalName}${typeMarker}${originalType}${keyMarker}${embeddedKey}${layersMarker}${rotationLayersUsed}${endMetadataMarker}`;
    const metadataLength = new TextEncoder().encode(fullMetadataPrefix).byteLength;

    if (buffer.byteLength < metadataLength) {
         throw new Error("Invalid encrypted file: Data is shorter than the calculated metadata length. File may be corrupted.");
    }

    const encryptedDataBuffer = buffer.slice(metadataLength);
    const decryptedDataView = new DataView(encryptedDataBuffer);
    for (let i = 0; i < decryptedDataView.byteLength; i++) {
        decryptedDataView.setUint8(i, decryptedDataView.getUint8(i) ^ providedKey.charCodeAt(i % providedKey.length) ^ (rotationLayersUsed % 256));
    }

    const decryptedBlob = new Blob([encryptedDataBuffer], { type: originalType || 'application/octet-stream' }); 

    const endTime = performance.now();
    console.log(`Decryption complete. Original name: ${originalName}, Type: ${originalType}, Layers: ${rotationLayersUsed}`);
    return { decryptedFile: decryptedBlob, decryptionTime: endTime - startTime, originalName, originalType, rotationLayersUsed };
};

const analyzeSecurity = async (): Promise<{ robustness: number, resistance: string }> => {
    console.log("Analyzing security...");
    await new Promise(resolve => setTimeout(resolve, 800)); 
    const robustness = Math.random() * 100;
    const resistance = ["Low", "Medium", "High"][Math.floor(Math.random() * 3)];
    console.log("Analysis complete.");
    return { robustness, resistance };
};

type ProcessStatus = "idle" | "preprocessing" | "generating_key" | "encrypting" | "decrypting" | "analyzing" | "sending_email" | "complete" | "error"; 
type Mode = "encrypt" | "decrypt";

interface MediCryptAppProps {
  onLogout: () => void;
  currentUser: MockUser;
  onUpdateEncryptedFiles: (originalFilename: string, decryptionKey: string) => void;
  allUsers?: MockUser[];
}

export function MediCryptApp({ onLogout, currentUser, onUpdateEncryptedFiles, allUsers }: MediCryptAppProps) { 
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [processedFile, setProcessedFile] = React.useState<File | null>(null); 
  const [encryptedData, setEncryptedData] = React.useState<Blob | null>(null);
  const [decryptedData, setDecryptedData] = React.useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [decryptedPreviewUrl, setDecryptedPreviewUrl] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<ProcessStatus>("idle");
  const [progress, setProgress] = React.useState(0);
  const [encryptionKey, setEncryptionKey] = React.useState<string | null>(null); 
  const [decryptionKeyInput, setDecryptionKeyInput] = React.useState<string>(""); 
  const [error, setError] = React.useState<string | null>(null);
  
  const [mode, setMode] = React.useState<Mode>(currentUser.role === 'admin' ? 'encrypt' : 'decrypt'); 
  const [recipientEmail, setRecipientEmail] = React.useState<string>("");

  const [analysisResults, setAnalysisResults] = React.useState<{ robustness: number; resistance: string } | null>(null);
  const [processTime, setProcessTime] = React.useState<number | null>(null);
  const [decryptedFileInfo, setDecryptedFileInfo] = React.useState<{ name: string; type: string, layers: number } | null>(null);
  const [isKeyCopied, setIsKeyCopied] = React.useState(false); 
  const [emailSent, setEmailSent] = React.useState(false); 
  const [rotationLayers, setRotationLayers] = React.useState<number>(3);

  const { toast } = useToast();
  const decryptedPreviewUrlRef = React.useRef<string | null>(null);

  const { email, role, encryptedFiles } = currentUser;

  const [adminView, setAdminView] = React.useState<'dashboard' | 'encryptDecrypt'>(
    role === 'admin' ? 'dashboard' : 'encryptDecrypt' // Admins start on dashboard, users go straight to tool
  );

   React.useEffect(() => {
        // If user is not admin, ensure mode is always decrypt
        if (role === 'user' && mode !== 'decrypt') {
            setMode('decrypt');
        }

        if (mode === 'decrypt' && selectedFile && ((role === 'admin' && adminView === 'encryptDecrypt') || role === 'user')) {
             setDecryptionKeyInput(""); 
             const storedKey = encryptedFiles && selectedFile.name.startsWith("encrypted-") 
                ? Object.entries(encryptedFiles).find(([originalName, key]) => selectedFile.name.includes(originalName))?.[1]
                : null;

             if (storedKey) {
                setDecryptionKeyInput(storedKey);
                 toast({
                    title: "Encrypted File Selected",
                    description: `Key for a similar file found in your profile and pre-filled. Verify and click 'Decrypt'.`,
                    duration: 7000
                });
             } else {
                toast({
                    title: "Encrypted File Selected",
                    description: "Please enter the decryption key. Keys for files you encrypted are stored in your profile.",
                    duration: 7000
                });
             }
        }
   }, [selectedFile, mode, toast, encryptedFiles, role, adminView]); 

  React.useEffect(() => {
    let objectUrl: string | null = null;
    let currentSelectedFile = selectedFile; 
    let currentDecryptedData = decryptedData; 

    if (currentSelectedFile && mode === 'encrypt' && role === 'admin') { // Only admin can encrypt
      objectUrl = URL.createObjectURL(currentSelectedFile);
      setPreviewUrl(objectUrl);
      if (decryptedPreviewUrlRef.current) {
        URL.revokeObjectURL(decryptedPreviewUrlRef.current);
        decryptedPreviewUrlRef.current = null;
        setDecryptedPreviewUrl(null); 
      }
      resetEncryptState();
    } else if (currentDecryptedData && mode === 'decrypt') {
        if (currentDecryptedData.type.startsWith('image/')) {
            objectUrl = URL.createObjectURL(currentDecryptedData);
            if (decryptedPreviewUrlRef.current) URL.revokeObjectURL(decryptedPreviewUrlRef.current);
            decryptedPreviewUrlRef.current = objectUrl; 
            setDecryptedPreviewUrl(objectUrl); 
        } else {
            if (decryptedPreviewUrlRef.current) URL.revokeObjectURL(decryptedPreviewUrlRef.current);
            decryptedPreviewUrlRef.current = null;
            setDecryptedPreviewUrl(null); 
        }
        if (previewUrl) { // Clear encryption preview if switching to decrypt or clearing
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    } else { // Clear all previews if no relevant data or mode
       if (previewUrl) URL.revokeObjectURL(previewUrl);
       setPreviewUrl(null);
       if (decryptedPreviewUrlRef.current) URL.revokeObjectURL(decryptedPreviewUrlRef.current);
       decryptedPreviewUrlRef.current = null;
       setDecryptedPreviewUrl(null);
    }

    return () => { // Cleanup object URLs
        if (objectUrl && currentSelectedFile) URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile, decryptedData, mode, role]); // Add role to dependency array

  const resetEncryptState = () => {
    setProcessedFile(null);
    setEncryptedData(null);
    setEncryptionKey(null);
    setError(null);
    setStatus("idle");
    setProgress(0);
    setAnalysisResults(null);
    setProcessTime(null);
    setIsKeyCopied(false);
    setEmailSent(false);
    setRecipientEmail(""); // Reset recipient email on encrypt reset
  };

  const clearPreview = () => { 
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (decryptedPreviewUrlRef.current) URL.revokeObjectURL(decryptedPreviewUrlRef.current);
    decryptedPreviewUrlRef.current = null;

    setPreviewUrl(null);
    setDecryptedPreviewUrl(null); 
    setSelectedFile(null);
    setDecryptionKeyInput(""); 
    
    setProcessedFile(null);
    setEncryptedData(null);
    setDecryptedData(null);
    setEncryptionKey(null);
    setError(null);
    setStatus("idle");
    setProgress(0);
    setAnalysisResults(null);
    setProcessTime(null);
    setDecryptedFileInfo(null);
    setIsKeyCopied(false);
    setEmailSent(false);
    setRecipientEmail("");

     const fileInput = document.getElementById('medical-image-upload') as HTMLInputElement;
     if (fileInput) fileInput.value = "";
  };

  const handleFileChange = (file: File | null) => {
     clearPreview(); 
     setSelectedFile(file);
     if (mode === 'decrypt' && file && ((role === 'admin' && adminView === 'encryptDecrypt') || role === 'user') ) {
         toast({
            title: "File Ready for Decryption",
            description: `Selected '${file.name}'. Please enter/verify the key and click 'Decrypt'.`,
         });
     }
  };

  const sendEncryptionKeyEmail = async (toEmail: string, fileName: string, key: string, senderEmail: string): Promise<boolean> => {
     if (!isEmailJsConfigured) {
         console.warn("EmailJS is not configured. Cannot send email.");
         return false;
     }
    
    if (!EMAILJS_TEMPLATE_ID || !EMAILJS_SERVICE_ID || !EMAILJS_PUBLIC_KEY) {
        console.error("EmailJS configuration is incomplete.");
        toast({ title: "Email Error", description: "Email service configuration is incomplete.", variant: "destructive" });
        return false;
    }

    const templateParams = {
        to_email: toEmail, // Recipient's email
        file_name: fileName,
        decryption_key: key,
        user_email: senderEmail // Admin's email (currentUser.email)
    };

    console.log("Attempting to send email with params:", templateParams);
    setStatus("sending_email");
    setProgress(95); 

    try {
        const response = await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams,
            EMAILJS_PUBLIC_KEY
        );
        console.log('EmailJS SUCCESS!', response.status, response.text);
        return true; 
    } catch (err) {
        console.error('EmailJS FAILED...', err);
        const errorMessage = err instanceof Error ? err.message : (typeof err === 'object' && err && 'text' in err) ? (err as any).text : "Unknown email sending error";
        setError(`Failed to send email: ${errorMessage}`); 
        return false; 
    } 
  };

  const handleEncrypt = async () => {
    if (role !== 'admin') {
        toast({ title: "Permission Denied", description: "Only administrators can encrypt files.", variant: "destructive" });
        return;
    }
    if (!selectedFile) {
      toast({ title: "No file selected", description: "Please upload an image first.", variant: "destructive" });
      return;
    }
    if (!recipientEmail || !/\S+@\S+\.\S+/.test(recipientEmail)) {
        toast({ title: "Invalid Recipient Email", description: "Please enter a valid email address for the recipient.", variant: "destructive" });
        return;
    }

    const originalFilename = selectedFile.name; 
    resetEncryptState(); // Resets recipientEmail too, so set it again before calling this or handle it inside

    try {
      setStatus("preprocessing");
      setProgress(10);
      const preprocessed = await preprocessImage(selectedFile);
      setProcessedFile(preprocessed);
      setProgress(25);

      setStatus("generating_key");
      const generatedKey = await generateKeySM4(); 
      setEncryptionKey(generatedKey); 
      setProgress(40);

      setStatus("encrypting");
      const { encryptedFile, encryptionTime } = await encryptImageRubik(preprocessed, generatedKey, rotationLayers);
      setEncryptedData(encryptedFile);
      setProcessTime(encryptionTime);
      setProgress(75);

       setStatus("analyzing");
       const analysis = await analyzeSecurity();
       setAnalysisResults(analysis);
       setProgress(90);

       if (originalFilename && generatedKey) {
            onUpdateEncryptedFiles(originalFilename, generatedKey); // Admin's history
       } else {
            console.warn("Could not save encryption key to admin's history: Original filename or key is missing.");
       }

        let emailSuccess = false;
        // Use recipientEmail for 'to_email' and currentUser.email (admin's email) for 'sender_email' context
        if (isEmailJsConfigured && originalFilename && generatedKey && recipientEmail && currentUser.email) { 
            emailSuccess = await sendEncryptionKeyEmail(recipientEmail, originalFilename, generatedKey, currentUser.email);
            setEmailSent(emailSuccess); 
        }

        if (status === "sending_email" && !emailSuccess && isEmailJsConfigured) {
             setStatus("error"); 
        } else {
            setStatus("complete");
            setProgress(100);
        }
        
        toast({
            title: "Encryption Successful",
            description: (
            <div>
                <span>Image encrypted in {encryptionTime.toFixed(2)} ms.</span>
                <span className="block text-xs mt-1">Key for '{originalFilename}' saved to your (admin) profile. You can copy it below.</span>
                {isEmailJsConfigured && emailSuccess && <span className="block text-xs mt-1 text-green-600">Decryption key sent to {recipientEmail}.</span>}
                {isEmailJsConfigured && !emailSuccess && <span className="block text-xs mt-1 text-destructive">Failed to send decryption key to {recipientEmail}. Check console.</span>}
                {!isEmailJsConfigured && <span className="block text-xs mt-1 text-yellow-600">Email notifications are disabled (EmailJS not configured).</span>}
            </div>
            ),
            duration: 10000, 
         });

    } catch (err) {
      console.error("Encryption error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during encryption.";
      setError(errorMessage);
      setStatus("error");
      setProgress(0);
      toast({ title: "Encryption Failed", description: errorMessage, variant: "destructive" });
    }
  };

  const handleDecrypt = async () => {
      if (!selectedFile) {
          toast({ title: "No file selected", description: "Please upload the encrypted file.", variant: "destructive" });
          return;
      }
      if (!decryptionKeyInput) {
          toast({ title: "No decryption key", description: "Please enter the decryption key.", variant: "destructive" });
          return;
      }
      setError(null);
      setAnalysisResults(null); 
      setProcessTime(null);
      setDecryptedData(null); 
      if (decryptedPreviewUrlRef.current) URL.revokeObjectURL(decryptedPreviewUrlRef.current);
      decryptedPreviewUrlRef.current = null;
      setDecryptedPreviewUrl(null); 
      setDecryptedFileInfo(null);
      setStatus("idle"); 
      setProgress(0); 
      setIsKeyCopied(false); 
      setEmailSent(false); 

      try {
          setStatus("decrypting");
          setProgress(50); 
          const { decryptedFile, decryptionTime, originalName, originalType, rotationLayersUsed } = await decryptImageRubik(selectedFile, decryptionKeyInput);

           const userStoredKey = encryptedFiles ? encryptedFiles[originalName] : undefined;
           if (userStoredKey && userStoredKey.trim() !== decryptionKeyInput.trim()) {
               console.warn(`Decryption key mismatch. Provided: '${decryptionKeyInput}', User's Stored for '${originalName}': '${userStoredKey}'`);
               toast({
                   title: "Key Mismatch Warning",
                   description: `The key entered doesn't match the key saved in your profile for '${originalName}'. Decryption proceeded with the entered key.`,
                   variant: "destructive",
                   duration: 10000
                });
           } else if (!userStoredKey && encryptedFiles && Object.keys(encryptedFiles).includes(originalName)) { 
                console.warn(`No key found in your profile for '${originalName}', but a file with this name exists in your records. This implies it might have been encrypted by you previously with a different key or the key wasn't saved correctly.`);
                 toast({
                    title: "Key Not Found in Profile (for this exact key)",
                    description: `No key matching the one entered was found in your profile for '${originalName}'. Decryption proceeded with the entered key.`,
                    duration: 7000
                 });
           }

           setDecryptedData(decryptedFile); 
           setDecryptedFileInfo({ name: originalName, type: originalType, layers: rotationLayersUsed });
           setProcessTime(decryptionTime);
           setProgress(100);
           setStatus("complete"); 

           if (decryptedFile.type.startsWith('image/')) {
              toast({ title: "Decryption Successful", description: `Image '${originalName}' decrypted in ${decryptionTime.toFixed(2)} ms. Layers used: ${rotationLayersUsed}. Preview available.` });
          } else {
               toast({ title: "Decryption Successful", description: `File '${originalName}' decrypted in ${decryptionTime.toFixed(2)} ms. Layers used: ${rotationLayersUsed}. Download available.` });
          }
      } catch (err) {
          console.error("Decryption error:", err);
           const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during decryption.";
          setError(errorMessage);
          setStatus("error");
          setProgress(0);
          setDecryptedData(null);
           if (decryptedPreviewUrlRef.current) URL.revokeObjectURL(decryptedPreviewUrlRef.current);
           decryptedPreviewUrlRef.current = null;
           setDecryptedPreviewUrl(null);
          setDecryptedFileInfo(null);
          toast({ title: "Decryption Failed", description: errorMessage, variant: "destructive" });
      }
  };

  const handleDownload = (blob: Blob | null, defaultFilename?: string | null) => {
    if (!blob) return;
    let filename = defaultFilename || "download"; 
    if (mode === 'decrypt' && decryptedFileInfo?.name) {
        filename = `decrypted-${decryptedFileInfo.name}`; 
    } else if (mode === 'encrypt' && selectedFile && role === 'admin') {
        filename = constructEncryptedFilename(selectedFile.name); 
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const constructEncryptedFilename = (originalName: string): string => {
      const parts = originalName.split('.');
      const ext = parts.length > 1 ? parts.pop() : null;
      return `encrypted-${parts.join('.')}${ext ? `.${ext}` : ''}.mcf`; // MediCrypt File extension
  };

  const handleModeChange = (newMode: Mode) => {
    if (currentUser.role === 'user' && newMode === 'encrypt') {
        toast({ title: "Action Not Allowed", description: "Users can only decrypt files.", variant: "destructive" });
        return; // Prevent user from switching to encrypt mode
    }
    if (newMode === mode) return; 
    setMode(newMode);
    clearPreview();
  };

  const handleReset = () => clearPreview(); 

  const handleCopyKey = async () => {
    if (!encryptionKey) return;
    try {
      await navigator.clipboard.writeText(encryptionKey);
      setIsKeyCopied(true);
      toast({ title: "Key Copied", description: "Encryption key copied to clipboard." });
      setTimeout(() => setIsKeyCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy key: ", err);
      toast({ title: "Copy Failed", description: "Could not copy key to clipboard.", variant: "destructive" });
    }
  };

  const createMailtoLink = (): string => {
    if (!encryptedData || !encryptionKey || !selectedFile) return "#"; 
    const subject = `MediCrypt Encrypted File: ${selectedFile.name}`;
    // Recipient email should be pre-filled if admin is sending, otherwise, user sends to themselves or whomever
    const mailtoRecipient = (role === 'admin' && recipientEmail) ? recipientEmail : ""; 
    const body = `Please find the encrypted file attached (or you will need to send it separately).\n\nThe decryption key is: ${encryptionKey}\nRotation Layers used: ${rotationLayers}\n\nKeep this key and layer count secure.`;
    return `mailto:${mailtoRecipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const isLoading = ["preprocessing", "generating_key", "encrypting", "decrypting", "analyzing", "sending_email"].includes(status); 

  const cardTitleText = role === 'admin' && adminView === 'dashboard' 
    ? "Admin Dashboard" 
    : "MediCrypt";
  const cardDescriptionText = role === 'admin' && adminView === 'dashboard'
    ? `Overview of system users. Logged in as: ${email}`
    : `${role === 'admin' ? 'Securely encrypt and decrypt medical images.' : 'Securely decrypt medical images.'} Logged in as: ${email}`;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="w-full shadow-lg relative">
          <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                     <Button
                        variant="ghost"
                        size="icon"
                        onClick={onLogout}
                        className="absolute top-3 right-3 text-muted-foreground hover:text-destructive z-10"
                        aria-label="Logout"
                        >
                        <LogOut className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                 <TooltipContent>
                    <p>Logout ({email} - <span className="capitalize">{role}</span>)</p> 
                </TooltipContent>
             </Tooltip>
           </TooltipProvider>

        <CardHeader className="text-center pt-4 pr-12"> 
          <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
             {role === 'admin' && adminView === 'dashboard' ? (
                <Users className="w-8 h-8 text-accent" />
             ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-accent">
                    <path fillRule="evenodd" d="M12.75 2.25a.75.75 0 0 1 .75.75v5.25H18a.75.75 0 0 1 0 1.5h-4.5V15a.75.75 0 0 1-1.5 0v-4.5H7.5a.75.75 0 0 1 0-1.5h4.5V3a.75.75 0 0 1 .75-.75ZM18.375 16.125a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75ZM5.625 16.125a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75ZM12 16.125a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                    <path d="M4.72 3.97a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1-1.06 1.06L4.72 5.03a.75.75 0 0 1 0-1.06ZM18.28 3.97a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l3.75-3.75a.75.75 0 0 1 1.06 0ZM4.72 20.03a.75.75 0 0 1 0-1.06l3.75-3.75a.75.75 0 0 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0ZM18.28 20.03a.75.75 0 0 1-1.06 0l-3.75-3.75a.75.75 0 1 1 1.06-1.06l3.75 3.75a.75.75 0 0 1 0 1.06Z" />
                </svg>
             )}
             {cardTitleText}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {cardDescriptionText} <Badge variant={role === 'admin' ? 'destructive' : 'secondary'} className="capitalize">{role}</Badge>
          </CardDescription>

          {role === 'admin' && ( // Admin can switch between dashboard and tool
            <div className="flex justify-center space-x-2 pt-4">
                <Button
                    variant={adminView === 'dashboard' ? 'default' : 'outline'}
                    onClick={() => setAdminView('dashboard')}
                    className={`min-w-[150px] ${adminView === 'dashboard' ? 'bg-accent hover:bg-accent/90' : ''}`}
                    disabled={isLoading}
                >
                    <Users className="mr-2 h-4 w-4" /> Dashboard
                </Button>
                <Button
                    variant={adminView === 'encryptDecrypt' ? 'default' : 'outline'}
                    onClick={() => setAdminView('encryptDecrypt')}
                    className={`min-w-[180px] ${adminView === 'encryptDecrypt' ? 'bg-accent hover:bg-accent/90' : ''}`}
                    disabled={isLoading}
                >
                    <Lock className="mr-2 h-4 w-4" /> Encrypt/Decrypt Tool
                </Button>
            </div>
          )}
           {/* Mode selection for Encrypt/Decrypt Tool view for Admin, or always for User (but limited) */}
          {((role === 'admin' && adminView === 'encryptDecrypt') || role === 'user') && (
             <div className="flex justify-center space-x-2 pt-4">
                    {role === 'admin' && ( // Only admin sees Encrypt button
                        <Button
                            variant={mode === 'encrypt' ? 'default' : 'outline'}
                            onClick={() => handleModeChange('encrypt')}
                            className={`min-w-[120px] ${mode === 'encrypt' ? 'bg-accent hover:bg-accent/90' : ''}`}
                            disabled={isLoading}
                        >
                            <Lock className="mr-2 h-4 w-4" /> Encrypt
                        </Button>
                    )}
                    <Button // Decrypt button always available for tool view
                        variant={mode === 'decrypt' ? 'default' : 'outline'}
                        onClick={() => handleModeChange('decrypt')}
                        className={`min-w-[120px] ${mode === 'decrypt' ? 'bg-accent hover:bg-accent/90' : ''}`}
                        disabled={isLoading || (role === 'user' && mode === 'encrypt')} // User can't be in encrypt mode
                    >
                        <Unlock className="mr-2 h-4 w-4" /> Decrypt
                    </Button>
                </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {role === 'admin' && adminView === 'dashboard' && allUsers ? (
            <AdminDashboard users={allUsers} />
          ) : ( ((role === 'admin' && adminView === 'encryptDecrypt') || role === 'user') &&
            <>
              {role === 'admin' && mode === 'encrypt' && !isEmailJsConfigured && (
                    <Alert variant="default" className="border-yellow-500 bg-yellow-50 text-yellow-800">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertTitle>Email Notification Disabled</AlertTitle>
                        <AlertDescription>
                            EmailJS is not configured. Encryption keys will not be sent automatically via email. 
                            Please configure <code className="font-mono text-xs bg-yellow-200 px-1 rounded">.env.local</code> with your EmailJS credentials.
                        </AlertDescription>
                    </Alert>
                )}

              {role === 'admin' && mode === 'encrypt' && ( 
                <Card className="bg-secondary/30 border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-md flex items-center gap-2">
                            <Settings className="w-5 h-5 text-accent"/>
                            Scrambling Parameters
                        </CardTitle>
                        <CardDescription className="text-xs">Configure pixel scrambling complexity.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-2">
                        <div>
                            <Label htmlFor="rotation-layers" className="text-sm font-medium">Rotation Layers ({rotationLayers})</Label>
                            <Slider
                                id="rotation-layers"
                                min={1} max={10} step={1}
                                value={[rotationLayers]}
                                onValueChange={(value) => setRotationLayers(value[0])}
                                className="mt-2"
                                disabled={isLoading} 
                            />
                            <p className="text-xs text-muted-foreground mt-1">Higher values increase scrambling complexity (simulated).</p>
                        </div>
                    </CardContent>
                </Card>
              )}

              {role === 'admin' && mode === 'encrypt' && (
                <div className="space-y-2">
                    <Label htmlFor="recipient-email" className="text-sm font-medium">Recipient Email for Key</Label>
                    <div className="flex items-center space-x-2">
                        <MailPlus className="h-5 w-5 text-muted-foreground flex-shrink-0"/>
                        <Input
                            id="recipient-email"
                            type="email"
                            placeholder="user@example.com"
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            className="flex-grow"
                            disabled={isLoading}
                            aria-label="Recipient Email"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">Enter the email address to send the decryption key to.</p>
                </div>
              )}


              <ImageUpload
                onFileChange={handleFileChange}
                previewUrl={(mode === 'encrypt' && role === 'admin') ? previewUrl : null} // Preview for admin encrypting
                clearPreview={clearPreview} 
                id="medical-image-upload"
                accept={(mode === 'encrypt' && role === 'admin') ? "image/png, image/jpeg, image/dicom, image/x-ray, image/ct, image/mri" : ".mcf,application/octet-stream"}
                disabled={isLoading || (mode === 'encrypt' && role === 'user')} // Users can't use encrypt features
              />
              
              {mode === 'decrypt' && selectedFile && !decryptedPreviewUrl && !decryptedData && (
                    <Alert variant="default" className="mt-4">
                        <FileKey className="h-4 w-4" />
                        <AlertTitle>File to Decrypt: {selectedFile.name}</AlertTitle>
                        <AlertDescription>
                            Enter or verify the decryption key below and click "Decrypt". 
                        </AlertDescription>
                    </Alert>
                )}


              {status !== "idle" && status !== "error" && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-center text-muted-foreground capitalize">
                    {status.replace(/_/g, " ")}... 
                    {status === 'complete' && processTime != null && ` (${processTime.toFixed(2)} ms)`}
                  </p>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {mode === 'decrypt' && (
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <FileKey className="h-5 w-5 text-muted-foreground flex-shrink-0"/>
                            <Input
                                id="decryption-key-input"
                                type="text" 
                                placeholder="Enter Decryption Key (e.g., sm4key-...)"
                                value={decryptionKeyInput}
                                onChange={(e) => setDecryptionKeyInput(e.target.value)}
                                className="flex-grow" 
                                disabled={isLoading || !selectedFile} 
                                aria-label="Decryption Key"
                            />
                        </div>
                    </div>
                )}

              {mode === 'encrypt' && role === 'admin' && analysisResults && (status === 'complete' || (status === 'error' && !errorMessageIncludesEmail(error))) && ( 
                    <Card className="bg-secondary/50 border-border">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-accent"/> Security Analysis
                            </CardTitle>
                            {processTime != null && <span className="text-xs text-muted-foreground">Encryption Time: {processTime.toFixed(2)} ms</span>}
                        </CardHeader>
                        <CardContent className="text-sm space-y-1 pt-2">
                            <p>Robustness: <Badge variant="outline">{analysisResults.robustness.toFixed(1)}/100</Badge></p>
                            <p>Resistance: <Badge variant={analysisResults.resistance === 'High' ? 'default' : analysisResults.resistance === 'Medium' ? 'secondary' : 'destructive'} className={`capitalize ${analysisResults.resistance === 'High' ? 'bg-green-600 hover:bg-green-700' : analysisResults.resistance === 'Medium' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : ''}`}>{analysisResults.resistance}</Badge></p>
                            <p>Rotation Layers Used: <Badge variant="outline">{rotationLayers}</Badge></p>
                            {encryptionKey && (
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                                    <span className="text-xs">Generated Key:</span>
                                    <code className="flex-grow bg-muted px-1 py-0.5 rounded text-xs break-all">{encryptionKey}</code>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={handleCopyKey} aria-label="Copy encryption key">
                                                    {isKeyCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent><p>{isKeyCopied ? "Copied!" : "Copy Key"}</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                            )}
                            {isEmailJsConfigured && encryptionKey && recipientEmail && (
                                <div className="flex items-center gap-2 mt-1 pt-1 text-xs border-t border-border/50">
                                    <Mail className={`h-4 w-4 ${emailSent ? 'text-green-600' : (status === 'error' && errorMessageIncludesEmail(error)) ? 'text-destructive' : 'text-muted-foreground'}`}/>
                                    <span>Email Status: {emailSent ? <span className="text-green-600">Key sent to {recipientEmail}</span> : (status === 'error' && errorMessageIncludesEmail(error)) ? <span className="text-destructive">Failed</span> : <span className="text-muted-foreground">Not sent/Pending</span>}</span>
                                </div>
                            )}
                            {!isEmailJsConfigured && encryptionKey && (
                                <div className="flex items-center gap-2 mt-1 pt-1 text-xs border-t border-border/50">
                                    <Mail className="h-4 w-4 text-yellow-600"/>
                                    <span className="text-yellow-600">Auto-email notifications disabled.</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {mode === 'decrypt' && decryptedPreviewUrl && status === 'complete' && (
                    <div className="mt-4 border border-border rounded-lg p-4 flex flex-col items-center bg-secondary/50">
                        <div className="w-full flex justify-between items-center mb-2">
                            <p className="text-sm font-medium">Decrypted Image: {decryptedFileInfo?.name}</p>
                            {processTime != null && <span className="text-xs text-muted-foreground">Decryption Time: {processTime.toFixed(2)} ms</span>}
                        </div>
                        <Image src={decryptedPreviewUrl} alt="Decrypted preview" width={200} height={200} className="max-h-48 w-auto object-contain rounded-md border border-border" data-ai-hint="decrypted medical scan"/>
                        {decryptedFileInfo && <p className="text-xs text-muted-foreground mt-1">Original Type: {decryptedFileInfo.type}, Layers Used: {decryptedFileInfo.layers}</p>}
                    </div>
                )}
                {mode === 'decrypt' && decryptedData && !decryptedPreviewUrl && status === 'complete' && decryptedFileInfo && (
                    <Alert variant="default" className="bg-secondary/50 border-border">
                        <Download className="h-4 w-4" />
                        <AlertTitle>Decryption Complete</AlertTitle>
                        <AlertDescription>
                            File '{decryptedFileInfo.name}' ({decryptedFileInfo.type}) is ready. Preview unavailable for this file type.
                            {processTime != null && ` (Time: ${processTime.toFixed(2)} ms)`}
                            <br />Rotation Layers Used: {decryptedFileInfo.layers}
                        </AlertDescription>
                    </Alert>
                )}
            </>
          )}
        </CardContent>
        { ((role === 'admin' && adminView === 'encryptDecrypt') || role === 'user') && (
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
            <div className="flex gap-2 w-full sm:w-auto flex-wrap justify-center sm:justify-start">
                {role === 'admin' && mode === 'encrypt' && (
                    <Button onClick={handleEncrypt} disabled={isLoading || !selectedFile || (status === 'complete' && mode === 'encrypt')} className="w-full sm:w-auto flex-1 sm:flex-none min-w-[120px] bg-accent hover:bg-accent/90">
                        {isLoading && !["sending_email", "complete", "error"].includes(status) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                        {status === 'preprocessing' ? 'Preprocessing...' :
                        status === 'generating_key' ? 'Generating Key...' :
                        status === 'encrypting' ? 'Encrypting...' :
                        status === 'analyzing' ? 'Analyzing...' :
                        status === 'sending_email' ? 'Sending Email...' :
                        'Encrypt'}
                    </Button>
                )}
                {mode === 'decrypt' && ( // Decrypt always available for tool view
                    <Button onClick={handleDecrypt} disabled={isLoading || !selectedFile || !decryptionKeyInput } className="w-full sm:w-auto flex-1 sm:flex-none min-w-[120px] bg-accent hover:bg-accent/90">
                        {isLoading && status === 'decrypting' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unlock className="mr-2 h-4 w-4" />}
                        {status === 'decrypting' ? 'Decrypting...' : 'Decrypt'}
                    </Button>
                )}
                <Button variant="outline" onClick={handleReset} disabled={isLoading} className="w-full sm:w-auto flex-1 sm:flex-none min-w-[100px]">
                    <RotateCcw className="mr-2 h-4 w-4" /> Reset
                </Button>
            </div>

            <div className="flex gap-2 w-full sm:w-auto flex-wrap justify-center sm:justify-start">
                {role === 'admin' && mode === 'encrypt' && encryptedData && (status === 'complete' || (status === 'error' && !errorMessageIncludesEmail(error))) && ( 
                    <>
                    <Button variant="outline" onClick={() => handleDownload(encryptedData, selectedFile ? constructEncryptedFilename(selectedFile.name) : undefined)} className="w-full sm:w-auto flex-1 sm:flex-none min-w-[150px]">
                        <Download className="mr-2 h-4 w-4" /> Download Encrypted
                    </Button>
                    {(!isEmailJsConfigured || (status === 'error' && errorMessageIncludesEmail(error))) && encryptionKey && selectedFile && recipientEmail && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <a href={createMailtoLink()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full sm:w-auto flex-1 sm:flex-none min-w-[150px]">
                                        <Send className="mr-2 h-4 w-4" /> Email Key Manually
                                    </a>
                                </TooltipTrigger>
                                <TooltipContent><p>{!isEmailJsConfigured ? "Auto-email disabled." : "Auto-email failed."} Click to use your email client.</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    </>
                )}
                {mode === 'decrypt' && decryptedData && status === 'complete' && (
                    <Button variant="outline" onClick={() => handleDownload(decryptedData, decryptedFileInfo?.name)} className="w-full sm:w-auto flex-1 sm:flex-none min-w-[150px]">
                        <Download className="mr-2 h-4 w-4" /> Download Decrypted
                    </Button>
                )}
            </div>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}

function errorMessageIncludesEmail(error: string | null): boolean {
    return !!error && (error.toLowerCase().includes('email') || error.toLowerCase().includes('emailjs'));
}

