/**
 * KautilyaAI - AI Legal Assistant
 * 
 * This React component implements a chat interface for a legal AI assistant named KautilyaAI.
 * It provides users with general legal information while clearly disclaiming that it's not
 * legal advice. The application uses Google's Gemini API to process questions and generate
 * responses.
 * 
 * Features:
 * - Real-time streaming responses
 * - Example legal questions for user guidance
 * - Rate limit handling with countdown timer
 * - Clear disclaimers about limitations of AI legal information
 * - Support for keyboard navigation (Enter to submit)
 * - Mobile-responsive design
 * 
 * @author Original implementation
 * @modified For KautilyaAI Legal Assistant
 * @license MIT
 */

"use client"

import { useRef, useEffect, useState, FormEvent, ChangeEvent, KeyboardEvent } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Scale, Send, Loader2, AlertCircle, Info } from "lucide-react"
import { v4 as uuidv4 } from 'uuid'
import { nanoid } from 'nanoid'

/**
 * Represents a chat message in the conversation
 */
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Standard legal disclaimer message
const LEGAL_DISCLAIMER = "This AI assistant provides general information only and not legal advice. Always consult with a qualified attorney for specific legal matters.";

// Non-legal response pattern to detect
const NON_LEGAL_RESPONSE = "I'm a legal advisor focused exclusively on providing general legal information. I cannot answer questions outside the legal domain.";

/**
 * Main component for the KautilyaAI Legal Assistant chat interface
 */
