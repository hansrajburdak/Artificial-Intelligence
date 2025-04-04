<<<<<<< HEAD
# SadhanaAI - Daily Challenge Bot

![SadhanaAI Challenge Bot](https://img.shields.io/badge/SadhanaAI-Challenge%20Bot-green)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?logo=typescript)
![Google Gemini](https://img.shields.io/badge/Google-Gemini%20API-4285F4?logo=google)

SadhanaAI is an AI-powered daily challenge bot that provides personalized challenges and tasks to help improve productivity, wellness, learning, and skill development. Built with Next.js and Google's Gemini 1.5 Pro API, it features a clean, intuitive chat interface for users to request and receive daily challenges with context cards.

> ⚠️ **Disclaimer**: SadhanaAI provides AI-generated suggestions. Choose challenges that align with your abilities and interests.

## 🌟 Features

- **Intuitive Chat Interface**: Clean, user-friendly design optimized for requesting challenges
- **Real-time Streaming Responses**: See AI responses as they're generated, character by character
- **Example Prompts**: Pre-populated examples to help users get started
- **Rate Limit Handling**: Graceful handling of API rate limits with countdown timers
- **Challenge Query Detection**: Identifies challenge-related vs. non-challenge queries
- **Mobile Responsive**: Fully responsive design that works across all devices
- **Keyboard Navigation**: Submit requests using the Enter key for convenience

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
git clone https://github.com/ArindamHore-Student/SadhanaAI.git
cd SadhanaAI
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
SadhanaAI/
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   │   └── chat/           # Chat API endpoint
│   ├── components/         # UI components
│   │   └── page.tsx        # Main chat interface
│   └── layout.tsx          # App layout
├── components/             # Shared components
│   ├── ui/                 # UI components
│   └── theme-provider.tsx  # Theme provider
├── lib/                    # Utility functions
├── public/                 # Static assets
└── ...                     # Config files
```

## 🤖 How It Works

1. **User Input**: User enters a challenge request in the chat interface
2. **API Request**: The request is sent to the API route
3. **Gemini Processing**: Google's Gemini 1.5 Pro model processes the request with challenge context
4. **Streaming Response**: The response is streamed back to the UI in real-time
5. **Display**: The challenge appears in the chat interface as context cards

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
- Challenge query validation
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
=======
# Artificial-Intelligence
Daily Challenge Bot
>>>>>>> e64340d6add56ccec26a385da1a511ab29fe0095
