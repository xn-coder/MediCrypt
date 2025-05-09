# MediCrypt - Secure Medical Image Encryption & Management

MediCrypt is a Next.js web application designed for secure medical image encryption, decryption, and management. It provides features for user authentication with local key files, pixel scrambling based on a Rubik's cube-inspired algorithm, SM4-like key generation, and an admin dashboard for user oversight.

## Features

### 1. User Authentication & Management
- **Login/Register:** Users can create accounts or log in.
- **Local Key File:** Upon registration, a unique `.txt` key file is generated and downloaded. This file, along with a password, is required for login, adding a layer of two-factor like security.
- **Role-Based Access:**
    - **User:** Can encrypt and decrypt their own medical images. Receives decryption keys via email (if configured).
    - **Admin:** Can encrypt/decrypt images and access an Admin Dashboard to view a list of all registered non-admin users.

### 2. Medical Image Encryption
- **Image Upload:** Users can upload medical images (PNG, JPG, DICOM, X-Ray, CT, MRI).
- **Pixel Scrambling (Rubik's Algorithm Inspired):**
    - Admins (and users, in the current implementation) can configure "Rotation Layers" to simulate pixel scrambling complexity before encryption.
- **Key Generation (SM4-like):** A unique, cryptographically-inspired key is generated for each encryption process.
- **Encryption Process:**
    1. Image preprocessing (simulated).
    2. Key generation.
    3. Image data is XORed with the generated key and rotation layer value.
    4. Metadata (original filename, type, key, rotation layers) is prepended to the encrypted data.
    5. The result is a `.mcf` (MediCrypt File) blob.
- **Key Storage:** The decryption key for an encrypted file is automatically saved to the user's profile (stored in `localStorage` for this demo).
- **Email Notification:** If EmailJS is configured, the decryption key is automatically sent to the user's registered email address after successful encryption.
- **Security Analysis:** A simulated analysis provides a "robustness" score and "resistance" level for the encryption.

### 3. Medical Image Decryption
- **Encrypted File Upload:** Users upload `.mcf` files.
- **Key Input:** Users must provide the correct decryption key.
    - If the user previously encrypted the file, the key might be auto-filled from their profile.
- **Decryption Process:**
    1. Metadata is read from the start of the `.mcf` file.
    2. The embedded key from the metadata is verified against the user-provided key.
    3. The core data is XORed with the key and rotation layers to restore the original image data.
- **Preview/Download:** Decrypted images can be previewed if they are of a common image type; other file types can be downloaded.

### 4. Admin Dashboard
- **User Listing:** Admins can view a table of all registered non-admin users, including their email, role, and the count of encrypted files they have keys for.
- **Separate View:** Admins have a dedicated dashboard view, separate from the encryption/decryption tool (which they can also access).

## Technologies Used

- **Frontend:** Next.js (React framework), TypeScript, Tailwind CSS
- **UI Components:** ShadCN/UI (beautifully designed components)
- **Icons:** Lucide React
- **Client-side Storage:** `localStorage` (for mock user data and encrypted file keys)
- **Email Service:** EmailJS (for sending decryption keys via email)
- **Styling:** CSS Variables, Tailwind CSS utility classes

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd medicrypt-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up Environment Variables (for EmailJS):**
    Create a `.env.local` file in the root of your project and add your EmailJS credentials. If you don't have them, you can sign up at [EmailJS](https://www.emailjs.com/).
    ```env
    NEXT_PUBLIC_EMAILJS_SERVICE_ID=YOUR_EMAILJS_SERVICE_ID
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=YOUR_EMAILJS_TEMPLATE_ID
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=YOUR_EMAILJS_PUBLIC_KEY
    ```
    - `NEXT_PUBLIC_EMAILJS_SERVICE_ID`: Your EmailJS service ID.
    - `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`: The ID of the email template you create in EmailJS. This template should accept variables like `to_email`, `file_name`, `decryption_key`, and `user_email`.
    - `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`: Your EmailJS Public Key (User ID).

    **Note:** If EmailJS variables are not set or are set to placeholder values, the email notification feature will be disabled, and a warning will be shown in the UI.

4.  **(Optional) Genkit Setup (if using GenAI features - not core to current functionality but Genkit files are present):**
    If you plan to extend with Genkit AI features:
    - Ensure you have a Google AI API Key if using the `googleAI` plugin.
    - Set `GOOGLE_GENAI_API_KEY=YOUR_API_KEY` in your `.env.local` file.

## Running the Application

1.  **Development Mode:**
    ```bash
    npm run dev
    ```
    This will start the Next.js development server, usually on `http://localhost:9002`.

2.  **Build for Production:**
    ```bash
    npm run build
    ```

3.  **Start Production Server:**
    ```bash
    npm run start
    ```

## How to Use

### 1. Registration
- Navigate to the application.
- Select the "Register" tab.
- Choose your desired role: "User" or "Admin".
    - **User Role:** Standard account for encrypting/decrypting personal medical images.
    - **Admin Role:** Special account with access to the Admin Dashboard and encryption/decryption tools.
- Enter your email and a password (for demo purposes, 'password' is a common test password, but use a unique one).
- Click "Register as [Role]".
- A `.txt` key file (e.g., `yourname_medicrypt_key.txt`) will be automatically downloaded. **Keep this file safe! It's required for login.**
- You'll be prompted to log in.

### 2. Login
- Select the "Login" tab.
- Enter the email and password you registered with.
- Click the file input to select the `.txt` key file that was downloaded during your registration.
- Choose the role you are trying to log in as (User or Admin). The system will verify your actual role from its records.
- Click "Login".

### 3. Encrypting an Image (User or Admin in Encrypt/Decrypt Tool)
- Once logged in, ensure you are in "Encrypt" mode.
- If you are an Admin, you can configure "Rotation Layers" (1-10) for pixel scrambling complexity. Users also see this option.
- Click "Click to upload or drag and drop" to select a medical image file.
- A preview of the image will appear.
- Click the "Encrypt" button.
- The process will go through: Preprocessing, Generating Key, Encrypting, Analyzing.
- Upon completion:
    - A security analysis (robustness, resistance, rotation layers used, encryption time) will be displayed.
    - The generated decryption key will be shown, with an option to copy it.
    - If EmailJS is configured and successful, a notification will confirm that the key has been sent to your email.
    - The decryption key is also automatically saved to your user profile in `localStorage`.
    - You can download the encrypted `.mcf` file.
    - If EmailJS is not configured or failed, an option to "Email Key Manually" (using your local email client) will appear.

### 4. Decrypting an Image (User or Admin in Encrypt/Decrypt Tool)
- Select "Decrypt" mode.
- Upload the encrypted `.mcf` file.
- A message will prompt you to enter the decryption key.
    - If you previously encrypted a file with a similar original name, the key might be pre-filled from your profile. Verify it.
- Enter the correct decryption key into the input field.
- Click the "Decrypt" button.
- Upon successful decryption:
    - If the file is an image, a preview will be shown along with the original filename, type, and rotation layers used.
    - If it's not a previewable image type, a success message will appear.
    - You can download the decrypted file.

### 5. Admin Dashboard (Admin Role Only)
- If you log in as an Admin, you will initially see the "Admin Dashboard".
- This dashboard lists all registered non-admin users, showing their email, role, and the number of encrypted files for which they have keys stored in their profile.
- Admins can switch to the "Encrypt/Decrypt Tool" using the button at the top.

### 6. Logout
- Click the "LogOut" icon (door icon) in the top-right corner of the application card.

## Security Notes

- **Demo Purposes:** This application uses `localStorage` for storing user data (including simulated password hashes and key file content) and decryption keys. **This is NOT secure for a production environment.** In a real-world scenario, user data and keys would be managed by a secure backend and database.
- **Key File:** The local key file adds a conceptual layer of security but relies on the user keeping it safe.
- **Encryption Algorithm:** The "Rubik's" and "SM4-like" algorithms are conceptual for this demo. For production, use well-vetted, standard cryptographic libraries and algorithms (e.g., AES-GCM).
- **Metadata in File:** Embedding metadata (including the key) directly in the encrypted file, as done in this demo for simplicity in the decryption mock, is **highly insecure**. In a real system, keys should never be stored alongside the ciphertext in this manner. Key management would be a critical, separate concern.
- **EmailJS:** Sending decryption keys via email can be risky if the email account is compromised. Consider more secure key distribution methods for sensitive data.

## Environment Variables for EmailJS

For the "send key via email" feature to work, you need to configure EmailJS:

1.  Sign up/log in at [EmailJS](https://www.emailjs.com/).
2.  Add an Email Service (e.g., Gmail).
3.  Create an Email Template. Your template should include placeholders for:
    *   Recipient's email: `{{to_email}}`
    *   Filename: `{{file_name}}`
    *   Decryption key: `{{decryption_key}}`
    *   Sender's/User's email (optional, for context): `{{user_email}}`
    Example template body:
    ```
    Hello,

    The decryption key for your file "{{file_name}}" is:
    {{decryption_key}}

    Please keep this key secure.

    Regards,
    MediCrypt System
    (Sent from: {{user_email}})
    ```
4.  Find your Service ID, Template ID, and Public Key (User ID) from your EmailJS dashboard.
5.  Create a `.env.local` file in the project root and add these values:
    ```env
    NEXT_PUBLIC_EMAILJS_SERVICE_ID=YOUR_SERVICE_ID
    NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=YOUR_TEMPLATE_ID
    NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=YOUR_PUBLIC_KEY
    ```

If these variables are not set correctly, the email feature will be disabled.

---

This README provides a comprehensive overview of the MediCrypt application. Remember that many aspects are simplified for demonstration and would require robust, secure implementations for production use.
