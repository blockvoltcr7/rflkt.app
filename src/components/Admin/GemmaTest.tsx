import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import * as GemmaService from "@/services/gemma";
import { getModelConfig } from "@/services/modelConfig";

export const GemmaTest = () => {
  const [prompt, setPrompt] = useState("Tell me a short story about a warrior.");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Get current config for display
  const config = getModelConfig();

  const testGemma = async () => {
    try {
      setIsLoading(true);
      setError("");
      setResponse("");
      
      // Log that we're making the API call
      console.log("Testing Gemma API with prompt:", prompt);
      console.log("Current config:", getModelConfig());
      
      // Make the direct API call
      const result = await GemmaService.createChatCompletion({
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300
      });
      
      // Set the response
      setResponse(result);
    } catch (err) {
      console.error("Error testing Gemma:", err);
      setError("Failed to call Gemma API. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 bg-zinc-900 rounded-lg border border-zinc-800">
      <div className="p-3 bg-zinc-800 rounded mb-4">
        <p className="text-sm text-zinc-400">Current Configuration:</p>
        <div className="mt-1 text-sm text-white">
          <div>Provider: <span className="text-blue-400">{config.provider}</span></div>
          <div>Model: <span className="text-green-400">{config.model}</span></div>
        </div>
      </div>
      
      <h3 className="text-lg font-medium text-white">Test Gemma API</h3>
      
      <div className="space-y-2">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a prompt to test"
          className="h-24 bg-zinc-800"
        />
        
        <Button 
          onClick={testGemma}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Testing..." : "Test Gemma API"}
        </Button>
      </div>
      
      {error && (
        <div className="p-3 bg-red-900/30 border border-red-800 rounded text-red-300">
          {error}
        </div>
      )}
      
      {response && (
        <div className="p-4 bg-zinc-800 rounded-lg">
          <h4 className="text-sm font-medium text-zinc-400 mb-2">Response:</h4>
          <div className="whitespace-pre-wrap text-zinc-200">{response}</div>
        </div>
      )}
    </div>
  );
}; 