import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PhraseSelectionProps {
  onStart: (selectedPhrase: string, topic: string) => void;
}

// Predefined motivational phrases
const motivationalPhrases = [
  {
    id: "youvsyou",
    phrase: "You vs. You",
    description: "Focus on competing with yourself, not others"
  },
  {
    id: "lockin",
    phrase: "Lock In",
    description: "Complete focus and commitment to your goals"
  },
  {
    id: "positivevoice",
    phrase: "Positive Inner Voice Only",
    description: "Eliminate self-doubt and negative self-talk"
  },
  {
    id: "discipline",
    phrase: "Only Discipline",
    description: "Consistency and routine build excellence"
  },
  {
    id: "challenge",
    phrase: "Challenge Yourself",
    description: "Growth happens at the edge of your comfort zone"
  }
];

export const PhraseSelection = ({ onStart }: PhraseSelectionProps) => {
  const [selectedPhrase, setSelectedPhrase] = useState<string>("");

  const handleStart = () => {
    if (!selectedPhrase) {
      toast.error("Please select a motivational phrase");
      return;
    }
    
    // No topic needed for phrase chat - passing empty string
    onStart(selectedPhrase, "");
  };

  return (
    <div className="space-y-6 w-full max-w-3xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Select a Motivational Phrase</h2>
        <p className="text-zinc-400">Choose a phrase to guide your reflection</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {motivationalPhrases.map((phrase) => (
          <div 
            key={phrase.id}
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${
              selectedPhrase === phrase.phrase
                ? 'border-purple-500 bg-black'
                : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
            }`}
            onClick={() => setSelectedPhrase(phrase.phrase)}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${selectedPhrase === phrase.phrase ? 'bg-purple-500' : 'bg-zinc-700'}`}></div>
              <div className="space-y-1">
                <p className="text-white font-medium">{phrase.phrase}</p>
                <p className="text-sm text-zinc-400">{phrase.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <Button 
        onClick={handleStart}
        disabled={!selectedPhrase}
        className="w-full"
      >
        Start Phrase Chat
      </Button>
    </div>
  );
}; 