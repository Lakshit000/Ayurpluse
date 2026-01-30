import React, { useState, useRef, useEffect } from "react";
import {
    Sparkles,
    RotateCcw,
    Send,
    Bot,
    User
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from "framer-motion";

export default function PatientAyurGPT() {
    const [messages, setMessages] = useState([
        { role: 'bot', content: 'Namaste! I am AyurGPT, your clinical assistant.' }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);


    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput("");
        setLoading(true);

        try {
            console.log("Sending query to AyurGPT:", userMsg);
            const res = await fetch('/api/ayurgpt/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userMsg })
            });

            console.log("AyurGPT Response Status:", res.status);

            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await res.json();
                if (res.ok && data.answer) {
                    setMessages(prev => [...prev, { role: 'bot', content: data.answer }]);
                } else {
                    console.error("AyurGPT Error Data:", data);
                    setMessages(prev => [...prev, { role: 'bot', content: data.answer || "I'm having trouble retrieving that information right now." }]);
                }
            } else {
                const text = await res.text();
                console.error("AyurGPT Non-JSON Response:", text);
                setMessages(prev => [...prev, { role: 'bot', content: "Server error: Received non-JSON response. Please check backend logs." }]);
            }
        } catch (error) {
            console.error("AyurGPT Fetch Error:", error);
            setMessages(prev => [...prev, { role: 'bot', content: "Network connection error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200">
            {/* Header */}
            <div className="bg-emerald-900 p-6 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">AyurGPT</h3>
                        <p className="text-xs text-emerald-300 font-medium">Clinical Decision Support</p>
                    </div>
                </div>
                <button
                    onClick={() => setMessages([{ role: 'bot', content: 'Namaste! I am AyurGPT, your clinical assistant.' }])}
                    className="p-2 hover:bg-white/10 rounded-lg transition"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                <AnimatePresence mode="popLayout">
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-900 text-white'
                                }`}>
                                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                            </div>

                            <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                ? 'bg-emerald-600 text-white rounded-tr-none'
                                : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                                }`}>
                                {msg.role === 'bot' ? (
                                    <div className="prose prose-sm max-w-none prose-emerald">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                ) : (
                                    msg.content
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-4"
                        >
                            <div className="h-10 w-10 shrink-0 rounded-full bg-gray-900 text-white flex items-center justify-center">
                                <Bot size={20} />
                            </div>
                            <div className="bg-white rounded-2xl rounded-tl-none p-4 border border-gray-200 shadow-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200 shrink-0">
                <div className="relative max-w-4xl mx-auto">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        disabled={loading}
                        placeholder="Ask about symptoms, treatments, or medicines..."
                        className="w-full bg-gray-100 border-0 rounded-2xl px-6 py-4 pr-16 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none disabled:opacity-50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition shadow-sm"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-center mt-3">
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                        AI can make mistakes. Verify with a professional.
                    </p>
                </div>
            </div>
        </div>
    );
}
