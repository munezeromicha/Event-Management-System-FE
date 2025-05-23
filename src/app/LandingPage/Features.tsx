import { Card, CardContent } from "@/components/ui/Card";
import { Calendar, DollarSign, Users, MapPin } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Calendar className="h-8 w-8 text-[#094BBA]" />,
      title: "Regular Events",
      description: "Join our regularly scheduled financial workshops and investment seminars."
    },
    {
      icon: <Users className="h-8 w-8 text-[#094BBA]" />,
      title: "Expert Presenters",
      description: "Learn from industry experts and seasoned investment professionals."
    },
    {
      icon: <MapPin className="h-8 w-8 text-[#094BBA]" />,
      title: "Convenient Locations",
      description: "Events held at accessible venues across Rwanda's major cities."
    },
    {
      icon: <DollarSign className="h-8 w-8 text-[#094BBA]" />,
      title: "Financial Support",
      description: "Financial assistance available for qualifying participants."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Attend RNIT Events?</h2>
          <p className="text-lg text-gray-700">
            Our events are designed to provide valuable insights and networking opportunities for both new and experienced investors.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <Card className="h-full border-none shadow-md hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="p-3 rounded-full bg-blue-50 inline-flex items-center justify-center">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;