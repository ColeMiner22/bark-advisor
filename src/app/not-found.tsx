import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/" 
          className="btn-primary inline-block hover-lift hover-glow"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
} 