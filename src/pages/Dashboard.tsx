
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { WarriorChat } from "@/components/WarriorChat/WarriorChat";

const Dashboard = () => {
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("authenticated") === "true";
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("authenticated");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="h-16 w-48">
            <TextHoverEffect text="WARRIORCHAT" />
          </div>
          
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="border-zinc-700 hover:bg-zinc-800"
          >
            Logout
          </Button>
        </div>
        
        <div className="bg-[#111] shadow-xl rounded-lg p-6 border border-zinc-800 mb-8">
          <h2 className="text-2xl font-bold mb-2 text-white">
            Welcome to WarriorChat
          </h2>
          <p className="text-zinc-400 mb-6">
            Select historical warriors and engage in conversations about strategy, resilience, 
            and victories. Ask questions, join the discussion, and learn from history's greatest warriors.
          </p>
        </div>
        
        <WarriorChat />
      </div>
    </div>
  );
};

export default Dashboard;
