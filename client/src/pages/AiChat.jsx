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
import logo from '../assets/logo.png';

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
        <div className="flex flex-col w-full bg-gray-50 dark:bg-slate-950 transition-colors duration-300" style={{ height: "calc(100dvh - 80px)" }}>
            <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-2 md:p-6 overflow-hidden">
                <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-sm border border-gray-200 dark:border-slate-800 flex flex-col h-full overflow-hidden transition-colors">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10 transition-colors">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="SmartHire.AI Logo" className="w-10 h-10 rounded-xl object-cover shadow-sm bg-white" />
                            <div>
                                <h2 className="font-semibold text-lg leading-tight text-gray-900 dark:text-white">Career Intelligence Mentor</h2>
                                <p className="text-xs text-purple-500 dark:text-purple-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>
                                    Context-Aware Engine Active
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={clearChat}
                            className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800"
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
                                    className="mb-6"
                                >
                                    <img src={logo} alt="SmartHire.AI Logo" className="w-24 h-24 rounded-2xl object-cover shadow-md bg-white p-2" />
                                </motion.div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Welcome to SmartHire Intelligence</h3>
                                <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 text-sm">
                                    I use memory and reasoning to help you advance your career. Ask me for roadmaps, interview analysis, or technical tutoring.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                                    {suggestions.map((s, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => setInput(s)}
                                            className="text-sm text-left p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl hover:border-black dark:hover:border-purple-500 transition-all hover:shadow-sm flex items-start gap-3 group"
                                        >
                                            <BsLightbulb className="text-yellow-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-600 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white">{s}</span>
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
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-1 overflow-hidden shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-white'}`}>
                                            {msg.role === 'user' ? <BsPerson size={16} /> : <img src={logo} alt="AI" className="w-full h-full object-cover p-1" />}
                                        </div>
                                        <div className={`p-4 rounded-2xl shadow-sm ${
                                            msg.role === 'user' 
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-tr-none' 
                                            : 'bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-slate-700 rounded-tl-none'
                                        }`}>
                                            <div className="text-sm md:text-md leading-relaxed prose prose-sm max-w-none prose-slate dark:prose-invert">
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
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                                        <img src={logo} alt="AI" className="w-full h-full object-cover p-1" />
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-slate-700 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></span>
                                                <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                                <span className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                            </div>
                                            <span className="text-xs text-gray-400 dark:text-gray-500 italic">{reasoningTerm}...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 transition-colors">
                        <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
                            <input 
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask anything about your career..."
                                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-6 py-4 pr-16 focus:border-purple-500 dark:focus:border-purple-500 outline-none transition-all shadow-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                                disabled={isLoading}
                            />
                            <button 
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl hover:opacity-90 disabled:opacity-40 dark:disabled:bg-slate-700 transition-all"
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
