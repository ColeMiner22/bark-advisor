import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-float">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Your Dog's Best Friend
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Find the perfect products and get expert advice for your furry companion
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search" className="btn-primary">
              Find Products
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose Bark Advisor?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card group">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Expert Reviews</h3>
              <p className="text-gray-600">Get detailed insights from dog care professionals and experienced pet owners.</p>
            </div>
            <div className="card group">
              <div className="h-12 w-12 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="h-6 w-6 text-accent" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-7-2h2v-4h4v-2h-4V7h-2v4H8v2h4z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Personalized Recommendations</h3>
              <p className="text-gray-600">Get tailored product suggestions based on your dog's unique needs and preferences.</p>
            </div>
            <div className="card group">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="h-6 w-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Price Tracking</h3>
              <p className="text-gray-600">Monitor price changes and get alerts when your favorite products go on sale.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 