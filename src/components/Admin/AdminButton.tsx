import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { ModelConfig } from "./ModelConfig";

export const AdminButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Create key combination handlers
  const handleKeyDown = (e: KeyboardEvent) => {
    // Shift+Ctrl+A to open the modal
    if (e.shiftKey && e.ctrlKey && e.key === 'a') {
      setIsOpen(true);
    }
    
    // Shift+Ctrl+M to navigate to admin models page
    if (e.shiftKey && e.ctrlKey && e.key === 'm') {
      navigate('/admin/models');
    }
  };

  // Add/remove the keydown listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 opacity-20 hover:opacity-100 transition-opacity"
        title="Admin Settings (Shift+Ctrl+A) or go to Admin Page (Shift+Ctrl+M)"
      >
        <Settings className="h-4 w-4" />
      </Button>
      
      {isOpen && <ModelConfig onClose={() => setIsOpen(false)} />}
    </>
  );
}; 