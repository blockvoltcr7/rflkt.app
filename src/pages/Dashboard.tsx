import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { BookOpen, MessageCircle, HistoryIcon, User } from "lucide-react";

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
        <div className="flex justify-between items-center mb-12">
          <div className="h-16 w-48">
            <TextHoverEffect text="RFLKT" />
          </div>
          
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="border-zinc-700 hover:bg-zinc-800"
          >
            Logout
          </Button>
        </div>
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
            Connect with Warriors Through Time
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
            Choose your path to wisdom: explore warrior timelines or engage directly in conversations with history's greatest warriors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => navigate("/warriors")}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 hover:bg-zinc-800/50 transition cursor-pointer"
          >
            <div className="mb-4 w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Warrior Directory</h2>
            <p className="text-zinc-400 mb-4">
              Explore the stories, philosophies, and timelines of history's greatest warriors. Learn about their lives, achievements, and wisdom.
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Browse Warriors
            </Button>
          </div>

          <div 
            onClick={() => navigate("/chat")}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 hover:bg-zinc-800/50 transition cursor-pointer"
          >
            <div className="mb-4 w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-purple-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Start a Conversation</h2>
            <p className="text-zinc-400 mb-4">
              Engage directly with multiple warriors simultaneously. Discuss strategies, leadership, victories, or seek guidance for your modern challenges.
            </p>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              Begin Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