export default function KautilyaAILegalChat() {
  // State for storing chat messages
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello, I'm KautilyaAI, your AI legal assistant. How can I help you today? Please note that I provide general information only, not professional legal advice. Feel free to ask questions about laws, legal concepts, rights, or procedures.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryTimer, setRetryTimer] = useState<number | null>(null);
  
  // Refs for DOM manipulation
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  /**
   * Auto-scroll to the bottom when new messages are added
   */
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  /**
   * Focus input field on component mount and handle retry timer
   */
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Set up interval for retry countdown if needed
    let intervalId: NodeJS.Timeout | null = null;
    
    if (retryTimer && retryTimer > 0) {
      intervalId = setInterval(() => {
        setRetryTimer(prev => {
          if (prev && prev > 1) {
            return prev - 1;
          } else {
            // Clear error when timer completes
            setError(null);
            return null;
          }
        });
      }, 1000);
    }
    
    // Clean up interval
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [retryTimer]);

  // Examples of legal questions to help users
  const legalExamples = [
    "What are my rights as a tenant?",
    "How does copyright protection work?",
    "What's the difference between a felony and misdemeanor?",
    "How do I respond to a small claims lawsuit?",
  ];

  /**
   * Handle clicking an example question
   * @param example The example question text
   */
  const handleExampleClick = (example: string) => {
    setInput(example);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  /**
   * Handle input field changes
   * @param e Input change event
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  /**
   * Send a message to the AI and process the response
   * @param messageContent The message text to send
   */
  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;
    
    // Create a new user message
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: messageContent
    };
    
    // Update UI immediately with user message
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);
    
    try {
      // Send request to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // Check specifically for rate limit errors
        if (response.status === 429 && errorData.retryAfter) {
          const seconds = parseInt(errorData.retryAfter, 10);
          setRetryTimer(seconds);
          setError(errorData.message || `Rate limit exceeded. Please wait ${seconds} seconds before trying again.`);
          throw new Error(errorData.message || "Rate limit exceeded");
        }
        
        throw new Error(errorData.error || "Failed to get response");
      }
      
      // We now expect all responses to be text/plain from the API
      const contentType = response.headers.get("Content-Type") || "";
      
      if (contentType.includes("text/plain")) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let responseText = "";
        
        // Create a temporary assistant message
        const assistantMessage: Message = {
          id: uuidv4(),
          role: "assistant",
          content: "",
        };
        
        // Add empty assistant message that we'll update
        setMessages(prev => [...prev, assistantMessage]);
        
        // Read the stream
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              break;
            }
            
            // Decode the stream chunk and append to response
            const chunk = decoder.decode(value, { stream: true });
            responseText += chunk;
            
            // Update the assistant message with accumulated text
            setMessages(prev => 
              prev.map(msg => 
                msg.id === assistantMessage.id 
                  ? { ...msg, content: responseText } 
                  : msg
              )
            );
          }
        }
      } else {
        // Handle unexpected response
        throw new Error("Unexpected response format from server");
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      
      // If we already set a specific error message for rate limits, don't override it
      if (!retryTimer) {
        setError(err.message || "Failed to communicate with the AI");
      }
    } finally {
      setIsLoading(false);
      // Focus back on input after response
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  /**
   * Handle form submission
   * @param e Form submission event
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage(input);
  };

  /**
   * Handle key press for Enter key
   * @param e Keyboard event
   */
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  /**
   * Helper function to check if a message is a non-legal response
   * @param content The message content to check
   * @returns True if the message is a non-legal response
   */
  const isNonLegalResponse = (content: string): boolean => {
    return content.includes(NON_LEGAL_RESPONSE);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <Card className="w-full max-w-5xl h-[85vh] flex flex-col shadow-lg overflow-hidden">
        <CardHeader className="bg-slate-100 rounded-t-lg px-6 py-4">
          <div className="flex items-center">
            <Scale className="h-6 w-6 mr-3 text-slate-700" />
            <div>
              <CardTitle className="text-slate-800 text-xl">KautilyaAI</CardTitle>
              <CardDescription>Ask questions about general legal matters</CardDescription>
            </div>
          </div>
        </CardHeader>

        <div className="px-6 pt-3">
          <Alert className="bg-amber-50 border-amber-200">
            <AlertDescription className="text-amber-800 text-sm">
              {LEGAL_DISCLAIMER}
            </AlertDescription>
          </Alert>
          
          {error && (
            <Alert className="mt-2 bg-red-50 border-red-200">
              <AlertDescription className="text-red-800 text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <CardContent className="flex-grow overflow-hidden pt-4 px-6">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4 pb-2">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                      <AvatarFallback className="bg-slate-200 text-slate-700">KA</AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`rounded-lg p-3 ${
                      message.role === "user" 
                        ? "bg-slate-700 text-white max-w-[75%]" 
                        : isNonLegalResponse(message.content)
                          ? "bg-blue-50 border border-blue-200 text-slate-800 max-w-[80%]"
                          : "bg-slate-100 text-slate-800 max-w-[80%]"
                    }`}
                  >
                    {isNonLegalResponse(message.content) && (
                      <div className="flex items-center mb-2 text-blue-500">
                        <Info className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">NON-LEGAL QUERY DETECTED</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap break-words">{message.content}</div>
                  </div>

                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 ml-2 flex-shrink-0">
                      <AvatarFallback className="bg-slate-700 text-white">U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                    <AvatarFallback className="bg-slate-200 text-slate-700">KA</AvatarFallback>
                  </Avatar>
                  <div className="bg-slate-100 text-slate-800 rounded-lg p-3 flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <div className="px-6 pb-2">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-slate-500 mr-1">Try asking about:</span>
            {legalExamples.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded text-slate-700 transition-colors"
                disabled={isLoading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <CardFooter className="border-t p-6">
          <div className="w-full">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <div className="relative flex-grow">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your question here..."
                  className="w-full flex-grow py-3 px-4 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading || !!retryTimer}
                  autoFocus
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim() || !!retryTimer} 
                className="px-5 min-w-[100px] flex-shrink-0"
                size="lg"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                <span className="ml-2">{isLoading ? "Sending" : "Send"}</span>
              </Button>
            </form>
            
            {retryTimer && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                <AlertCircle size={16} className="inline-block mr-1" /> 
                Rate limit reached. You can submit again in {retryTimer} seconds.
              </div>
            )}
            
            <div className="mt-4 text-center text-xs text-gray-500">
              <div className="mb-2">
                <Info size={14} className="inline-block mr-1" />
                This app uses the <strong>Google Gemini API free tier</strong> which has rate limits.
                Expect occasional delays if usage is high.
              </div>
              
              <p>
                Note: This AI provides general legal information only, not specific advice.
                Always consult with a qualified attorney for your specific situation.
              </p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

