
"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, Download, Lock, Unlock, Loader2, RotateCcw, FileKey, LogOut, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/image-upload";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


// --- Mock/Placeholder Functions ---
// Replace these with actual API calls or logic

// Simulate preprocessing
const preprocessImage = async (file: File): Promise<File> => {
  console.log("Preprocessing image:", file.name);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
  // In a real app, this would resize/normalize the image
  console.log("Preprocessing complete.");
  return file; // Return the original file for now
};

// Simulate Rubik's Cube Scrambling Encryption
const encryptImageRubik = async (file: File, key: string): Promise<{ encryptedFile: Blob, encryptionTime: number }> => {
  console.log("Encrypting image with Rubik's algorithm:", file.name, "using key:", key);
  const startTime = performance.now();
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000)); // Simulate delay

  // Simulate creating encrypted content based on file name and key
  const arrayBuffer = await file.arrayBuffer();
  const dataView = new DataView(arrayBuffer);
  // Simple "encryption": XOR with key characters (very insecure, just for demo)
  for (let i = 0; i < dataView.byteLength; i++) {
    dataView.setUint8(i, dataView.getUint8(i) ^ key.charCodeAt(i % key.length));
  }
  // Add metadata prefix (crude simulation)
  const prefix = `encrypted-${file.name}-key:${key}-type:${file.type}-`;
  const prefixBuffer = new TextEncoder().encode(prefix);
  const finalBuffer = new Uint8Array(prefixBuffer.byteLength + arrayBuffer.byteLength);
  finalBuffer.set(prefixBuffer, 0);
  finalBuffer.set(new Uint8Array(arrayBuffer), prefixBuffer.byteLength);

  const encryptedBlob = new Blob([finalBuffer], { type: "application/octet-stream" });

  const endTime = performance.now();
  console.log("Encryption complete.");
  return { encryptedFile: encryptedBlob, encryptionTime: endTime - startTime };
};

// Simulate Key Generation (SM4 - placeholder)
const generateKeySM4 = async (): Promise<string> => {
  console.log("Generating SM4-like key...");
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
  const key = `sm4key-${Date.now()}-${Math.random().toString(16).substring(2, 10)}`;
  console.log("Key generated:", key);
  return key;
};

