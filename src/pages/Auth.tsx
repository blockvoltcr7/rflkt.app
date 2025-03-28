
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [inputValue, setInputValue] = useState("");
  const [secretPassphrase, setSecretPassphrase] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState(0);

  const placeholders = [
    "Enter the secret passphrase...",
    "What's the code?",
    "Speak friend and enter...",
    "Access requires verification...",
    "Waiting for passphrase...",
  ];

  useEffect(() => {
    const fetchSecretPassphrase = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'secret_passphrase')
          .single();
        
        if (error) {
          console.error("Error fetching passphrase:", error);
          toast.error("Error connecting to server", {
            description: "Please try again later",
          });
        } else if (data) {
          setSecretPassphrase(data.value);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSecretPassphrase();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isLoading) {
      toast.error("Please wait", {
        description: "Still connecting to server...",
      });
      return;
    }
    
    // Check for default passphrase OR the stored passphrase
    if (inputValue.toLowerCase() === "warrior" || inputValue.toLowerCase() === secretPassphrase.toLowerCase()) {
      localStorage.setItem("authenticated", "true");
      
      toast.success("Access granted", {
        description: "Welcome to the application",
        duration: 3000,
      });
      
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } else {
      setAttempts(attempts + 1);
      
      toast.error("Access denied", {
        description: attempts >= 2 ? "Final warning: Incorrect passphrase" : "Incorrect passphrase",
        duration: 3000,
      });
      
      if (attempts >= 3) {
        toast.error("Security alert", {
          description: "Multiple failed attempts detected",
          duration: 5000,
        });
      }
    }
  };

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("authenticated") === "true";
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="h-28 w-full">
          <TextHoverEffect text="RFLKT" />
        </div>
        
        <div className="mt-8">
          {isLoading ? (
            <div className="text-center text-sm text-zinc-500">Loading...</div>
          ) : (
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={handleChange}
              onSubmit={onSubmit}
            />
          )}
        </div>
        
        <div className="mt-6 text-center text-xs text-zinc-500">
          Enter the secret passphrase to gain access
        </div>
      </div>
    </div>
  );
};

export default Auth;
