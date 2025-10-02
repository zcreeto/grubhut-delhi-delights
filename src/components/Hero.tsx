import { Button } from '@/components/ui/button';
import heroBanner from '@/assets/hero-banner.jpg';
import { ArrowRight } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroBanner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center animate-fade-in-up">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
          Authentic South Indian
          <span className="block bg-gradient-warm bg-clip-text text-transparent mt-2">
            Delivered to Your Doorstep
          </span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
          Experience the rich flavors of South India in Gurugram. Specializing in Hyderabadi & Kolkata Biryani.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#menu">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-glow">
              Explore Menu
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
          <a href="#biryanis">
            <Button size="lg" variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20">
              Our Biryanis
            </Button>
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
        </div>
      </div>
    </section>
  );
};
