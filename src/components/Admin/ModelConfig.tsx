import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { MODEL_OPTIONS, ModelProvider } from "@/services/ai";
import { 
  getModelConfig, 
  setModelProvider, 
  setModel, 
  isAdminMode,
  toggleAdminMode
} from "@/services/modelConfig";
import { X } from "lucide-react";

interface ModelConfigProps {
  onClose?: () => void;
  modal?: boolean; // Whether to show as a modal (default true)
  onAuthSuccess?: () => void; // Callback for successful authentication
}

export const ModelConfig = ({ onClose, modal = true, onAuthSuccess }: ModelConfigProps) => {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(isAdminMode());
  const [selectedProvider, setSelectedProvider] = useState<ModelProvider>(getModelConfig().provider);
  const [selectedModel, setSelectedModel] = useState<string>(getModelConfig().model);
  const [configSaved, setConfigSaved] = useState(false);

  // Handle authentication
  const handleAuth = () => {
    const success = toggleAdminMode(password);
    if (success) {
      setAuthenticated(isAdminMode());
      if (isAdminMode()) {
        toast.success("Admin mode activated");
        // Call the callback if provided
        onAuthSuccess?.();
      } else {
        toast.info("Logged out of admin mode");
      }
    } else {
      toast.error("Invalid password");
    }
    setPassword("");
  };

  // Handle model provider change
  const handleProviderChange = (provider: ModelProvider) => {
    setSelectedProvider(provider);
    // Default to first model in the provider's list
    setSelectedModel(MODEL_OPTIONS[provider][0]);
  };

  // Save configuration
  const saveConfig = () => {
    setModelProvider(selectedProvider);
    setModel(selectedModel);
    toast.success("Model configuration saved");
    setConfigSaved(true);
    
    // Reset the saved indicator after a delay
    setTimeout(() => setConfigSaved(false), 2000);
  };

  // Content for the authentication panel
  const authContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
          placeholder="Enter admin password"
          className="bg-zinc-800"
        />
      </div>
      
      <Button 
        onClick={handleAuth}
        className="w-full"
      >
        Access Admin Panel
      </Button>
    </div>
  );

  // Content for the configuration panel
  const configContent = (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-white">Select Model Provider</h3>
        <RadioGroup 
          value={selectedProvider} 
          onValueChange={(value) => handleProviderChange(value as ModelProvider)}
          className="grid grid-cols-2 gap-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="openai" id="openai" />
            <Label htmlFor="openai">OpenAI</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="gemma" id="gemma" />
            <Label htmlFor="gemma">Gemma (OpenRouter)</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-white">Select Model</h3>
        <RadioGroup 
          value={selectedModel} 
          onValueChange={setSelectedModel}
          className="grid gap-2"
        >
          {MODEL_OPTIONS[selectedProvider].map(model => (
            <div key={model} className="flex items-center space-x-2">
              <RadioGroupItem value={model} id={model} />
              <Label htmlFor={model}>{model}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          onClick={() => toggleAdminMode('rflkt-admin')}
        >
          Logout of Admin Mode
        </Button>
        
        <Button 
          onClick={saveConfig}
          disabled={configSaved}
        >
          {configSaved ? "Saved!" : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
  
  // If not in modal mode, render only the content
  if (!modal) {
    return authenticated ? configContent : authContent;
  }

  // Modal version
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-6 rounded-lg shadow-lg w-[500px] max-w-[90%]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            {authenticated ? "Model Configuration" : "Admin Access"}
          </h2>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          )}
        </div>
        
        {authenticated ? configContent : authContent}
      </div>
    </div>
  );
}; 