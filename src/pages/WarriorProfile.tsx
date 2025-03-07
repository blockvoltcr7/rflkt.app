import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Warrior, warriors } from "@/data/warriors";
import { Timeline } from "@/components/ui/timeline";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { SideChatPanel } from "@/components/WarriorChat/SideChatPanel";

// Sample timeline data - in a real app, this would come from an API or database
const generateTimelineData = (warrior: Warrior) => {
  // This is sample data. In a real app, you would have actual historical data for each warrior
  const timelineData = [
    {
      title: "Early Life",
      content: (
        <div>
          <p className="text-neutral-300 text-xs md:text-sm font-normal mb-8">
            The early years that shaped {warrior.name}'s character and destiny. Born in {warrior.region} 
            during the {warrior.era}, the future warrior began their journey to greatness.
          </p>
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-4">
            <p className="text-sm text-white font-semibold">Notable Quote</p>
            <p className="text-neutral-400 italic">"{warrior.quotes[0]}"</p>
          </div>
        </div>
      ),
    },
    {
      title: "Rise to Prominence",
      content: (
        <div>
          <p className="text-neutral-300 text-xs md:text-sm font-normal mb-6">
            The period when {warrior.name} began to make their mark on history, 
            developing the {warrior.specialty} that would become their hallmark.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
              <p className="text-sm text-white font-semibold">Key Achievement</p>
              <p className="text-neutral-400">{warrior.achievements[0]}</p>
            </div>
            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
              <p className="text-sm text-white font-semibold">Character Traits</p>
              <p className="text-neutral-400">{warrior.personality}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Legacy",
      content: (
        <div>
          <p className="text-neutral-300 text-xs md:text-sm font-normal mb-6">
            The lasting impact and influence of {warrior.name} on history, warfare, and culture.
            Their methods and philosophies continue to inspire many to this day.
          </p>
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 mb-4">
            <p className="text-sm text-white font-semibold">Historical Significance</p>
            <ul className="list-disc list-inside text-neutral-400 space-y-2 mt-2">
              {warrior.achievements.map((achievement, i) => (
                <li key={i}>{achievement}</li>
              ))}
            </ul>
          </div>
          <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800">
            <p className="text-sm text-white font-semibold">Wisdom</p>
            <ul className="list-disc list-inside text-neutral-400 space-y-2 mt-2">
              {warrior.quotes.map((quote, i) => (
                <li key={i} className="italic">"{quote}"</li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return timelineData;
};

const WarriorProfile = () => {
  const { warriorId } = useParams<{ warriorId: string }>();
  const [warrior, setWarrior] = useState<Warrior | null>(null);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const foundWarrior = warriors.find(w => w.id === warriorId);
    if (foundWarrior) {
      setWarrior(foundWarrior);
    } else {
      navigate("/dashboard");
    }
  }, [warriorId, navigate]);

  if (!warrior) {
    return <div className="min-h-screen bg-black flex items-center justify-center">Loading...</div>;
  }

  const timelineData = generateTimelineData(warrior);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full max-w-6xl mx-auto p-4">
        <Button 
          variant="ghost" 
          className="text-white mb-6"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Warriors
        </Button>

        <div className="relative">
          <div 
            className="h-64 w-full bg-cover bg-center rounded-lg"
            style={{ 
              backgroundImage: `url(${warrior.imageUrl})`,
              backgroundColor: warrior.color
            }}
          />
          
          <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black to-transparent">
            <h1 className="text-4xl font-bold">{warrior.name}</h1>
            <p className="text-xl text-neutral-300">{warrior.shortDesc}</p>
          </div>
        </div>

        <div className="my-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-neutral-300 mb-4">{warrior.fullBio}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Era:</span>
                  <span className="text-white">{warrior.era}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Region:</span>
                  <span className="text-white">{warrior.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Specialty:</span>
                  <span className="text-white">{warrior.specialty}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
              <h2 className="text-xl font-semibold mb-4">Personality</h2>
              <p className="text-neutral-300">{warrior.personality}</p>
            </div>
            
            <Button 
              className="w-full"
              onClick={() => setShowChatPanel(true)}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat with {warrior.name}
            </Button>
          </div>
          
          <div className="md:col-span-2">
            <Timeline data={timelineData} />
          </div>
        </div>
      </div>

      {showChatPanel && (
        <SideChatPanel 
          warrior={warrior}
          onClose={() => setShowChatPanel(false)}
        />
      )}
    </div>
  );
};

export default WarriorProfile; 