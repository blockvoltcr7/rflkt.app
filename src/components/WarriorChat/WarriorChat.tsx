import { useState } from "react";
import { Warrior } from "@/data/warriors";
import { WarriorSelection } from "./WarriorSelection";
import { ChatInterface } from "./ChatInterface";
import { PhraseSelection } from "./PhraseSelection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const WarriorChat = () => {
  const [selectedWarriors, setSelectedWarriors] = useState<Warrior[]>([]);
  const [chatStarted, setChatStarted] = useState(false);
  const [topic, setTopic] = useState("");
  const [selectedPhrase, setSelectedPhrase] = useState("");
  const [chatMode, setChatMode] = useState<"warriors" | "phrase">("warriors");
  
  const handleStartWarriorChat = (warriors: Warrior[], selectedTopic: string) => {
    setSelectedWarriors(warriors);
    setTopic(selectedTopic);
    setChatStarted(true);
  };

  const handleStartPhraseChat = (phrase: string, selectedTopic: string) => {
    setSelectedPhrase(phrase);
    setTopic("");
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
          chatMode={chatMode}
          selectedPhrase={selectedPhrase}
        />
      ) : (
        <div className="space-y-6">
          <Tabs defaultValue="warriors" onValueChange={(value) => setChatMode(value as "warriors" | "phrase")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="warriors">Chat with Warriors</TabsTrigger>
              <TabsTrigger value="phrase">Motivational Phrases</TabsTrigger>
            </TabsList>
            <TabsContent value="warriors">
              <WarriorSelection onStart={handleStartWarriorChat} />
            </TabsContent>
            <TabsContent value="phrase">
              <PhraseSelection onStart={handleStartPhraseChat} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};
