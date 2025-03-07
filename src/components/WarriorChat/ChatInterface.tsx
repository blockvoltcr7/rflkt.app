
import { useState, useRef, useEffect } from "react";
import { Warrior } from "@/data/warriors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { RefreshCw, Send } from "lucide-react";

interface Message {
  warrior: string | "user";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  warriors: Warrior[];
  topic: string;
  onBack: () => void;
}

export const ChatInterface = ({ warriors, topic, onBack }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mock chat simulation - this would be replaced by actual OpenAI API calls
  useEffect(() => {
    const initialMessage: Message = {
      warrior: "system",
      content: `Welcome! Today's discussion topic: "${topic}"`,
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);
    
    // Simulate initial responses from warriors
    const initialResponses = warriors.map((warrior) => ({
      warrior: warrior.id,
      content: getInitialResponse(warrior, topic),
      timestamp: new Date(Date.now() + Math.random() * 2000)
    }));
    
    const sortedResponses = initialResponses.sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );
    
    // Stagger the messages to simulate real conversation
    sortedResponses.forEach((msg, index) => {
      setTimeout(() => {
        setMessages(prev => [...prev, msg]);
      }, (index + 1) * 1500);
    });
  }, [warriors, topic]);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      warrior: "user",
      content: userInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput("");
    setIsLoading(true);
    
    // Simulate warrior responses
    setTimeout(() => {
      // Random selection of warriors who will respond (1-3)
      const respondingWarriors = warriors
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 3) + 1);
      
      const responses = respondingWarriors.map(warrior => ({
        warrior: warrior.id,
        content: simulateResponse(warrior, userInput, topic),
        timestamp: new Date(Date.now() + Math.random() * 3000)
      }));
      
      const sortedResponses = responses.sort((a, b) => 
        a.timestamp.getTime() - b.timestamp.getTime()
      );
      
      sortedResponses.forEach((msg, index) => {
        setTimeout(() => {
          setMessages(prev => [...prev, msg]);
          if (index === sortedResponses.length - 1) {
            setIsLoading(false);
          }
        }, (index + 1) * 1500);
      });
    }, 1000);
  };
  
  const handleRefocus = () => {
    setIsLoading(true);
    toast.info("Refocusing the conversation on the topic", {
      description: topic
    });
    
    setTimeout(() => {
      const refocusMessage: Message = {
        warrior: "system",
        content: `Let's refocus our discussion on: "${topic}"`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, refocusMessage]);
      
      // Simulate responses after refocus
      warriors.forEach((warrior, index) => {
        setTimeout(() => {
          const response: Message = {
            warrior: warrior.id,
            content: getRefocusResponse(warrior, topic),
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, response]);
          if (index === warriors.length - 1) {
            setIsLoading(false);
          }
        }, (index + 1) * 1500);
      });
    }, 1000);
  };
  
  // Find warrior by ID
  const getWarrior = (id: string): Warrior | undefined => {
    return warriors.find(w => w.id === id);
  };

  return (
    <div className="flex flex-col h-[80vh] max-w-4xl w-full mx-auto">
      <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">WarriorChat</h2>
            <p className="text-zinc-400 text-sm">Topic: {topic}</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefocus}
              disabled={isLoading}
              className="border-zinc-700 text-zinc-300"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refocus
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBack}
              className="border-zinc-700 text-zinc-300"
            >
              Back
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-zinc-950 border-x border-zinc-800 flex flex-col gap-4">
        {messages.map((msg, index) => {
          if (msg.warrior === "system") {
            return (
              <div key={index} className="text-center py-2">
                <span className="text-xs text-zinc-500 bg-black px-3 py-1 rounded-full">
                  {msg.content}
                </span>
              </div>
            );
          }
          
          if (msg.warrior === "user") {
            return (
              <div key={index} className="flex justify-end">
                <div className="bg-zinc-800 p-3 rounded-lg max-w-[80%]">
                  <p className="text-white">{msg.content}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    You • {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            );
          }
          
          const warrior = getWarrior(msg.warrior);
          if (!warrior) return null;
          
          return (
            <div key={index} className="flex">
              <div 
                className="p-3 rounded-lg max-w-[80%]"
                style={{ backgroundColor: `${warrior.color}20`, borderLeft: `3px solid ${warrior.color}` }}
              >
                <p className="font-semibold text-white">{warrior.name}</p>
                <p className="text-zinc-200">{msg.content}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
        
        {isLoading && (
          <div className="text-center">
            <span className="inline-block px-3 py-1 rounded-full text-xs text-zinc-400">
              Warriors are thinking...
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-b-lg">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Join the conversation..."
            disabled={isLoading}
            className="bg-zinc-950 border-zinc-800 text-white"
          />
          <Button 
            type="submit" 
            disabled={!userInput.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

// Helper functions for mock responses
function getInitialResponse(warrior: Warrior, topic: string): string {
  const personalityTraits = warrior.personality.split(", ");
  const randomTrait = personalityTraits[Math.floor(Math.random() * personalityTraits.length)];
  
  const responses = [
    `Greetings. I look forward to discussing ${topic} with fellow warriors.`,
    `Ah, ${topic}. A worthy subject for our gathering.`,
    `I've much to share about ${topic} from my experiences.`,
    `${topic}? An excellent choice for warriors to discuss.`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

function getRefocusResponse(warrior: Warrior, topic: string): string {
  const responses = [
    `Indeed, let us return to ${topic}.`,
    `Yes, ${topic} is what we should focus on.`,
    `I have more insights on ${topic} to share.`,
    `Back to ${topic} - as I was saying...`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

function simulateResponse(warrior: Warrior, userInput: string, topic: string): string {
  // In a real implementation, this would call the OpenAI API
  const responses = [
    `From my experience, I've learned that ${topic} requires discipline and practice.`,
    `When I faced challenges regarding ${topic}, I relied on my training.`,
    `Throughout history, ${topic} has been approached in many ways.`,
    `The strategy I employed for ${topic} was successful in my campaigns.`,
    `I would advise considering all angles when approaching ${topic}.`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}
