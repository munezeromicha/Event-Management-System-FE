import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import event_2 from '../../../public/images/event_2.jpg';

const Hero = () => {
  return (
    <section className="bg-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-center">
          <div className="lg:w-1/2 mb-10 lg:mb-0 animate-fade-in mt-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Discover <span className="text-[#094BBA]">RNIT</span> <span className="text-[#DDD043]">Events</span>
            </h1>
            <p className="text-lg text-gray-700 mb-8 max-w-lg">
              Join Rwanda National Investment Trust Ltd (RNIT) at our exclusive events designed to 
              empower Rwandans through investment opportunities and financial literacy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="bg-rnit-blue hover:bg-rnit-light-blue text-white px-8 py-6 text-lg">
                Explore Events
              </Button>
              <Button variant="outline" className="border-rnit-gold text-rnit-gold hover:bg-rnit-gold hover:text-white px-8 py-6 text-lg">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative animate-fade-in mt-6">
            <div className="relative z-10">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <Image 
                  src={event_2} 
                  alt="RNIT Investment Seminar" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-rnit-blue/30 to-transparent"></div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-rnit-light-gold/20 rounded-full blur-2xl -z-10"></div>
            <div className="absolute -top-6 -left-6 w-48 h-48 bg-rnit-light-blue/20 rounded-full blur-2xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;