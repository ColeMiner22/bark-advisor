# Bark Advisor

A web application for dog care advice and product recommendations, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Dog profile management
- Product search and recommendations
- Modern, responsive UI
- Local storage for data persistence

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your-api-key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- OpenAI API
- Local Storage for data persistence

## Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # React components
│   ├── layout/      # Layout components
│   └── ui/          # UI components
├── lib/             # Utility functions and configurations
└── types/           # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 