import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';
import { FaRobot, FaBrain, FaCode, FaChartLine, FaFileAlt, FaLock, FaUsers, FaArrowRight, FaTrophy, FaLightbulb, FaBriefcase, FaGraduationCap, FaCheck, FaEye } from 'react-icons/fa';

function About() {
    const navigate = useNavigate();

    // Stats State
    const [stats, setStats] = useState([
        { count: "Loading...", label: "Resumes Analyzed" },
        { count: "Loading...", label: "Mock Interviews Conducted" },
        { count: "Loading...", label: "Coding Challenges Solved" },
        { count: "99.2%", label: "User Success Rate" }
    ]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get(`${ServerUrl}/api/contact/stats`);
                if (res.data.success) {
                    const d = res.data.data;
                    setStats([
                        { count: `${d.resumesAnalyzed}+`, label: "Resumes Analyzed" },
                        { count: `${d.interviewsConducted}+`, label: "Mock Interviews Conducted" },
                        { count: `${d.codingAssessments}+`, label: "Coding Challenges Solved" },
                        { count: `${d.candidatesSatisfied}%`, label: "User Success Rate" }
                    ]);
                }
            } catch (err) {
                console.error("Failed to load statistics:", err);
            }
        };
        fetchStats();
    }, []);

    // Core Features List
    const coreFeatures = [
        {
            icon: <FaRobot className="text-emerald-500 text-3xl" />,
            title: "AI Interview System",
            desc: "Immersive simulated mock interviews featuring dynamic, interactive AI avatars reacting to your answers in real-time."
        },
        {
            icon: <FaCode className="text-blue-500 text-3xl" />,
            title: "Coding Round Engine",
            desc: "Solve logic, algorithms, and complex systems design coding rounds with an integrated secure compiler."
        },
        {
            icon: <FaFileAlt className="text-purple-500 text-3xl" />,
            title: "ATS Resume Intelligence",
            desc: "Deep structure diagnostics parsing, score rating, and comparative compatibility matching for specific roles."
        },
        {
            icon: <FaBrain className="text-amber-500 text-3xl" />,
            title: "Real-Time AI Feedback",
            desc: "Receive actionable grading indicators based on correctness, technical expertise, and soft skills immediately."
        },
        {
            icon: <FaChartLine className="text-rose-500 text-3xl" />,
            title: "PDF Analytics Reports",
            desc: "Download elegantly generated, branded career intelligence assessments to track your preparation."
        },
        {
            icon: <FaTrophy className="text-indigo-500 text-3xl" />,
            title: "Hiring Readiness Tracking",
            desc: "Visual trend logs mapping your capability progression to target recruiter readiness score standards."
        }
    ];

    // Tech Stack List
    const technologyList = [
        { title: "LLM Orchestration", desc: "State-of-the-art OpenRouter systems mapping semantic answers to domain insights." },
        { title: "NLP Resume Parsing", desc: "Automated OCR heuristics and deep contextual analysis of unstructured resume text." },
        { title: "AI Behavioral Modeling", desc: "Tracking speech patterns, structural star framing, and confidence levels." },
        { title: "Real-Time Compiler Pipeline", desc: "Secure multi-language sandbox compiling and verifying code syntax instantly." }
    ];

    // Benefits List
    const benefits = [
        "Recruiter-Simulated Evaluation Paradigms",
        "Personalized Skill Gap Roadmaps & Actionable Goals",
        "Secure Storage & Full History Report Management",
        "Enterprise-level Deep Assessment Standards",
        "Continuous Performance Analytical Insights"
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-200 transition-colors duration-300">
            
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32 bg-linear-to-b from-emerald-50/50 via-transparent to-transparent dark:from-emerald-950/15">
                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <FaRobot /> The Future of Hiring Preparation
                    </span>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-6">
                        AI-Powered Interview & <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                            Resume Intelligence
                        </span> Platform
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 font-medium">
                        Transforming hiring preparation with AI-driven interview analysis, coding assessments, and advanced recruiter-level resume diagnostics.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button 
                            onClick={() => navigate("/auth")}
                            className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                        >
                            Get Started <FaArrowRight />
                        </button>
                        <button 
                            onClick={() => {
                                const el = document.getElementById("features");
                                el?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-800 dark:text-white border border-gray-200 dark:border-slate-700 font-bold rounded-xl shadow-xs transition"
                        >
                            Explore Features
                        </button>
                    </div>
                </div>
                {/* Background Blobs */}
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full filter blur-3xl" />
                <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-80 h-80 bg-teal-500/10 dark:bg-teal-500/5 rounded-full filter blur-3xl" />
            </section>

            {/* Platform Overview */}
            <section className="py-16 bg-white dark:bg-slate-800/40 border-y border-gray-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-7 space-y-6">
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                Empowering Careers with Recruiter-Grade Evaluation
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                                Our platform helps candidates prepare for competitive technical roles through realistic AI mock interviews, live compiler coding assessments, and deep ATS resume analysis. 
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                                Whether you are an entry-level fresher seeking structure or an experienced professional aiming to polish your soft signals, SmartHire.AI gives you the tools to succeed at the highest corporate screening standards.
                            </p>
                        </div>
                        <div className="lg:col-span-5 bg-linear-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-700/50 p-8 rounded-3xl border border-emerald-100 dark:border-slate-700/60 shadow-xs">
                            <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-400">
                                <FaLightbulb className="text-2xl shrink-0" />
                                <h3 className="font-bold text-xl text-gray-900 dark:text-white">Why It Exists</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                                Traditional hiring preparation is scattered. Candidates upload resumes without knowing their ATS readability, and coding challenges rarely check semantic reasoning. 
                            </p>
                            <span className="text-emerald-700 dark:text-emerald-400 text-sm font-bold block">
                                👉 SmartHire.AI connects the entire journey into a single unified preparation hub.
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Features Grid */}
            <section id="features" className="py-20 max-w-7xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
                        State-of-the-Art Feature Set
                    </h2>
                    <p className="max-w-2xl mx-auto text-gray-500 dark:text-gray-400">
                        Everything you need to master your interview pipeline, parsed and verified by our modern intelligence systems.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {coreFeatures.map((feat, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xs border border-gray-100 dark:border-slate-700/50 hover:border-emerald-200 dark:hover:border-emerald-950 transition-all hover:-translate-y-1">
                            <div className="mb-5">{feat.icon}</div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feat.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Advanced Technology */}
            <section className="py-20 bg-gray-100 dark:bg-slate-800/20 border-y border-gray-200/50 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-xs block mb-3">
                                TECHNICAL FRAMEWORKS
                            </span>
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6">
                                Powering Real-World Simulation
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                                Behind the scenes, we use advanced neural network architectures, custom sandboxed compilation execution pipelines, and NLP contextual analyzers to evaluate code correctness, structural experience relevance, and resume readability.
                            </p>
                            <div className="space-y-4">
                                {technologyList.map((tech, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-base">{tech.title}</h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{tech.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800/80 p-8 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Why Choose Us</h3>
                            <div className="space-y-4">
                                {benefits.map((b, idx) => (
                                    <div key={idx} className="flex items-center gap-3.5 bg-gray-50 dark:bg-slate-900/60 px-5 py-4 rounded-2xl border border-gray-100 dark:border-slate-700/50">
                                        <FaCheck className="text-emerald-500 shrink-0" />
                                        <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">{b}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision & Mission */}
            <section className="py-20 max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="p-8 md:p-10 rounded-3xl bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                        <div className="flex items-center gap-3 mb-6">
                            <FaEye className="text-3xl" />
                            <h3 className="text-2xl font-black">Our Vision</h3>
                        </div>
                        <p className="text-emerald-100 text-lg leading-relaxed font-medium">
                            “To build the most intelligent AI-driven career preparation ecosystem, breaking down the barrier between talented candidates and enterprise hiring benchmarks globally.”
                        </p>
                    </div>
                    <div className="p-8 md:p-10 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-md">
                        <div className="flex items-center gap-3 mb-6">
                            <FaGraduationCap className="text-3xl text-emerald-400" />
                            <h3 className="text-2xl font-black">Our Mission</h3>
                        </div>
                        <p className="text-gray-400 text-lg leading-relaxed font-medium">
                            “To help candidates become structurally and contextually industry-ready by supplying advanced AI simulation technology, deep diagnostic skill gap analysis, and recruiter-level mock preparation.”
                        </p>
                    </div>
                </div>
            </section>

            {/* Statistics counters */}
            <section className="py-16 bg-white dark:bg-slate-800/40 border-y border-gray-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="space-y-2">
                                <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-emerald-600 dark:text-emerald-400">{stat.count}</p>
                                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>



            {/* CTA Section */}
            <section className="py-20 bg-linear-to-br from-gray-900 to-slate-900 text-white rounded-t-3xl text-center relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-6">
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        Start your AI-powered interview journey today.
                    </h2>
                    <p className="text-gray-400 max-w-xl mx-auto">
                        Elevate your resume readability score, polish behavioral star frameworks, and unlock your technical potential with recruiter grade insights.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <button 
                            onClick={() => navigate("/avatar-interview")}
                            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition"
                        >
                            Start Interview
                        </button>
                        <button 
                            onClick={() => navigate("/upload-resume")}
                            className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition"
                        >
                            Upload Resume
                        </button>
                    </div>
                </div>
                {/* Background Decorative Blob */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl" />
            </section>

        </div>
    );
}

export default About;
