
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";

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
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8 text-center">
        <div className="h-28 w-full">
          <TextHoverEffect text="WELCOME" />
        </div>
        
        <div className="bg-[#111] shadow-xl rounded-lg p-8 border border-zinc-800">
          <h2 className="text-2xl font-bold mb-4 text-white">
            You've successfully accessed the application
          </h2>
          <p className="text-zinc-400 mb-8">
            This is your secure dashboard. Only users with the correct passphrase can see this page.
          </p>
          
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="mt-4 border-zinc-700 hover:bg-zinc-800"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
