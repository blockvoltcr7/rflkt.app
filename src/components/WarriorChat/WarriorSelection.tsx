import { useState } from "react";
import { Warrior, warriors } from "@/data/warriors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { WarriorCard } from "./WarriorCard";

interface WarriorSelectionProps {
  onStart: (selectedWarriors: Warrior[], topic: string) => void;
}

export const WarriorSelection = ({ onStart }: WarriorSelectionProps) => {
  const [selectedWarriors, setSelectedWarriors] = useState<Warrior[]>([]);
  const [topic, setTopic] = useState("");

  const toggleWarrior = (warrior: Warrior) => {
    if (selectedWarriors.find(w => w.id === warrior.id)) {
      setSelectedWarriors(selectedWarriors.filter(w => w.id !== warrior.id));
    } else {
      if (selectedWarriors.length >= 5) {
        toast.warning("You can select a maximum of 5 warriors");
        return;
      }
      setSelectedWarriors([...selectedWarriors, warrior]);
    }
  };

  const handleStart = () => {
    if (selectedWarriors.length < 2) {
      toast.error("Please select at least 2 warriors");
      return;
    }
    
    if (!topic.trim()) {
      toast.error("Please enter a topic for discussion");
      return;
    }
    
    onStart(selectedWarriors, topic);
  };

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Select Warriors (2-5)</h2>
        <p className="text-zinc-400">Choose the historical warriors you want in your chat</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {warriors.map((warrior) => (
          <WarriorCard
            key={warrior.id}
            warrior={warrior}
            isSelected={selectedWarriors.some(w => w.id === warrior.id)}
            onSelect={toggleWarrior}
            selectionMode={true}
          />
        ))}
      </div>
      
      <div className="space-y-2 pt-4">
        <Label htmlFor="topic" className="text-white">Discussion Topic</Label>
        <Input
          id="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Battle strategy, leadership, greatest victories..."
          className="bg-zinc-900 border-zinc-800 text-white"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleStart();
            }
          }}
        />
      </div>
      
      <Button 
        onClick={handleStart}
        disabled={selectedWarriors.length < 2 || !topic.trim()}
        className="w-full"
      >
        Start Warrior Chat
      </Button>
    </div>
  );
};
