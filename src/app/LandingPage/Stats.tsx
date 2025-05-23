import { Card, CardContent } from "@/components/ui/Card";

const Stats = () => {
  const stats = [
    {
      figure: "1500+",
      label: "Event Attendees"
    },
    {
      figure: "50+",
      label: "Events Organized"
    },
    {
      figure: "95%",
      label: "Satisfaction Rate"
    },
    {
      figure: "RWF 5B+",
      label: "Investments Facilitated"
    }
  ];

  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-none shadow-md bg-gradient-to-br from-white to-gray-50">
              <CardContent className="flex flex-col items-center justify-center p-4 py-8">
                <div className="text-3xl md:text-4xl font-bold text-[#DDD043] mb-2">{stat.figure}</div>
                <div className="text-gray-600 text-center">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;