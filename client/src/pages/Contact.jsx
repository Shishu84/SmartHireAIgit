import React, { useState } from 'react';
import axios from 'axios';
import { ServerUrl } from '../App';
import { FaEnvelope, FaMapMarkerAlt, FaClock, FaPaperPlane, FaLinkedin, FaGithub, FaTwitter, FaGlobe, FaChevronDown, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

function Contact() {
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        category: 'General Inquiry',
        subject: '',
        message: ''
    });

    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null); // { type: 'success'|'error', text: '' }

    // Dropdown Categories
    const categories = [
        "Technical Support",
        "Billing Support",
        "Enterprise Inquiry",
        "Partnership",
        "General Inquiry"
    ];

    // FAQ List
    const faqs = [
        {
            q: "How does the AI mock interview work?",
            a: "Our AI systems evaluate your voice and code responses dynamically using large language model prompts. You are assessed on correctness, confidence, structure, and communication pacing."
        },
        {
            q: "How is the ATS compatibility score calculated?",
            a: "Our parsing pipeline runs deep contextual diagnostics over your uploaded resume text. It checks formatting readability, stack keyword mapping, role experience levels, and outputs a compatibility rating out of 100%."
        },
        {
            q: "Can I download my diagnostic feedback reports?",
            a: "Yes! Every single mock interview round and resume analysis is saved directly under your dashboard. You can click 'Download PDF' at any time to generate a premium branded PDF career report."
        },
        {
            q: "Is there monitored pricing or bulk assessment pricing?",
            a: "Yes, we support enterprise preparation bundles. Navigate to our Pricing menu or select 'Enterprise Inquiry' in the contact dropdown form above to reach out directly."
        }
    ];

    const [activeFaq, setActiveFaq] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setNotification(null);

        // Client-side validations
        if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
            setNotification({ type: 'error', text: 'All form fields are required. Please check your submission.' });
            setLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
            setNotification({ type: 'error', text: 'Please enter a valid email address.' });
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post(`${ServerUrl}/api/contact`, formData, { withCredentials: true });
            if (res.data.success) {
                setNotification({ type: 'success', text: res.data.message });
                setFormData({
                    name: '',
                    email: '',
                    category: 'General Inquiry',
                    subject: '',
                    message: ''
                });
            }
        } catch (error) {
            console.error(error);
            const errMsg = error.response?.data?.message || 'An error occurred while submitting your contact message. Please try again.';
            setNotification({ type: 'error', text: errMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-200 transition-colors duration-300 py-16">
            <div className="max-w-7xl mx-auto px-6">
                
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
                        💡 Get In Touch
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
                        Contact Our Support Team
                    </h1>
                    <p className="max-w-xl mx-auto text-gray-500 dark:text-gray-400 font-medium">
                        Have questions about our AI interview simulator, ATS resume ratings, or need custom enterprise pricing? We're here to assist.
                    </p>
                </div>

                {/* Form & Details Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
                    
                    {/* Left Column: Form (col-span-7) */}
                    <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-8 md:p-10 rounded-3xl border border-gray-200 dark:border-slate-700/60 shadow-xs">
                        
                        {/* Dynamic Form Notifications */}
                        {notification && (
                            <div className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 text-sm font-semibold transition-all duration-300
                                ${notification.type === 'success' 
                                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300' 
                                    : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/80 text-red-800 dark:text-red-300'}`}>
                                {notification.type === 'success' ? <FaCheckCircle className="text-emerald-500 text-xl shrink-0 mt-0.5" /> : <FaTimesCircle className="text-red-500 text-xl shrink-0 mt-0.5" />}
                                <span>{notification.text}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.name} 
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition dark:text-white"
                                        placeholder="e.g. Rahul Kumar"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={formData.email} 
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition dark:text-white"
                                        placeholder="e.g. rahul@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Support Category</label>
                                    <div className="relative">
                                        <select 
                                            value={formData.category} 
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition dark:text-white appearance-none cursor-pointer font-medium"
                                        >
                                            {categories.map((cat, idx) => (
                                                <option key={idx} value={cat} className="dark:bg-slate-800">{cat}</option>
                                            ))}
                                        </select>
                                        <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Subject</label>
                                    <input 
                                        type="text" 
                                        value={formData.subject} 
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition dark:text-white"
                                        placeholder="Subject of inquiry"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Message Details</label>
                                <textarea 
                                    value={formData.message} 
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition dark:text-white h-40 resize-none"
                                    placeholder="Write your message here..."
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-md disabled:opacity-75 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="animate-spin text-lg" /> Dispatching...
                                    </>
                                ) : (
                                    <>
                                        <FaPaperPlane /> Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Right Column: Contact Details (col-span-5) */}
                    <div className="lg:col-span-5 flex flex-col justify-between gap-8">
                        
                        {/* Info cards */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700/60 shadow-xs flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                    <FaEnvelope className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Email Communications</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">support@smarthireai.com</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">Enterprise support: biz@smarthireai.com</p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700/60 shadow-xs flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                    <FaClock className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Active Support Timings</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monday - Friday: 9:00 AM - 6:00 PM EST</p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">Average Response: Under 12 Hours</p>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700/60 shadow-xs flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                    <FaMapMarkerAlt className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">Headquarters</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">100 Tech Venture Way, Suite 400</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">San Francisco, CA 94107</p>
                                </div>
                            </div>
                        </div>

                        {/* Social Links Block */}
                        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-gray-200 dark:border-slate-700/60 shadow-xs">
                            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white mb-4 text-center lg:text-left">
                                Join Our Career Community
                            </h3>
                            <div className="flex items-center justify-center lg:justify-start gap-4">
                                {[
                                    { icon: <FaLinkedin />, href: "https://linkedin.com/company/smarthireai" },
                                    { icon: <FaGithub />, href: "https://github.com/smarthireai" },
                                    { icon: <FaTwitter />, href: "https://twitter.com/smarthireai" },
                                    { icon: <FaGlobe />, href: "https://smarthireai.com" }
                                ].map((social, idx) => (
                                    <a 
                                        key={idx} 
                                        href={social.href} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 transition"
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

                {/* FAQ Section */}
                <div className="border-t border-gray-200 dark:border-slate-800 pt-16">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-10 tracking-tight">
                        Frequently Asked Questions
                    </h2>
                    <div className="max-w-4xl mx-auto space-y-4">
                        {faqs.map((faq, idx) => (
                            <div 
                                key={idx} 
                                className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700/60 shadow-xs overflow-hidden"
                            >
                                <button 
                                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                                    className="w-full text-left px-6 py-5 flex items-center justify-between font-bold text-gray-900 dark:text-white text-base sm:text-lg focus:outline-none transition"
                                >
                                    <span>{faq.q}</span>
                                    <FaChevronDown className={`text-gray-400 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180 text-emerald-500' : ''}`} />
                                </button>
                                <div className={`transition-all duration-300 overflow-hidden ${activeFaq === idx ? 'max-h-40 border-t border-gray-100 dark:border-slate-700/50' : 'max-h-0'}`}>
                                    <div className="p-6 text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
                                        {faq.a}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Contact;
