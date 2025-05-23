import { Card, CardContent } from "@/components/ui/Card";

const Testimonials = () => {
  const testimonials = [
    {
      quote: "RNIT events have transformed my understanding of investment opportunities in Rwanda. The workshops are informative and the networking is invaluable.",
      author: "Jean Mutesi",
      role: "Small Business Owner",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
    },
    {
      quote: "The financial education I received at RNIT's investment workshop has been crucial to growing my personal wealth and planning for my family's future.",
      author: "Patrick Kamanzi",
      role: "IT Professional",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
    },
    {
      quote: "I attended my first RNIT event last year and have been to three more since. The quality of speakers and practical advice shared is exceptional.",
      author: "Marie Uwase",
      role: "University Lecturer",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Attendees Say</h2>
          <p className="text-lg text-gray-700">
            Don&apos;t just take our word for it. Hear from individuals who have benefited from attending RNIT events.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="mb-6">
                    <div className="w-20 h-20 rounded-full overflow-hidden mx-auto">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.author} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <p className="text-gray-700 italic mb-6">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;