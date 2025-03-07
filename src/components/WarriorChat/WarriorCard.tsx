import { useNavigate } from "react-router-dom";
import { Warrior } from "@/data/warriors";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WarriorCardProps {
  warrior: Warrior;
  isSelected?: boolean;
  onSelect?: (warrior: Warrior) => void;
  selectionMode?: boolean;
}

export const WarriorCard = ({ 
  warrior, 
  isSelected = false, 
  onSelect,
  selectionMode = false
}: WarriorCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (selectionMode && onSelect) {
      onSelect(warrior);
    } else {
      navigate(`/warrior/${warrior.id}`);
    }
  };

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click from firing
    navigate(`/warrior/${warrior.id}`);
  };

  return (
    <Card 
      className={`w-full cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg ${
        isSelected 
          ? `border-2 border-${warrior.color} shadow-md` 
          : 'border-zinc-800 hover:border-zinc-700'
      }`}
      onClick={handleCardClick}
    >
      <div 
        className="h-32 bg-cover bg-center" 
        style={{ 
          backgroundImage: `url(${warrior.imageUrl})`,
          backgroundColor: `${isSelected ? warrior.color : '#1c1c1c'}`
        }}
      />
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xl text-white">{warrior.name}</CardTitle>
        <CardDescription className="text-zinc-400">
          {warrior.shortDesc}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap gap-1 mb-2">
          <Badge variant="outline" className="bg-zinc-900 text-zinc-400">
            {warrior.era}
          </Badge>
          <Badge variant="outline" className="bg-zinc-900 text-zinc-400">
            {warrior.region}
          </Badge>
        </div>
        <p className="text-sm text-zinc-500">
          <span className="font-medium">Specialty:</span> {warrior.specialty}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        {selectionMode ? (
          <div className="flex w-full gap-2">
            <Button 
              variant={isSelected ? "default" : "outline"} 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                if (onSelect) onSelect(warrior);
              }}
              className={isSelected ? "" : "border-zinc-700 text-zinc-300"}
            >
              {isSelected ? "Selected" : "Select"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleViewProfile}
              className="ml-auto border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            >
              View Timeline
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            className="border-zinc-700 text-zinc-300"
          >
            View Profile
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}; 