// Simulate Decryption
const decryptImageRubik = async (encryptedFile: Blob, providedKey: string): Promise<{ decryptedFile: Blob, decryptionTime: number, originalName: string, originalType: string }> => {
    console.log("Decrypting image with key:", providedKey);
    const startTime = performance.now();
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000)); // Simulate delay

    const buffer = await encryptedFile.arrayBuffer();
    const textDecoder = new TextDecoder('utf-8', { fatal: false }); // Use non-fatal decoding

    // Decode a larger portion or potentially the whole buffer if necessary for metadata
    // For this simulation, let's assume metadata fits within a reasonable limit, e.g., 1024 bytes
    const metadataSearchLimit = Math.min(1024, buffer.byteLength);
    let textContent = '';
    try {
         textContent = textDecoder.decode(new Uint8Array(buffer.slice(0, metadataSearchLimit)));
         console.log("Decryption: Read initial content:", textContent.substring(0, 100) + "..."); // Log first 100 chars
    } catch (e) {
        console.warn("Could not decode the beginning of the file as text for metadata extraction. The file might be corrupted or not in the expected format.", e);
         throw new Error("Invalid encrypted file format or incomplete data.");
    }

    // --- Improved Metadata Parsing and Key Verification ---
    const encryptedMarker = `encrypted-`;
    const keyMarker = `-key:`;
    const typeMarker = `-type:`;
    const endMetadataMarker = '-'; // Marks the end of the metadata block

    if (!textContent.startsWith(encryptedMarker)) {
        throw new Error(`Invalid encrypted file format: Missing '${encryptedMarker}' prefix. Ensure you are uploading a file encrypted by this application.`);
    }

    // Find the key marker
    const keyStartIndex = textContent.indexOf(keyMarker);
    if (keyStartIndex === -1) {
        throw new Error(`Invalid encrypted file format: Missing '${keyMarker}' marker within the first ${metadataSearchLimit} bytes. The file might be corrupted or not generated by this application.`);
    }

    // Extract original name
    const originalName = textContent.substring(encryptedMarker.length, keyStartIndex);
    if (!originalName && keyStartIndex !== encryptedMarker.length) { // Check if name is empty but key marker isn't immediately after prefix
         console.warn("Potential issue: Extracted original filename is empty.");
         // Decide if an empty filename is valid or an error. For now, allow.
    }

    // Find the type marker
    const typeStartIndex = textContent.indexOf(typeMarker, keyStartIndex);
    if (typeStartIndex === -1) {
        throw new Error("Invalid encrypted file: Missing '-type:' marker within the first " + metadataSearchLimit + " bytes.");
    }

    // Extract the key found in the metadata
    const metadataKey = textContent.substring(keyStartIndex + keyMarker.length, typeStartIndex);
    if (!metadataKey) {
         throw new Error("Invalid encrypted file: Could not extract key from metadata.");
    }

    // *** COMPARE THE KEYS ***
    if (metadataKey !== providedKey) {
        console.error(`Key mismatch: Provided='${providedKey}', Found='${metadataKey}'`);
        throw new Error("Incorrect decryption key provided.");
    }

    // Find the end of the type information (the next '-' after '-type:')
    const typeValueStartIndex = typeStartIndex + typeMarker.length;
    const typeEndIndex = textContent.indexOf(endMetadataMarker, typeValueStartIndex);
    if (typeEndIndex === -1) {
        throw new Error("Invalid encrypted file: Missing final '-' marker after type information within the first " + metadataSearchLimit + " bytes.");
    }

    // Extract original type
    const originalType = textContent.substring(typeValueStartIndex, typeEndIndex);
     if (!originalType) {
          console.warn("Potential issue: Extracted original file type is empty.");
         // Decide if an empty type is valid. For now, allow, fallback later.
    }

    // Reconstruct the full metadata prefix string to find its exact byte length
    const fullMetadataPrefix = `${encryptedMarker}${originalName}${keyMarker}${metadataKey}${typeMarker}${originalType}${endMetadataMarker}`;
    const fullMetadataBuffer = new TextEncoder().encode(fullMetadataPrefix);
    const metadataLength = fullMetadataBuffer.byteLength;

    if (buffer.byteLength < metadataLength) {
         throw new Error("Invalid encrypted file: Data shorter than expected metadata length.");
    }

    // --- Decryption Logic (Simulation: XOR back) ---
    const encryptedDataBuffer = buffer.slice(metadataLength);
    const decryptedDataView = new DataView(encryptedDataBuffer);
    for (let i = 0; i < decryptedDataView.byteLength; i++) {
        // Use the *provided* key for decryption
        decryptedDataView.setUint8(i, decryptedDataView.getUint8(i) ^ providedKey.charCodeAt(i % providedKey.length));
    }

    const decryptedBlob = new Blob([encryptedDataBuffer], { type: originalType || 'application/octet-stream' }); // Use extracted type or fallback

    const endTime = performance.now();
    console.log(`Decryption complete. Original name: ${originalName}, Original type: ${originalType}`);
    return { decryptedFile: decryptedBlob, decryptionTime: endTime - startTime, originalName, originalType };
};


// Simulate Performance/Security Analysis
const analyzeSecurity = async (): Promise<{ robustness: number, resistance: string }> => {
    console.log("Analyzing security...");
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
    const robustness = Math.random() * 100;
    const resistance = ["Low", "Medium", "High"][Math.floor(Math.random() * 3)];
    console.log("Analysis complete.");
    return { robustness, resistance };
};


// --- Component ---

type ProcessStatus = "idle" | "preprocessing" | "generating_key" | "encrypting" | "decrypting" | "analyzing" | "complete" | "error";
type Mode = "encrypt" | "decrypt";

interface MediCryptAppProps {
  onLogout: () => void;
  username: string;
}


