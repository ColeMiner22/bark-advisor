import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              <span className="gradient-text">Bark Advisor</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 animate-fade-in delay-200">
              Get personalized product recommendations for your furry friend
            </p>
            <div className="flex justify-center animate-fade-in delay-300">
              <Link href="/search" className="btn-primary hover-lift hover-glow">
                Search Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="section-title animate-fade-in">How It Works</h2>
          <div className="divider animate-fade-in delay-200" />
          <p className="section-subtitle animate-fade-in delay-300">
            Get personalized recommendations in two simple steps
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="card animate-slide-in-left delay-400 hover-lift">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl">🐾</span>
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Enter Dog Info</h3>
              <p className="text-gray-600 text-center">
                Tell us about your dog's breed, age, and preferences
              </p>
            </div>
            
            <div className="card animate-slide-in-right delay-500 hover-lift">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">Get Recommendations</h3>
              <p className="text-gray-600 text-center">
                Receive personalized suggestions based on your dog's profile
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <h2 className="section-title animate-fade-in">Why Choose Bark Advisor</h2>
          <div className="divider animate-fade-in delay-200" />
          <p className="section-subtitle animate-fade-in delay-300">
            Making pet care decisions easier and more informed
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            <div className="glass-card animate-zoom-in delay-400 hover-lift hover-glow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Personalized</h3>
              <p className="text-gray-600">
                Tailored recommendations based on your dog's unique needs
              </p>
            </div>
            
            <div className="glass-card animate-zoom-in delay-500 hover-lift hover-glow">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
              <p className="text-gray-600">
                Advanced algorithms for accurate product analysis
              </p>
            </div>
            
            <div className="glass-card animate-zoom-in delay-600 hover-lift hover-glow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Detailed Scoring</h3>
              <p className="text-gray-600">
                Comprehensive analysis of product suitability
              </p>
            </div>
            
            <div className="glass-card animate-zoom-in delay-700 hover-lift hover-glow">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Time-Saving</h3>
              <p className="text-gray-600">
                Quick and easy way to find the perfect products
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 animate-fade-in">
            Ready to Find the Perfect Products?
          </h2>
          <p className="text-xl text-gray-600 mb-8 animate-fade-in delay-200">
            Start searching for the best products for your dog today
          </p>
          <Link 
            href="/search" 
            className="btn-primary inline-block animate-fade-in delay-300 hover-lift hover-glow hover-pulse"
          >
            Search Products
          </Link>
        </div>
      </section>
    </main>
  );
} 