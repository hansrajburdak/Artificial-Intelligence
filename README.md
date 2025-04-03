# KautilyaAI - AI Legal Assistant

![KautilyaAI Legal Assistant](https://img.shields.io/badge/KautilyaAI-Legal%20Assistant-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?logo=typescript)
![Google Gemini](https://img.shields.io/badge/Google-Gemini%20API-4285F4?logo=google)

KautilyaAI is an AI-powered legal assistant that provides general legal information and guidance on various legal topics. Built with Next.js and Google's Gemini 1.5 Pro API, it features a clean, intuitive chat interface for users to ask legal questions and receive informative responses.

> ⚠️ **Disclaimer**: KautilyaAI provides general legal information only, not specific legal advice. Always consult with a qualified attorney for your specific legal matters.

## 🌟 Features

- **Intuitive Chat Interface**: Clean, user-friendly design optimized for asking legal questions
- **Real-time Streaming Responses**: See AI responses as they're generated, character by character
- **Example Questions**: Pre-populated examples to help users get started
- **Rate Limit Handling**: Graceful handling of API rate limits with countdown timers
- **Legal Question Detection**: Identifies legal vs. non-legal questions
- **Mobile Responsive**: Fully responsive design that works across all devices
- **Keyboard Navigation**: Submit questions using the Enter key for convenience

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **AI**: Google Gemini 1.5 Pro API
- **Components**: Headless UI components with custom styling
- **Styling**: Tailwind CSS, Lucide icons

## 📋 Prerequisites

- Node.js 18.x or later
- Google Gemini API key

## 🛠️ Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/kautilya-legal-assistant.git
cd kautilya-legal-assistant
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

4. **Run the development server**

```bash
npm run dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🔑 Getting a Gemini API Key

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Navigate to the API section
4. Create a new API key
5. Copy the key into your `.env.local` file

## 📦 Project Structure

```
kautilya-legal-assistant/
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   │   └── chat/           # Chat API endpoint
│   ├── components/         # UI components
│   │   └── page.tsx            # Main chat interface
│   └── layout.tsx          # App layout
├── components/             # Shared components
│   ├── ui/                 # UI components
│   └── theme-provider.tsx  # Theme provider
├── lib/                    # Utility functions
├── public/                 # Static assets
└── ...                     # Config files
```

## 🤖 How It Works

1. **User Input**: User enters a legal question in the chat interface
2. **API Request**: The question is sent to the API route
3. **Gemini Processing**: Google's Gemini 1.5 Pro model processes the question with legal context
4. **Streaming Response**: The response is streamed back to the UI in real-time
5. **Display**: The response appears in the chat interface

## 🚢 Deployment

This application can be deployed on Vercel, Netlify, or any other service that supports Next.js applications:

```bash
npm run build
```

For Vercel deployment:

```bash
vercel
```

## 🧩 API Usage

The application uses Google's Gemini 1.5 Pro API to generate responses. The API route is set up to handle:

- Chat message formatting
- Legal question validation
- Rate limit handling
- Streaming responses

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Contact

If you have any questions or suggestions, please open an issue or reach out to the maintainers.

---

Built with ❤️ using Next.js and Google Gemini API 