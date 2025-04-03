/**
 * KautilyaAI - AI Legal Assistant API Route
 * 
 * This API route handles communication with the Google Gemini API for the KautilyaAI legal assistant.
 * It processes user messages, determines if they are legal questions, and formats interactions
 * with the Gemini model to ensure proper context and response handling.
 * 
 * The route includes:
 * - Rate limit detection and handling
 * - Legal question validation
 * - System prompt incorporation via chat history
 * - Streaming response capabilities
 * 
 * @module api/chat
 */

import { GoogleGenerativeAI } from "@google/generative-ai"

export const maxDuration = 30

/**
 * Interface representing a chat message
 */
interface ChatMessage {
  id: string;
  role: string;
  content: string;
}

/**
 * Validates if a message is likely a legal question based on keywords
 * 
 * @param text - The text to analyze
 * @returns boolean - True if the text contains legal keywords
 */
function isLegalQuestion(text: string): boolean {
  const legalKeywords = [
    'law', 'legal', 'right', 'rights', 'court', 'judge', 'attorney', 'lawyer', 'lawsuit',
    'contract', 'agreement', 'breach', 'liability', 'tort', 'compensation', 'damages',
    'crime', 'criminal', 'offense', 'prosecution', 'defendant', 'plaintiff', 'sue', 'sued',
    'divorce', 'custody', 'property', 'estate', 'will', 'testament', 'inheritance',
    'tenant', 'landlord', 'lease', 'eviction', 'employment', 'discrimination',
    'patent', 'copyright', 'trademark', 'intellectual property', 'settlement',
    'regulation', 'statute', 'legislation', 'constitution', 'jurisdiction',
    'insurance', 'claim', 'dispute', 'arbitration', 'mediation', 'license',
    'debt', 'bankruptcy', 'tax', 'immigration', 'visa', 'citizenship'
  ];

  // Convert to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  
  // Check if any legal keyword is present
  return legalKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * POST handler for the chat API
 * Processes user messages and returns AI responses
 * 
 * @param req - The incoming request with chat messages
 * @returns Response - Streaming response from the AI
 */
export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    // Initialize the Gemini API with the API key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    // Find the most recent user message
    const lastUserMessageIndex = [...messages].reverse().findIndex((msg: ChatMessage) => msg.role === "user")
    
    if (lastUserMessageIndex === -1) {
      throw new Error("No user message found")
    }
    
    // Get the last user message (from the end of the array)
    const lastUserMessage = messages[messages.length - 1 - lastUserMessageIndex]
    
    // Check if it's a legal question - but we'll let the model handle all questions
    const isLegal = isLegalQuestion(lastUserMessage.content)

    // Simplified system message - more compatible with Gemini API
    const systemPromptText = "You are KautilyaAI, an AI legal assistant. Provide general legal information only, not specific advice. Always recommend consulting a qualified attorney for specific matters. For non-legal questions, respond with: 'I'm KautilyaAI, a legal advisor focused exclusively on providing general legal information. I cannot answer questions outside the legal domain.'";

    // Empty chat history to start with
    let chatHistory = []
    
    // Start history with a system message (as a model message)
    chatHistory.push({
      role: "user",
      parts: [{ text: "You are KautilyaAI, an AI legal assistant. Please acknowledge your role." }]
    });
    
    chatHistory.push({
      role: "model",
      parts: [{ text: systemPromptText }]
    });
    
    // Only process previous messages if we have more than one
    if (messages.length > 1) {
      // Find message pairs and create valid Gemini history
      // Gemini requires chat history to start with a user message
      
      // First, filter to find only user messages that aren't the most recent one
      const userMessages = messages
        .filter((msg: ChatMessage) => msg.role === "user" && msg.id !== lastUserMessage.id)
      
      // For each user message, try to find the corresponding assistant response
      for (const userMsg of userMessages) {
        // Find the index of this user message
        const userIndex = messages.findIndex((m: ChatMessage) => m.id === userMsg.id)
        
        // Add user message to history
        chatHistory.push({
          role: "user",
          parts: [{ text: userMsg.content }]
        })
        
        // Check if there's an assistant response right after this user message
        if (userIndex + 1 < messages.length && messages[userIndex + 1].role === "assistant") {
          chatHistory.push({
            role: "model",
            parts: [{ text: messages[userIndex + 1].content }]
          })
        }
      }
    }
    
    // For debugging
    console.log("Chat history:", JSON.stringify(chatHistory))
    console.log("Last user message:", lastUserMessage.content)
    console.log("Is legal question:", isLegal)
    
    // Create a chat session with properly formatted history
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      }
    })

    // Send the message and get the streaming response
    const result = await chat.sendMessageStream(lastUserMessage.content)

    // Create a readable stream that the AI library can consume
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }
          controller.close()
        } catch (error: any) {
          console.error("Error in stream processing:", error)
          controller.error(error)
        }
      }
    })

    // Return the streaming response using the ai library's helper
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    })
    
  } catch (error: any) {
    console.error("Error processing chat:", error)
    
    // Handle rate limit errors specifically
    if (error.status === 429 || (error.message && error.message.includes("429"))) {
      // Extract retry delay if available
      let retrySeconds = 60 // Default to 60 seconds
      try {
        // Try to parse the retry delay from the error message
        const retryDelayMatch = error.message.match(/retryDelay":"(\d+)s/)
        if (retryDelayMatch && retryDelayMatch[1]) {
          retrySeconds = parseInt(retryDelayMatch[1], 10)
        }
      } catch (e) {
        console.error("Error parsing retry delay:", e)
      }
      
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded",
          message: `Google AI API rate limit reached. Please try again in ${retrySeconds} seconds. The free tier of Gemini API has strict rate limits.`,
          retryAfter: retrySeconds
        }),
        {
          status: 429,
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': retrySeconds.toString()
          }
        }
      )
    }
    
    // Return a generic error response for other errors
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process chat request" }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

