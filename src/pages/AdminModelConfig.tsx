import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModelConfig } from "@/components/Admin/ModelConfig";
import { GemmaTest } from "@/components/Admin/GemmaTest";
import { isAdminMode } from "@/services/modelConfig";

const AdminModelConfigPage = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("authenticated") === "true";
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    
    // Check admin mode - but don't redirect if not in admin mode
    setAuthenticated(isAdminMode());
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">RFLKT Admin</h1>
          
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="border-zinc-700 hover:bg-zinc-800"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#111] shadow-xl rounded-lg p-6 border border-zinc-800">
            <h2 className="text-2xl font-bold mb-4 text-white">
              Model Configuration
            </h2>
            
            {!authenticated && (
              <div className="bg-zinc-800/50 p-4 rounded-lg mb-6">
                <p className="text-zinc-300 mb-2">
                  To access the admin configuration, enter the admin password below.
                </p>
                <p className="text-zinc-400 text-sm">
                  Default password: <code className="bg-zinc-700 px-1 py-0.5 rounded">rflkt-admin</code>
                </p>
              </div>
            )}
            
            {/* Pass setAuthenticated callback to update state when login is successful */}
            <ModelConfig 
              modal={false} 
              onAuthSuccess={() => setAuthenticated(true)}
            />
          </div>
          
          {authenticated && (
            <div className="bg-[#111] shadow-xl rounded-lg p-6 border border-zinc-800">
              <h2 className="text-2xl font-bold mb-4 text-white">
                Test Gemma Integration
              </h2>
              <p className="text-zinc-400 mb-6">
                Use this direct testing tool to verify the Gemma API integration is working correctly.
              </p>
              
              <GemmaTest />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminModelConfigPage; 