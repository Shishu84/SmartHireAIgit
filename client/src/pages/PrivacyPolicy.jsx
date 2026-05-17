import React from 'react';
import { FaLock, FaEye, FaFileContract, FaShieldAlt } from 'react-icons/fa';

function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-200 transition-colors duration-300 py-16 px-6">
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 md:p-12 rounded-3xl border border-gray-200 dark:border-slate-700/60 shadow-xs">
                
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-gray-200 dark:border-slate-700 pb-6 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <FaShieldAlt className="text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Privacy Policy</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last Updated: May 18, 2026</p>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-8 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Introduction</h2>
                        <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                            Welcome to SmartHire.AI ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy governs our data collection, processing, and usage practices when you use our AI interview training platform and resume diagnostics intelligence tools.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Information We Collect</h2>
                        <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base mb-4">
                            We collect personal data that you voluntarily provide to us when registering, uploading materials, or interacting with our AI models.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li><strong>Account Credentials:</strong> Full name, email address, password hashes, and profiles.</li>
                            <li><strong>Resume Materials:</strong> Uploaded resume files (PDF, DOCX) processed for keyword scans, years of experience, and ATS compatibility metrics.</li>
                            <li><strong>Interview Logs:</strong> Speech transcripts, coding compilers transcripts, behavioral indicators, and scoring parameters generated during mock simulator rounds.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. How We Use Your Data</h2>
                        <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base mb-4">
                            We utilize your data solely to feed our secure LLM parsing networks and deliver deep analytical career metrics.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li>To compile and render your interactive dashboard mock scores and history tracking chart arrays.</li>
                            <li>To format and generate downloadable PDF Resume Intelligence and Compatibility reports.</li>
                            <li>To improve our speech-to-text translators and avatar mock dialog behaviors.</li>
                            <li>We **do not** sell, trade, or distribute your personal documents or parsed resume data to third-party advertisers.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Temporary Storage & Safety</h2>
                        <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                            Uploaded resume PDFs are stored in highly secure cloud blocks. To protect your details and keep server memory clear, files are instantly parsed and deleted from temp disk space upon parsing completion. All database transactions are protected by industry-standard TLS encryption.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. User Control & Deletion Rights</h2>
                        <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                            You maintain full ownership of your records. You can delete individual interview logs, parsed ATS intelligence, or entire history lists using our Secure Single/Bulk delete controls located directly on your Dashboard page. Deleting items wipes Mongoose records immediately.
                        </p>
                    </section>

                    <section className="border-t border-gray-200 dark:border-slate-700 pt-8 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Have questions or concerns about how your details are handled? Reach out to us via our <a href="/contact" className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold">Contact Page</a>.
                        </p>
                    </section>
                </div>

            </div>
        </div>
    );
}

export default PrivacyPolicy;
