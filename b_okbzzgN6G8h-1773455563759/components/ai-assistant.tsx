"use client";

import { useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
}

const suggestions = [
  "كيف أضيف نص؟",
  "أريد تصميم بطاقة أعمال",
  "ما هي الأشكال المتاحة؟",
  "كيف أرفع صورة؟",
];

const botResponses: Record<string, string> = {
  "كيف أضيف نص؟": "اضغط على أيقونة 'إضافة نص' في الشريط الجانبي، ثم اكتب النص واختر اللون المناسب، وأخيراً اضغط 'إضافة النص' لإضافته للوحة التصميم.",
  "أريد تصميم بطاقة أعمال": "اضغط على 'قوالب جاهزة' واختر 'بطاقة أعمال'. سيتم إضافة إطار بالحجم المناسب يمكنك تعديله وإضافة النصوص والصور عليه.",
  "ما هي الأشكال المتاحة؟": "لدينا أربعة أشكال هندسية: المستطيل، الدائرة، المثلث، والنجمة. يمكنك اختيار اللون المناسب لكل شكل.",
  "كيف أرفع صورة؟": "اضغط على أيقونة 'رفع صورة' في الشريط الجانبي، ثم اختر الصورة من جهازك. سيتم إضافتها مباشرة للوحة التصميم.",
};

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "مرحباً! أنا مساعد سعود الذكي 🎨 كيف يمكنني مساعدتك في التصميم اليوم؟",
      isBot: true,
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      isBot: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot response
    setTimeout(() => {
      const response = botResponses[text] || 
        "شكراً لسؤالك! يمكنك استكشاف الأدوات في الشريط الجانبي. إذا احتجت مساعدة محددة، لا تتردد في السؤال! 😊";
      
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: response,
        isBot: true,
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 500);
  };

  return (
    <>
      {/* Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 group"
      >
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-primary/50 rounded-full blur-xl animate-pulse" />
          
          {/* Button */}
          <div className="relative flex items-center gap-2 bg-gradient-to-r from-primary to-accent px-4 py-3 rounded-full shadow-lg shadow-primary/30 transition-transform hover:scale-105">
            {isOpen ? (
              <X className="h-5 w-5 text-primary-foreground" />
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-primary-foreground" />
                <span className="text-sm font-medium text-primary-foreground hidden md:inline">
                  مساعد سعود الذكي
                </span>
                <MessageCircle className="h-5 w-5 text-primary-foreground md:hidden" />
              </>
            )}
          </div>
        </div>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 z-50 w-80 md:w-96 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl shadow-primary/10 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">مساعد سعود الذكي</h3>
                  <p className="text-xs text-muted-foreground">متصل الآن</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                      message.isBot
                        ? "bg-secondary/60 text-foreground rounded-tr-none"
                        : "bg-primary text-primary-foreground rounded-tl-none"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Suggestions */}
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 2).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(suggestion)}
                    className="text-xs px-3 py-1.5 rounded-full bg-secondary/40 text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border/50">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend(inputValue)}
                  placeholder="اكتب رسالتك..."
                  className="flex-1 bg-secondary/40 border-border/30 text-foreground"
                  dir="rtl"
                />
                <Button
                  onClick={() => handleSend(inputValue)}
                  size="icon"
                  className="bg-primary hover:bg-primary/80"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