export function MediCryptApp({ onLogout, username }: MediCryptAppProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [processedFile, setProcessedFile] = React.useState<File | null>(null); // After preprocessing
  const [encryptedData, setEncryptedData] = React.useState<Blob | null>(null);
  const [decryptedData, setDecryptedData] = React.useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [decryptedPreviewUrl, setDecryptedPreviewUrl] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<ProcessStatus>("idle");
  const [progress, setProgress] = React.useState(0);
  const [encryptionKey, setEncryptionKey] = React.useState<string | null>(null);
  const [decryptionKeyInput, setDecryptionKeyInput] = React.useState<string>(""); // For user input
  const [error, setError] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<Mode>("encrypt"); // 'encrypt' or 'decrypt'
  const [analysisResults, setAnalysisResults] = React.useState<{ robustness: number; resistance: string } | null>(null);
  const [processTime, setProcessTime] = React.useState<number | null>(null);
  const [decryptedFileInfo, setDecryptedFileInfo] = React.useState<{ name: string; type: string } | null>(null);


  const { toast } = useToast();

   // Cleanup ref to store the decryptedPreviewUrl for reliable cleanup
  const decryptedPreviewUrlRef = React.useRef<string | null>(null);

  // Effect to create preview URL when a file is selected or decrypted data is available
  React.useEffect(() => {
    let objectUrl: string | null = null;
    let currentSelectedFile = selectedFile; // Capture current selectedFile
    let currentDecryptedData = decryptedData; // Capture current decryptedData

    if (currentSelectedFile && mode === 'encrypt') {
      objectUrl = URL.createObjectURL(currentSelectedFile);
      setPreviewUrl(objectUrl);

      // Clean up previous decrypted preview URL if switching back to encrypt mode
      if (decryptedPreviewUrlRef.current) {
        URL.revokeObjectURL(decryptedPreviewUrlRef.current);
        decryptedPreviewUrlRef.current = null;
        setDecryptedPreviewUrl(null); // Update state as well
      }

      // Reset other states when a *new* file is selected in encrypt mode
      setProcessedFile(null);
      setEncryptedData(null);
      setDecryptedData(null);
      // setDecryptedPreviewUrl(null); // Handled above
      setEncryptionKey(null);
      setError(null);
      setStatus("idle");
      setProgress(0);
      setAnalysisResults(null);
      setProcessTime(null);
      setDecryptedFileInfo(null);

    } else if (currentDecryptedData && mode === 'decrypt') {
        // Check if decryptedData is an image type before creating URL
        if (currentDecryptedData.type.startsWith('image/')) {
            objectUrl = URL.createObjectURL(currentDecryptedData);
             // Clean up previous decrypted URL before setting new one
            if (decryptedPreviewUrlRef.current) {
                URL.revokeObjectURL(decryptedPreviewUrlRef.current);
            }
            decryptedPreviewUrlRef.current = objectUrl; // Store for cleanup
            setDecryptedPreviewUrl(objectUrl); // Update state
        } else {
            // Handle non-image decrypted data
             // Clean up previous URL if it exists
            if (decryptedPreviewUrlRef.current) {
                 URL.revokeObjectURL(decryptedPreviewUrlRef.current);
                 decryptedPreviewUrlRef.current = null;
            }
            setDecryptedPreviewUrl(null); // Ensure state is null
            console.warn("Decrypted data is not an image, cannot create preview.");
        }
         // Clean up original upload preview if switching to decrypt results
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }

    } else {
       // Neither encrypting with a file nor decrypting with data, clear previews
       if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
       }
        if (decryptedPreviewUrlRef.current) {
            URL.revokeObjectURL(decryptedPreviewUrlRef.current);
            decryptedPreviewUrlRef.current = null;
            setDecryptedPreviewUrl(null);
       }
    }


    // Cleanup function
    return () => {
        // Revoke the object URL for the selected file preview if it exists
        if (objectUrl && currentSelectedFile) {
            URL.revokeObjectURL(objectUrl);
        }
         // NO automatic cleanup for decryptedPreviewUrl here - managed by ref/state updates
    };
    // Only depend on selectedFile and decryptedData for creating URLs
  }, [selectedFile, decryptedData, mode]);


  const clearPreview = () => {
    // Revoke URLs if they exist
    if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
    }
    if (decryptedPreviewUrlRef.current) { // Use ref for cleanup
        URL.revokeObjectURL(decryptedPreviewUrlRef.current);
        decryptedPreviewUrlRef.current = null;
    }

    // Reset all relevant state variables
    setPreviewUrl(null);
    setDecryptedPreviewUrl(null); // Reset state
    setSelectedFile(null);
    setProcessedFile(null);
    setEncryptedData(null);
    setDecryptedData(null);
    setEncryptionKey(null);
    setDecryptionKeyInput(""); // Clear decryption key input as well
    setStatus("idle");
    setProgress(0);
    setError(null);
    setAnalysisResults(null);
    setProcessTime(null);
    setDecryptedFileInfo(null);

     // Reset the file input visually
     const fileInput = document.getElementById('medical-image-upload') as HTMLInputElement;
     if (fileInput) fileInput.value = "";
  };


  const handleFileChange = (file: File | null) => {
     // Call clearPreview to reset everything and revoke URLs before processing the new file
     clearPreview();

    setSelectedFile(file);
    // State resets are now handled within clearPreview
    // Preview URL creation is handled by the useEffect hook
  };

  const handleEncrypt = async () => {
    if (!selectedFile) {
      toast({ title: "No file selected", description: "Please upload an image first.", variant: "destructive" });
      return;
    }

    setError(null);
    setAnalysisResults(null);
    setProcessTime(null);
    setDecryptedData(null); // Clear previous decryption results
     // Use clearPreview to handle URL revocation and state reset, but keep selected file
     if (decryptedPreviewUrlRef.current) {
        URL.revokeObjectURL(decryptedPreviewUrlRef.current);
        decryptedPreviewUrlRef.current = null;
        setDecryptedPreviewUrl(null);
    }
    setDecryptedFileInfo(null);
    setEncryptionKey(null); // Clear previous key
    setProcessedFile(null);
    setEncryptedData(null);
    setStatus("idle");
    setProgress(0);

    try {
      // 1. Preprocessing
      setStatus("preprocessing");
      setProgress(10);
      const preprocessed = await preprocessImage(selectedFile);
      setProcessedFile(preprocessed);
      setProgress(25);

      // 2. Key Generation
      setStatus("generating_key");
      const key = await generateKeySM4();
      setEncryptionKey(key); // Store the generated key
      setProgress(40);

      // 3. Encryption
      setStatus("encrypting");
      const { encryptedFile, encryptionTime } = await encryptImageRubik(preprocessed, key);
      setEncryptedData(encryptedFile);
      setProcessTime(encryptionTime);
      setProgress(75);

       // 4. Security Analysis (Simulated)
       setStatus("analyzing");
       const analysis = await analyzeSecurity();
       setAnalysisResults(analysis);
       setProgress(90);

      setStatus("complete");
      setProgress(100);
      toast({
        title: "Encryption Successful",
        description: (
          <div>
            <p>Image encrypted in {encryptionTime.toFixed(2)} ms.</p>
            <p className="text-xs mt-1">Generated Key: <code className="bg-muted px-1 py-0.5 rounded">{key}</code></p>
             <p className="text-xs mt-1">Keep this key safe for decryption!</p>
          </div>
        ),
        duration: 9000, // Longer duration for key display
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
      // Decryption requires an uploaded file (which is assumed to be encrypted)
      if (!selectedFile) {
          toast({ title: "No file selected", description: "Please upload the encrypted file.", variant: "destructive" });
          return;
      }
      if (!decryptionKeyInput) {
          toast({ title: "No decryption key", description: "Please enter the decryption key.", variant: "destructive" });
          return;
      }

      setError(null);
      setAnalysisResults(null); // Clear analysis results for decryption
      setProcessTime(null);
      setDecryptedData(null); // Clear previous decrypted data *before* attempting decryption
      // Clear previous decrypted preview URL and revoke it
       if (decryptedPreviewUrlRef.current) {
            URL.revokeObjectURL(decryptedPreviewUrlRef.current);
            decryptedPreviewUrlRef.current = null;
            setDecryptedPreviewUrl(null); // Clear state
       }
      setDecryptedFileInfo(null);
      setStatus("idle"); // Reset status before starting
      setProgress(0); // Reset progress

      // The data to decrypt is always the currently selected file in decrypt mode
      const dataToDecrypt = selectedFile;

      try {
          setStatus("decrypting");
          setProgress(50); // Decryption is one step

          const { decryptedFile, decryptionTime, originalName, originalType } = await decryptImageRubik(dataToDecrypt, decryptionKeyInput);

           // Update state: order matters for useEffect dependency on decryptedData
           // Set these states AFTER successful decryption
           setDecryptedData(decryptedFile); // Set data first, triggers useEffect for preview
           setDecryptedFileInfo({ name: originalName, type: originalType });
           setProcessTime(decryptionTime);
           setProgress(100);
           setStatus("complete"); // Set status to complete last

          // Show appropriate toast based on whether it's an image
           if (decryptedFile.type.startsWith('image/')) {
              toast({ title: "Decryption Successful", description: `Image decrypted in ${decryptionTime.toFixed(2)} ms. Preview available.` });
          } else {
               toast({ title: "Decryption Successful", description: `File '${originalName}' decrypted in ${decryptionTime.toFixed(2)} ms. Download available (preview not supported for this type).` });
          }


      } catch (err) {
          console.error("Decryption error:", err);
           const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during decryption.";
          setError(errorMessage);
          setStatus("error");
          setProgress(0);
          // Ensure decryptedData and related states are null/cleared on error
          setDecryptedData(null);
           if (decryptedPreviewUrlRef.current) {
                URL.revokeObjectURL(decryptedPreviewUrlRef.current);
                decryptedPreviewUrlRef.current = null;
                setDecryptedPreviewUrl(null);
           }
          setDecryptedFileInfo(null);
          toast({ title: "Decryption Failed", description: errorMessage, variant: "destructive" });
      }
  };


  const handleDownload = (blob: Blob | null, defaultFilename?: string | null) => {
    if (!blob) return;

    let filename = defaultFilename || "download"; // Provide a fallback if defaultFilename is null/undefined

     // Determine filename based on mode and available info
    if (mode === 'decrypt' && decryptedFileInfo?.name) {
        filename = decryptedFileInfo.name; // Use extracted name if available
    } else if (mode === 'encrypt' && selectedFile) {
        filename = selectedFile.name;
        // Append .encrypted suffix safely
        const parts = filename.split('.');
        if (parts.length > 1) {
            const ext = parts.pop();
            filename = `${parts.join('.')}.encrypted.${ext}`;
        } else {
             filename = `${filename}.encrypted`;
        }
    } else {
         // Fallback filename if original name wasn't extracted or doesn't exist
         filename = mode === 'encrypt' ? 'encrypted_output' : 'decrypted_output';
         // Append appropriate extension based on blob type if possible
         const mimeType = blob.type;
         const knownExtensions: { [key: string]: string } = {
             'image/jpeg': '.jpg',
             'image/png': '.png',
             'image/gif': '.gif',
             'application/dicom': '.dcm',
             'application/octet-stream': '.bin', // Added for generic binary
             // Add more mappings as needed
         };
         if (mimeType && knownExtensions[mimeType] && !filename.includes('.')) {
            filename += knownExtensions[mimeType];
         } else if (!filename.includes('.')) {
             filename += '.bin'; // Generic binary extension as last resort
         }
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

   const handleModeChange = (newMode: Mode) => {
        if (newMode === mode) return; // No change if already in the selected mode
        setMode(newMode);
        // Reset states when switching modes - use clearPreview for thorough reset
        clearPreview();
        // setDecryptionKeyInput(''); // Already handled by clearPreview
    };

    const handleReset = () => {
        clearPreview(); // Handles state reset and URL revocation
        // Optionally reset mode, or keep current mode? Let's keep current mode.
        // setMode('encrypt');
    }

  const isLoading = ["preprocessing", "generating_key", "encrypting", "decrypting", "analyzing"].includes(status);

  return (
      <Card className="w-full max-w-2xl shadow-lg relative">
          {/* Logout Button */}
          <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                     <Button
                        variant="ghost"
                        size="icon"
                        onClick={onLogout}
                        className="absolute top-3 right-3 text-muted-foreground hover:text-destructive"
                        aria-label="Logout"
                        >
                        <LogOut className="h-5 w-5" />
                    </Button>
                </TooltipTrigger>
                 <TooltipContent>
                    <p>Logout ({username})</p>
                </TooltipContent>
             </Tooltip>
           </TooltipProvider>


        <CardHeader className="text-center pt-4 pr-12"> {/* Added padding-right for logout button */}
          <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-accent">
                <path fillRule="evenodd" d="M12.75 2.25a.75.75 0 0 1 .75.75v5.25H18a.75.75 0 0 1 0 1.5h-4.5V15a.75.75 0 0 1-1.5 0v-4.5H7.5a.75.75 0 0 1 0-1.5h4.5V3a.75.75 0 0 1 .75-.75ZM18.375 16.125a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75ZM5.625 16.125a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75ZM12 16.125a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                <path d="M4.72 3.97a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1-1.06 1.06L4.72 5.03a.75.75 0 0 1 0-1.06ZM18.28 3.97a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l3.75-3.75a.75.75 0 0 1 1.06 0ZM4.72 20.03a.75.75 0 0 1 0-1.06l3.75-3.75a.75.75 0 0 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0ZM18.28 20.03a.75.75 0 0 1-1.06 0l-3.75-3.75a.75.75 0 1 1 1.06-1.06l3.75 3.75a.75.75 0 0 1 0 1.06Z" />
            </svg>
             MediCrypt
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Securely encrypt and decrypt your medical images using pixel scrambling & SM4.
          </CardDescription>
           <div className="flex justify-center space-x-2 pt-4">
                <Button
                    variant={mode === 'encrypt' ? 'default' : 'outline'}
                    onClick={() => handleModeChange('encrypt')}
                    className={`min-w-[120px] ${mode === 'encrypt' ? 'bg-accent hover:bg-accent/90' : ''}`}
                    disabled={isLoading}
                >
                    <Lock className="mr-2 h-4 w-4" /> Encrypt
                </Button>
                <Button
                    variant={mode === 'decrypt' ? 'default' : 'outline'}
                    onClick={() => handleModeChange('decrypt')}
                     className={`min-w-[120px] ${mode === 'decrypt' ? 'bg-accent hover:bg-accent/90' : ''}`}
                     disabled={isLoading}
                >
                    <Unlock className="mr-2 h-4 w-4" /> Decrypt
                </Button>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <ImageUpload
            onFileChange={handleFileChange}
            previewUrl={previewUrl} // Show original preview only in encrypt mode or if no decrypted preview exists
            clearPreview={clearPreview} // clearPreview now handles resetting everything
            id="medical-image-upload"
            accept={mode === 'encrypt' ? "image/png, image/jpeg, image/dicom, image/x-ray, image/ct, image/mri" : "*/*"} // Accept any file for decryption
            disabled={isLoading}
           />

          {status !== "idle" && status !== "error" && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground capitalize">
                {status.replace("_", " ")}...
                 {status === 'complete' && processTime != null && ` (${processTime.toFixed(2)} ms)`}
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              {/* <AlertCircle className="h-4 w-4" /> */}
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

           {/* Decryption Key Input */}
           {mode === 'decrypt' && (
                <div className="flex items-center space-x-2">
                     <FileKey className="h-5 w-5 text-muted-foreground flex-shrink-0"/>
                     {/* Ensure Input component is correctly rendered */}
                     <Input
                        id="decryption-key-input" // Added ID for potential debugging/targeting
                        type="text"
                        placeholder="Enter Decryption Key (e.g., sm4key-...)"
                        value={decryptionKeyInput}
                        onChange={(e) => setDecryptionKeyInput(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isLoading || !selectedFile} // Disable if loading or no file selected for decryption
                        aria-label="Decryption Key"
                    />
                </div>
            )}

          {/* Analysis Results Display */}
           {mode === 'encrypt' && analysisResults && status === 'complete' && (
                <Card className="bg-secondary/50 border-border">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-lg flex items-center gap-2">
                             <ShieldCheck className="w-5 h-5 text-accent"/>
                            Security Analysis
                        </CardTitle>
                         {processTime != null && <span className="text-xs text-muted-foreground">Encryption Time: {processTime.toFixed(2)} ms</span>}
                    </CardHeader>
                    <CardContent className="text-sm space-y-1 pt-2">
                        <p>Robustness Score: <Badge variant="outline" className="ml-1">{analysisResults.robustness.toFixed(1)} / 100</Badge></p>
                        <p>Resistance Level: <Badge
                             variant={analysisResults.resistance === 'High' ? 'default' : analysisResults.resistance === 'Medium' ? 'secondary' : 'destructive'}
                             className={`ml-1 ${analysisResults.resistance === 'High' ? 'bg-green-600 hover:bg-green-700 text-white border-green-700' : analysisResults.resistance === 'Medium' ? 'bg-yellow-500 hover:bg-yellow-600 text-black border-yellow-600' : 'bg-red-600 hover:bg-red-700 text-white border-red-700'}`}
                            >
                                {analysisResults.resistance}
                            </Badge>
                        </p>
                         {/* Display generated encryption key */}
                         {encryptionKey && (
                            <p className="text-xs mt-2 pt-2 border-t border-border/50">Generated Key: <code className="bg-muted px-1 py-0.5 rounded break-all">{encryptionKey}</code></p>
                         )}
                    </CardContent>
                </Card>
            )}

             {/* Decrypted Image Preview */}
            {mode === 'decrypt' && decryptedPreviewUrl && status === 'complete' && (
                 <div className="mt-4 border border-border rounded-lg p-4 flex flex-col items-center bg-secondary/50">
                    <div className="w-full flex justify-between items-center mb-2">
                         <p className="text-sm font-medium">Decrypted Image:</p>
                         {processTime != null && <span className="text-xs text-muted-foreground">Decryption Time: {processTime.toFixed(2)} ms</span>}
                    </div>
                    <Image
                        src={decryptedPreviewUrl}
                        alt="Decrypted preview"
                        width={200}
                        height={200}
                        className="max-h-48 w-auto object-contain rounded-md border border-border"
                        data-ai-hint="decrypted medical scan"
                     />
                 </div>
            )}
             {/* Decrypted Non-Image Info */}
             {mode === 'decrypt' && decryptedData && !decryptedPreviewUrl && status === 'complete' && decryptedFileInfo && (
                 <Alert variant="default" className="bg-secondary/50 border-border">
                    <Download className="h-4 w-4" />
                    <AlertTitle>Decryption Complete</AlertTitle>
                    <AlertDescription>
                        The decrypted file ({decryptedFileInfo.name || 'unknown file'}) is ready for download. Preview is not available for this file type ({decryptedFileInfo.type || 'unknown type'}).
                         {processTime != null && ` (Decryption Time: ${processTime.toFixed(2)} ms)`}
                    </AlertDescription>
                 </Alert>
            )}

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
          <div className="flex gap-2 w-full sm:w-auto flex-wrap justify-center sm:justify-start">
            {mode === 'encrypt' && (
                 <Button onClick={handleEncrypt} disabled={isLoading || !selectedFile || (status === 'complete' && mode === 'encrypt')} className="w-full sm:w-auto flex-1 sm:flex-none min-w-[120px] bg-accent hover:bg-accent/90">
                    {isLoading && ['preprocessing', 'generating_key', 'encrypting', 'analyzing'].includes(status) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                    {status === 'preprocessing' ? 'Preprocessing...' : status === 'generating_key' ? 'Generating Key...' : status === 'encrypting' ? 'Encrypting...' : status === 'analyzing' ? 'Analyzing...' : 'Encrypt'}
                 </Button>
            )}
             {mode === 'decrypt' && (
                 <Button onClick={handleDecrypt} disabled={isLoading || !selectedFile || !decryptionKeyInput } className="w-full sm:w-auto flex-1 sm:flex-none min-w-[120px] bg-accent hover:bg-accent/90">
                     {isLoading && status === 'decrypting' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unlock className="mr-2 h-4 w-4" />}
                    {status === 'decrypting' ? 'Decrypting...' : 'Decrypt'}
                 </Button>
            )}
             <Button variant="outline" onClick={handleReset} disabled={isLoading} className="w-full sm:w-auto flex-1 sm:flex-none min-w-[100px]">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
             </Button>
          </div>

          <div className="flex gap-2 w-full sm:w-auto flex-wrap justify-center sm:justify-start">
            {mode === 'encrypt' && encryptedData && status === 'complete' && (
                 <Button variant="outline" onClick={() => handleDownload(encryptedData, selectedFile?.name || 'encrypted_image')} className="w-full sm:w-auto flex-1 sm:flex-none min-w-[150px]">
                    <Download className="mr-2 h-4 w-4" />
                    Download Encrypted
                 </Button>
             )}
              {mode === 'decrypt' && decryptedData && status === 'complete' && (
                 <Button variant="outline" onClick={() => handleDownload(decryptedData, decryptedFileInfo?.name)} className="w-full sm:w-auto flex-1 sm:flex-none min-w-[150px]">
                    <Download className="mr-2 h-4 w-4" />
                    Download Decrypted
                 </Button>
             )}
           </div>
        </CardFooter>
      </Card>
  );
}
