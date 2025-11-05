"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { MessageCircle, X, Send, Loader } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "assistant"
  timestamp: Date
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your DrvynGRM AI Assistant. I can help you with bookings, invoices, customer management, and more. What can I help you with today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate AI response with context-aware suggestions
    setTimeout(() => {
      let assistantResponse = ""

      const lowerInput = inputValue.toLowerCase()

      if (lowerInput.includes("booking") || lowerInput.includes("appointment")) {
        assistantResponse =
          "I can help you manage bookings! You can create new bookings, view upcoming appointments, or modify existing ones. Would you like to create a new booking or view your current schedule?"
      } else if (lowerInput.includes("invoice") || lowerInput.includes("payment")) {
        assistantResponse =
          "For invoicing, I can help you create invoices from job cards, track payment status, or generate reports. What would you like to do with your invoices?"
      } else if (lowerInput.includes("customer")) {
        assistantResponse =
          "I can assist with customer management. You can add new customers, view customer history, or manage customer information. What customer task would you like help with?"
      } else if (lowerInput.includes("parts") || lowerInput.includes("inventory")) {
        assistantResponse =
          "For parts management, I can help you track inventory, check stock levels, or alert you about low stock items. Would you like to check your current inventory?"
      } else if (lowerInput.includes("report") || lowerInput.includes("analytics")) {
        assistantResponse =
          "I can help you understand your business metrics! I can show you revenue trends, customer growth, service breakdown, and performance KPIs. What metrics are you interested in?"
      } else if (lowerInput.includes("job") || lowerInput.includes("service")) {
        assistantResponse =
          "I can help with job card management. You can create job cards from bookings, track progress, and manage service details. What would you like to do?"
      } else if (lowerInput.includes("help") || lowerInput.includes("how")) {
        assistantResponse =
          "I'm here to help! I can assist with:\n• Booking management\n• Invoice creation and tracking\n• Customer management\n• Parts inventory\n• Job card tracking\n• Business analytics\n\nWhat would you like help with?"
      } else {
        assistantResponse =
          "I understand you're asking about: " +
          inputValue +
          "\n\nI can help with booking management, invoicing, customer data, parts inventory, job tracking, and business reports. Feel free to ask me anything related to your garage operations!"
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: assistantResponse,
        sender: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 800)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-40"
          aria-label="Open AI Assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl flex flex-col z-50 bg-card border-border">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex items-center justify-between">
            <div>
              <h3 className="font-semibold">DrvynGRM AI Assistant</h3>
              <p className="text-xs opacity-90">Always here to help</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-primary/80 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground px-4 py-2 rounded-lg rounded-bl-none flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-4 bg-card rounded-b-lg">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
