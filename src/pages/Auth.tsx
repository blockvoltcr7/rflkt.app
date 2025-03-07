
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { toast } from "sonner";

// The secret passphrase to access the application
const SECRET_PASSPHRASE = "reflect";

const Auth = () => {
  const [inputValue, setInputValue] = useState("");
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState(0);

  const placeholders = [
    "Enter the secret passphrase...",
    "What's the code?",
    "Speak friend and enter...",
    "Access requires verification...",
    "Waiting for passphrase...",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (inputValue.toLowerCase() === SECRET_PASSPHRASE) {
      // Correct passphrase, set authenticated to true in localStorage
      localStorage.setItem("authenticated", "true");
      
      // Show success toast
      toast.success("Access granted", {
        description: "Welcome to the application",
        duration: 3000,
      });
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } else {
      // Increment attempts
      setAttempts(attempts + 1);
      
      // Show error toast
      toast.error("Access denied", {
        description: attempts >= 2 ? "Final warning: Incorrect passphrase" : "Incorrect passphrase",
        duration: 3000,
      });
      
      // If too many failed attempts, show additional warning
      if (attempts >= 3) {
        toast.error("Security alert", {
          description: "Multiple failed attempts detected",
          duration: 5000,
        });
      }
    }
  };

  // Check if user is already authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("authenticated") === "true";
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="h-28 w-full">
          <TextHoverEffect text="RFLKT" />
        </div>
        
        <div className="mt-8">
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={handleChange}
            onSubmit={onSubmit}
          />
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-400">
          Enter the secret passphrase to gain access
        </div>
      </div>
    </div>
  );
};

export default Auth;
