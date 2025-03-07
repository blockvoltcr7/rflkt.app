import { useState, useRef, useEffect } from "react";
import { Warrior } from "@/data/warriors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, ChevronRight, ChevronLeft } from "lucide-react";
import { Message } from "@/types/chat";
import ReactMarkdown from 'react-markdown';
import { createChatCompletion, createWarriorSystemPrompt, moderateUserMessage } from "@/services/openai";
import { toast } from "sonner";

interface SideChatPanelProps {
  warrior: Warrior;
  onClose: () => void;
}

// We need to extend the Message type with an ID for React keys
interface ChatMessage extends Message {
  id: string;
}

export const SideChatPanel = ({ warrior, onClose }: SideChatPanelProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const warriorContext = useRef<{ systemPrompt: string; warrior: Warrior }>({
    systemPrompt: "",
    warrior
  });

  // Initialize the chat with a greeting from the warrior
  useEffect(() => {
    const initializeChat = async () => {
      // Create the system prompt for this warrior
      const systemPrompt = createWarriorSystemPrompt(warrior, "");
      warriorContext.current = { systemPrompt, warrior };
      
      // Add a greeting message from the warrior
      try {
        setIsLoading(true);
        const greeting = await createChatCompletion({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Please introduce yourself briefly as ${warrior.name} and welcome me to the conversation.` }
          ]
        });
        
        setMessages([
          {
            id: Date.now().toString(),
            content: greeting || `Greetings! I am ${warrior.name}. How can I assist you on your journey today?`,
            warrior: warrior.id,
            timestamp: new Date(),
          }
        ]);
      } catch (error) {
        console.error("Failed to generate greeting:", error);
        setMessages([
          {
            id: Date.now().toString(),
            content: `Greetings! I am ${warrior.name}. How can I assist you on your journey today?`,
            warrior: warrior.id,
            timestamp: new Date(),
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeChat();
  }, [warrior]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: userInput,
      warrior: "user",
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput("");
    setIsLoading(true);
    
    try {
      // Check content moderation
      const hasConcerningContent = moderateUserMessage(userInput);
      if (hasConcerningContent) {
        setIsLoading(false);
        toast.error("I notice you may be discussing concerning topics. If you need support, please reach out to appropriate resources.");
        
        // Add a supportive system message
        const supportMessage: ChatMessage = {
          id: Date.now().toString(),
          content: "I notice you're expressing thoughts that concern me. If you're experiencing a crisis, please consider contacting a mental health professional or crisis line: National Suicide Prevention Lifeline: 988 or 1-800-273-8255",
          warrior: "system",
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, supportMessage]);
        return;
      }
      
      // Format conversation history for API
      const apiMessages = messages.map(m => {
        if (m.warrior === "user") {
          return { role: "user" as const, content: m.content };
        } else {
          return { role: "assistant" as const, content: m.content };
        }
      });
      
      // Get warrior response
      const response = await createChatCompletion({
        messages: [
          { role: "system", content: warriorContext.current.systemPrompt },
          ...apiMessages,
          { role: "user", content: userInput }
        ]
      });
      
      // Provide a fallback response for common questions if API fails
      const fallbackResponse = generateFallbackResponse(userInput, warrior);
      
      if (response) {
        // Add warrior response
        const warriorMessage: ChatMessage = {
          id: Date.now().toString(),
          content: response,
          warrior: warrior.id,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, warriorMessage]);
      } else if (fallbackResponse) {
        // Use fallback if API failed but we have a relevant fallback
        const fallbackMessage: ChatMessage = {
          id: Date.now().toString(),
          content: fallbackResponse,
          warrior: warrior.id,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, fallbackMessage]);
      } else {
        toast.error("Failed to get a response. Please try again.");
      }
    } catch (error) {
      console.error("Error in chat:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div 
      className={`fixed top-0 right-0 h-full bg-zinc-900 border-l border-zinc-800 transition-all duration-300 z-50 flex flex-col ${
        isExpanded ? "w-80 sm:w-96" : "w-12"
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute top-1/2 -left-4 bg-zinc-900 border border-zinc-800 rounded-full p-1 z-10"
      >
        {isExpanded ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
      
      {isExpanded && (
        <>
          {/* Header */}
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 rounded-full bg-cover bg-center"
                style={{ backgroundImage: `url(${warrior.imageUrl})` }}
              />
              <h3 className="font-medium">{warrior.name}</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>
          
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.warrior === "user" ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.warrior === "user" 
                      ? "bg-blue-600 text-white" 
                      : "bg-zinc-800 text-white"
                  }`}
                >
                  <div className="prose prose-sm prose-invert">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-lg bg-zinc-800 text-white">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat input */}
          <div className="p-4 border-t border-zinc-800">
            <div className="flex space-x-2">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                size="icon" 
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isLoading}
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Helper function to generate fallback responses for common questions
const generateFallbackResponse = (userInput: string, warrior: Warrior): string | null => {
  const lowerInput = userInput.toLowerCase();
  
  // Check for questions about achievements
  if (lowerInput.includes("achievement") || 
      lowerInput.includes("accomplish") || 
      lowerInput.includes("greatest") ||
      lowerInput.includes("proud") ||
      lowerInput.includes("victory")) {
    
    // Warrior-specific achievement responses
    const achievementResponses: Record<string, string> = {
      "musashi": "My greatest achievements include remaining undefeated in over 60 duels, developing the dual-sword technique, and writing 'The Book of Five Rings' - a text that has guided warriors and strategists for centuries. However, I consider my greatest accomplishment to be the mastery of myself, for true victory comes from within.",
      // Add responses for other warriors here
    };
    
    // Return the specific warrior's response or a generic one
    return achievementResponses[warrior.id] || 
      `I am known for many accomplishments, including ${warrior.achievements.join(", ")}. However, the true measure of achievement is not in victory alone, but in how one conducts oneself on the path.`;
  }
  
  return null;
}; 