"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, Download, Lock, Unlock, Loader2, RotateCcw, FileKey } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/image-upload";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

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
  const encryptedBlob = new Blob([`encrypted-${file.name}-${key}`], { type: "application/octet-stream" });
  const endTime = performance.now();
  console.log("Encryption complete.");
  return { encryptedFile: encryptedBlob, encryptionTime: endTime - startTime };
};

// Simulate Key Generation (SM4 - placeholder)
const generateKeySM4 = async (): Promise<string> => {
  console.log("Generating SM4-like key...");
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
  const key = `key-${Date.now()}-${Math.random().toString(16).substring(2, 10)}`;
  console.log("Key generated:", key);
  return key;
};

// Simulate Decryption
const decryptImageRubik = async (encryptedFile: Blob, key: string): Promise<{ decryptedFile: Blob, decryptionTime: number }> => {
    console.log("Decrypting image with key:", key);
    const startTime = performance.now();
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000)); // Simulate delay

    // Simulate getting original filename (crude simulation)
    const text = await encryptedFile.text();
    const originalName = text.split('-')[1]; // Very basic extraction
    const originalType = 'image/png'; // Assume original type for simulation

    // Simulate creating the original file content
    const decryptedBlob = new Blob([`decrypted-${originalName}`], { type: originalType });

    const endTime = performance.now();
    console.log("Decryption complete.");
    return { decryptedFile: decryptedBlob, decryptionTime: endTime - startTime };
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

