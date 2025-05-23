import { Calendar, MapPin, Users, Info, DollarSign } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface EventCardProps {
  eventId: string;
  name: string;
  eventType: string;
  dateTime: string;
  location: string;
  description: string;
  maxCapacity: number;
  financialSupportOption: boolean;
  onRegister: (eventId: string) => void;
}

const EventCard = ({ 
  eventId, 
  name, 
  eventType, 
  dateTime, 
  location, 
  description, 
  maxCapacity, 
  financialSupportOption, 
  onRegister 
}: EventCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg hover:border-rnit-light-blue group">
      <div className="h-2 bg-gradient-to-r from-rnit-blue to-rnit-light-blue"></div>
      
      <CardHeader className="pb-3">
        <Badge className="w-fit mb-2 bg-[#232560]">
          {eventType}
        </Badge>
        <h3 className="text-xl font-bold tracking-tight text-[#232560]">{name}</h3>
      </CardHeader>
      
      <CardContent className="space-y-3 pb-4">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-2 text-rnit-blue" />
          <span>{formatDate(dateTime)}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="h-4 w-4 mr-2 text-rnit-blue flex-shrink-0" />
          <span>{location}</span>
        </div>
        
        <div className="flex items-start text-sm text-gray-500">
          <Info className="h-4 w-4 mr-2 text-rnit-blue flex-shrink-0 mt-0.5" />
          <p className="line-clamp-2">{description}</p>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <Users className="h-4 w-4 mr-2 text-rnit-blue" />
          <span>Capacity: {maxCapacity}</span>
        </div>

        {financialSupportOption && (
          <div className="flex items-center text-sm text-green-600">
            <DollarSign className="h-4 w-4 mr-2" />
            <span>Financial Support Available</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={() => onRegister(eventId)} 
          className="w-full bg-[#094AB9] hover:bg-rnit-light-blue text-white cursor-pointer"
        >
          Register Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;