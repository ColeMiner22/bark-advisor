# Bark Advisor 🐕

A smart AI-powered platform that helps dog owners find the perfect products for their furry friends.

## Features

- 🔍 Smart product search and recommendations
- 🎯 Personalized suggestions based on your dog's profile
- 🤖 AI-powered analysis of product suitability
- 📊 Detailed product comparisons and scoring
- 🏷️ Amazon affiliate integration

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- OpenAI GPT-4
- Vercel

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/your-username/bark-advisor.git
cd bark-advisor
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
- Copy `.env.example` to `.env.local`
- Fill in your API keys and configuration values:
  - Get OpenAI API key from [OpenAI Platform](https://platform.openai.com)
  - Add your Amazon Affiliate tag

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project is configured for deployment on Vercel:

1. Push your code to GitHub
2. Import your repository in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

## Environment Variables

Required environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key
- `AMAZON_AFFILIATE_TAG`: Your Amazon Affiliate tag

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 