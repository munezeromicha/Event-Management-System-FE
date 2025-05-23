import { Button } from "@/components/ui/Button";
import Link from "next/link";

const CallToAction = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-rnit-blue to-rnit-light-blue text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to enhance your investment journey?</h2>
          <p className="text-xl mb-8 text-[#232560]">
            Join our upcoming events to learn, network, and discover new investment opportunities in Rwanda.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-[#094AB9] text-white hover:bg-blue-60 px-8 cursor-pointer">
              <Link href="/events">View All Events</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;