export default function Home() {
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


  const { toast } = useToast();

  // Effect to create preview URL when a file is selected or decrypted data is available
  React.useEffect(() => {
    if (selectedFile && mode === 'encrypt') {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      setProcessedFile(null); // Reset processed file on new selection
      setEncryptedData(null);
      setDecryptedData(null);
      setDecryptedPreviewUrl(null);
      setEncryptionKey(null);
      setError(null);
      setStatus("idle");
      setProgress(0);
      setAnalysisResults(null);
      setProcessTime(null);
      return () => URL.revokeObjectURL(objectUrl); // Cleanup
    } else if (decryptedData && mode === 'decrypt') {
        // Check if decryptedData is an image type before creating URL
        if (decryptedData.type.startsWith('image/')) {
            const objectUrl = URL.createObjectURL(decryptedData);
            setDecryptedPreviewUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl); // Cleanup
        } else {
            // Handle non-image decrypted data (e.g., allow download but no preview)
            setDecryptedPreviewUrl(null); // Ensure no stale preview
            console.warn("Decrypted data is not an image, cannot create preview.");
            toast({
              title: "Decryption Complete",
              description: "Decrypted data is not an image, download available.",
              variant: "default",
            });
        }
    }
  }, [selectedFile, decryptedData, mode]); // Rerun when selectedFile or decryptedData changes

  const clearPreview = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setProcessedFile(null);
    setEncryptedData(null);
    setDecryptedData(null);
    setDecryptedPreviewUrl(null);
    setEncryptionKey(null);
    setStatus("idle");
    setProgress(0);
    setError(null);
    setAnalysisResults(null);
    setProcessTime(null);
     // Also clear the file input if needed (handled in ImageUpload)
  };

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    // Reset relevant states when a new file is uploaded
    if (file) {
        setPreviewUrl(URL.createObjectURL(file)); // Show initial preview immediately
        setProcessedFile(null);
        setEncryptedData(null);
        setDecryptedData(null);
        setDecryptedPreviewUrl(null);
        setEncryptionKey(null);
        setError(null);
        setStatus("idle");
        setProgress(0);
        setAnalysisResults(null);
        setProcessTime(null);
         if (mode === 'decrypt') {
            setDecryptionKeyInput(''); // Clear key input if switching file in decrypt mode
        }
    } else {
        clearPreview(); // Clear everything if file is removed
    }
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
    setDecryptedPreviewUrl(null);

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
      setEncryptionKey(key);
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
      toast({ title: "Encryption Successful", description: `Image encrypted in ${encryptionTime.toFixed(2)} ms. Key: ${key}` });

    } catch (err) {
      console.error("Encryption error:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during encryption.");
      setStatus("error");
      setProgress(0);
      toast({ title: "Encryption Failed", description: error, variant: "destructive" });
    }
  };

  const handleDecrypt = async () => {
      if (!selectedFile && !encryptedData) { // Allow decrypting uploaded file OR already encrypted data
          toast({ title: "No data for decryption", description: "Please upload an encrypted file.", variant: "destructive" });
          return;
      }
      if (!decryptionKeyInput) {
          toast({ title: "No decryption key", description: "Please enter the decryption key.", variant: "destructive" });
          return;
      }

      setError(null);
      setAnalysisResults(null); // Clear analysis results for decryption
      setProcessTime(null);
      setDecryptedData(null);
      setDecryptedPreviewUrl(null);

      // Determine the data to decrypt
      const dataToDecrypt = encryptedData || selectedFile; // Prioritize in-memory encrypted data
      if (!dataToDecrypt) {
          toast({ title: "Error", description: "Could not find data to decrypt.", variant: "destructive"});
          return;
      }


      try {
          setStatus("decrypting");
          setProgress(50); // Decryption is one step

          const { decryptedFile, decryptionTime } = await decryptImageRubik(dataToDecrypt, decryptionKeyInput);
          setDecryptedData(decryptedFile);
          setProcessTime(decryptionTime);
          setProgress(100);
          setStatus("complete");
          toast({ title: "Decryption Successful", description: `Image decrypted in ${decryptionTime.toFixed(2)} ms.` });

      } catch (err) {
          console.error("Decryption error:", err);
          setError(err instanceof Error ? err.message : "An unknown error occurred during decryption.");
          setStatus("error");
          setProgress(0);
          toast({ title: "Decryption Failed", description: "Incorrect key or corrupted file.", variant: "destructive" });
      }
  };


  const handleDownload = (blob: Blob | null, defaultFilename: string) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = defaultFilename; // Provide a default name
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

   const handleModeChange = (newMode: Mode) => {
        setMode(newMode);
        // Reset states when switching modes
        setSelectedFile(null);
        setPreviewUrl(null);
        setProcessedFile(null);
        setEncryptedData(null);
        setDecryptedData(null);
        setDecryptedPreviewUrl(null);
        setEncryptionKey(null);
        setDecryptionKeyInput('');
        setStatus("idle");
        setProgress(0);
        setError(null);
        setAnalysisResults(null);
        setProcessTime(null);
    };

    const handleReset = () => {
        clearPreview();
        setDecryptionKeyInput('');
        setMode('encrypt'); // Reset to default mode
    }

  const isLoading = ["preprocessing", "generating_key", "encrypting", "decrypting", "analyzing"].includes(status);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 lg:p-12 bg-secondary">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-accent">
                <path fillRule="evenodd" d="M12.75 2.25a.75.75 0 0 1 .75.75v5.25H18a.75.75 0 0 1 0 1.5h-4.5V15a.75.75 0 0 1-1.5 0v-4.5H7.5a.75.75 0 0 1 0-1.5h4.5V3a.75.75 0 0 1 .75-.75ZM18.375 16.125a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75ZM5.625 16.125a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75ZM12 16.125a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                <path d="M4.72 3.97a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1-1.06 1.06L4.72 5.03a.75.75 0 0 1 0-1.06ZM18.28 3.97a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 1 1-1.06-1.06l3.75-3.75a.75.75 0 0 1 1.06 0ZM4.72 20.03a.75.75 0 0 1 0-1.06l3.75-3.75a.75.75 0 0 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0ZM18.28 20.03a.75.75 0 0 1-1.06 0l-3.75-3.75a.75.75 0 1 1 1.06-1.06l3.75 3.75a.75.75 0 0 1 0 1.06Z" />
            </svg>
             MediCrypt
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Securely encrypt and decrypt your medical images using Rubik's Cube inspired pixel scrambling.
          </CardDescription>
           <div className="flex justify-center space-x-2 pt-4">
                <Button
                    variant={mode === 'encrypt' ? 'default' : 'outline'}
                    onClick={() => handleModeChange('encrypt')}
                    className={mode === 'encrypt' ? 'bg-accent hover:bg-accent/90' : ''}
                >
                    <Lock className="mr-2 h-4 w-4" /> Encrypt
                </Button>
                <Button
                    variant={mode === 'decrypt' ? 'default' : 'outline'}
                    onClick={() => handleModeChange('decrypt')}
                     className={mode === 'decrypt' ? 'bg-accent hover:bg-accent/90' : ''}
                >
                    <Unlock className="mr-2 h-4 w-4" /> Decrypt
                </Button>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <ImageUpload
            onFileChange={handleFileChange}
            previewUrl={previewUrl}
            clearPreview={clearPreview}
            id="medical-image-upload"
            accept={mode === 'encrypt' ? "image/png, image/jpeg, image/dicom, image/x-ray, image/ct, image/mri" : "*/*"} // Accept any file for decryption
           />

          {status !== "idle" && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground capitalize">
                {status.replace("_", " ")}...
                 {status === 'complete' && processTime && ` (${processTime.toFixed(2)} ms)`}
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

           {/* Decryption Key Input */}
           {mode === 'decrypt' && (
                <div className="flex items-center space-x-2">
                     <FileKey className="h-5 w-5 text-muted-foreground"/>
                     <input
                        type="text"
                        placeholder="Enter Decryption Key"
                        value={decryptionKeyInput}
                        onChange={(e) => setDecryptionKeyInput(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isLoading}
                    />
                </div>
            )}

          {/* Analysis Results Display */}
           {mode === 'encrypt' && analysisResults && status === 'complete' && (
                <Card className="bg-secondary">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-accent"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" /></svg>
                            Security Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                        <p>Robustness Score: <Badge variant="outline">{analysisResults.robustness.toFixed(1)} / 100</Badge></p>
                        <p>Attack Resistance: <Badge variant={analysisResults.resistance === 'High' ? 'default' : analysisResults.resistance === 'Medium' ? 'secondary' : 'destructive'} className={analysisResults.resistance === 'High' ? 'bg-green-600 text-white' : ''}>{analysisResults.resistance}</Badge></p>
                    </CardContent>
                </Card>
            )}

             {/* Decrypted Image Preview */}
            {mode === 'decrypt' && decryptedPreviewUrl && status === 'complete' && (
                 <div className="mt-4 border rounded-lg p-4 flex flex-col items-center bg-secondary">
                    <p className="text-sm font-medium mb-2">Decrypted Image:</p>
                    <Image
                        src={decryptedPreviewUrl}
                        alt="Decrypted preview"
                        width={200}
                        height={200}
                        className="max-h-48 w-auto object-contain rounded-md"
                        data-ai-hint="decrypted medical scan"
                     />
                 </div>
            )}
             {mode === 'decrypt' && decryptedData && !decryptedPreviewUrl && status === 'complete' && (
                 <Alert>
                    <Download className="h-4 w-4" />
                    <AlertTitle>Decryption Complete</AlertTitle>
                    <AlertDescription>
                        The decrypted file is ready for download. Preview is not available for this file type.
                    </AlertDescription>
                 </Alert>
            )}

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex gap-2 w-full sm:w-auto">
            {mode === 'encrypt' && (
                 <Button onClick={handleEncrypt} disabled={isLoading || !selectedFile || status === 'complete'} className="w-full sm:w-auto flex-1 sm:flex-none bg-accent hover:bg-accent/90">
                    {isLoading && status === 'encrypting' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                    Encrypt
                 </Button>
            )}
             {mode === 'decrypt' && (
                 <Button onClick={handleDecrypt} disabled={isLoading || (!selectedFile && !encryptedData) || !decryptionKeyInput || status === 'complete'} className="w-full sm:w-auto flex-1 sm:flex-none bg-accent hover:bg-accent/90">
                     {isLoading && status === 'decrypting' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unlock className="mr-2 h-4 w-4" />}
                    Decrypt
                 </Button>
            )}
             <Button variant="outline" onClick={handleReset} disabled={isLoading && status !== 'idle'} className="w-full sm:w-auto flex-1 sm:flex-none">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
             </Button>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {mode === 'encrypt' && encryptedData && status === 'complete' && (
                 <Button variant="outline" onClick={() => handleDownload(encryptedData, selectedFile?.name ? `${selectedFile.name}.encrypted` : 'encrypted_image')} className="w-full sm:w-auto flex-1 sm:flex-none">
                    <Download className="mr-2 h-4 w-4" />
                    Download Encrypted
                 </Button>
             )}
              {mode === 'decrypt' && decryptedData && status === 'complete' && (
                 <Button variant="outline" onClick={() => handleDownload(decryptedData, decryptedData?.name || 'decrypted_image')} className="w-full sm:w-auto flex-1 sm:flex-none">
                    <Download className="mr-2 h-4 w-4" />
                    Download Decrypted
                 </Button>
             )}
           </div>
        </CardFooter>
      </Card>
    </main>
  );
}
