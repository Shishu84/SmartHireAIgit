import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { BsSend, BsRobot, BsPerson, BsTrash, BsLightbulb } from 'react-icons/bs';
import axios from 'axios';
import { ServerUrl } from '../App';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const AiChat = () => {
    const { userData } = useSelector((state) => state.user);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [reasoningTerm, setReasoningTerm] = useState("Analyzing intent");
    const messagesEndRef = useRef(null);

    const reasoningTerms = [
        "Analyzing career goals",
        "Retrieving resume context",
        "Evaluating interview history",
        "Optimizing roadmap",
        "Reasoning about skills",
        "Synthesizing guidance"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        let interval;
        if (isTyping) {
            interval = setInterval(() => {
                setReasoningTerm(reasoningTerms[Math.floor(Math.random() * reasoningTerms.length)]);
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [isTyping]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${ServerUrl}/api/chat/history`, { withCredentials: true });
                setMessages(res.data.messages || []);
            } catch (error) {
                console.error("Failed to fetch chat history", error);
            }
        };
        if (userData) {
            fetchHistory();
        }
    }, [userData]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setIsTyping(true);

        try {
            const response = await fetch(`${ServerUrl}/api/chat/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage.content }),
                credentials: 'include',
            });

            if (!response.ok) throw new Error("Failed to connect to AI engine");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
            
            let accumulatedContent = "";
            let buffer = "";
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                
                let newlineIndex;
                while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
                    const line = buffer.slice(0, newlineIndex).trim();
                    buffer = buffer.slice(newlineIndex + 1);

                    if (line.startsWith("data: ")) {
                        const dataStr = line.slice(6);
                        if (dataStr === "[DONE]") continue;

                        try {
                            const data = JSON.parse(dataStr);
                            if (data.chunk) {
                                accumulatedContent += data.chunk;
                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    newMessages[newMessages.length - 1].content = accumulatedContent;
                                    return newMessages;
                                });
                            }
                        } catch (e) { }
                    }
                }
            }
        } catch (error) {
            console.error("Streaming error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Error: Could not reach the intelligence engine." }]);
        } finally {
            setIsLoading(false);
            setIsTyping(false);
        }
    };

    const clearChat = async () => {
        if (window.confirm("Are you sure you want to clear your chat history?")) {
            try {
                await axios.delete(`${ServerUrl}/api/chat/clear`, { withCredentials: true });
                setMessages([]);
            } catch (error) {
                console.error("Failed to clear chat", error);
            }
        }
    };

    const suggestions = [
        "Analyze my last 3 interviews and suggest improvements.",
        "Generate a 6-month career roadmap for a Senior Frontend role.",
        "Draft a cold email for a Software Engineer position at Google.",
        "Explain the CAP theorem with a real-world example."
    ];

    return (
        <div className="min-h-screen bg-[#f3f3f3] flex flex-col">
            
            <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-4 md:p-6 overflow-hidden">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 flex flex-col h-[75vh] md:h-[80vh] overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                        <div className="flex items-center gap-3">
                            <div className="bg-black text-white p-2 rounded-xl">
                                <BsRobot size={20} />
                            </div>
                            <div>
                                <h2 className="font-semibold text-lg leading-tight">Career Intelligence Mentor</h2>
                                <p className="text-xs text-green-500 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    Context-Aware Engine Active
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={clearChat}
                            className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-gray-50"
                            title="Clear Chat"
                        >
                            <BsTrash size={18} />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide">
                        {messages.length === 0 && !isLoading && (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                <motion.div 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="bg-gray-100 p-6 rounded-full mb-6"
                                >
                                    <BsRobot size={48} className="text-black" />
                                </motion.div>
                                <h3 className="text-xl font-semibold mb-2">Welcome to SmartHire Intelligence</h3>
                                <p className="text-gray-500 max-w-md mb-8 text-sm">
                                    I use memory and reasoning to help you advance your career. Ask me for roadmaps, interview analysis, or technical tutoring.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                                    {suggestions.map((s, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => setInput(s)}
                                            className="text-sm text-left p-4 bg-white border border-gray-100 rounded-2xl hover:border-black transition-all hover:shadow-sm flex items-start gap-3 group"
                                        >
                                            <BsLightbulb className="text-yellow-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600 group-hover:text-black">{s}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <AnimatePresence>
                            {messages.map((msg, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-3 max-w-[85%] md:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-1 ${msg.role === 'user' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
                                            {msg.role === 'user' ? <BsPerson size={16} /> : <BsRobot size={16} />}
                                        </div>
                                        <div className={`p-4 rounded-2xl shadow-sm ${
                                            msg.role === 'user' 
                                            ? 'bg-black text-white rounded-tr-none' 
                                            : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-none'
                                        }`}>
                                            <div className="text-sm md:text-md leading-relaxed prose prose-sm max-w-none prose-slate">
                                                <ReactMarkdown 
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        code({node, inline, className, children, ...props}) {
                                                            const match = /language-(\w+)/.exec(className || '')
                                                            return !inline && match ? (
                                                                <SyntaxHighlighter
                                                                    style={vscDarkPlus}
                                                                    language={match[1]}
                                                                    PreTag="div"
                                                                    {...props}
                                                                >
                                                                    {String(children).replace(/\n$/, '')}
                                                                </SyntaxHighlighter>
                                                            ) : (
                                                                <code className={className} {...props}>
                                                                    {children}
                                                                </code>
                                                            )
                                                        }
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="flex gap-3 max-w-[85%]">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-600">
                                        <BsRobot size={16} />
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                            </div>
                                            <span className="text-xs text-gray-400 italic">{reasoningTerm}...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask anything about your career..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 pr-16 focus:border-black outline-none transition-all shadow-sm"
                                disabled={isLoading}
                            />
                            <button 
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white p-3 rounded-xl hover:bg-gray-800 disabled:bg-gray-200 transition-all"
                            >
                                <BsSend size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiChat;
