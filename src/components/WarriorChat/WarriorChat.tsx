
import { useState } from "react";
import { Warrior } from "@/data/warriors";
import { WarriorSelection } from "./WarriorSelection";
import { ChatInterface } from "./ChatInterface";

export const WarriorChat = () => {
  const [selectedWarriors, setSelectedWarriors] = useState<Warrior[]>([]);
  const [chatStarted, setChatStarted] = useState(false);
  const [topic, setTopic] = useState("");
  
  const handleStartChat = (warriors: Warrior[], selectedTopic: string) => {
    setSelectedWarriors(warriors);
    setTopic(selectedTopic);
    setChatStarted(true);
  };
  
  const handleBackToSelection = () => {
    setChatStarted(false);
  };
  
  return (
    <div className="w-full">
      {chatStarted ? (
        <ChatInterface 
          warriors={selectedWarriors} 
          topic={topic} 
          onBack={handleBackToSelection} 
        />
      ) : (
        <WarriorSelection onStart={handleStartChat} />
      )}
    </div>
  );
};
