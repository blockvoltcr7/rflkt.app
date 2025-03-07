import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { warriors } from "@/data/warriors";
import { WarriorCard } from "@/components/WarriorChat/WarriorCard";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const WarriorDirectory = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="w-full max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Warrior Directory</h1>
            <p className="text-zinc-400">Explore the warriors of RFLKT and delve into their timelines</p>
          </div>
          
          <Button 
            onClick={() => navigate("/chat")}
            className="flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Chat with Warriors
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warriors.map((warrior) => (
            <WarriorCard
              key={warrior.id}
              warrior={warrior}
              selectionMode={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WarriorDirectory; 