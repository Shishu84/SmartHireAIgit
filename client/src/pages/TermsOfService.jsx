import React from 'react';
import { FaFileSignature, FaUserShield, FaCoins, FaCheck } from 'react-icons/fa';

function TermsOfService() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-200 transition-colors duration-300 py-16 px-6">
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 md:p-12 rounded-3xl border border-gray-200 dark:border-slate-700/60 shadow-xs">
                
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-gray-200 dark:border-slate-700 pb-6 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                        <FaFileSignature className="text-2xl" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Terms of Service</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last Updated: May 18, 2026</p>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-8 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Agreement to Terms</h2>
                        <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                            By registering an account or accessing any mock evaluation simulators at SmartHire.AI, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Platform Credits & Billing</h2>
                        <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base mb-4">
                            SmartHire.AI operates on a Credit allocation system. Credits represent virtual assessment units used to process coding sandboxes, prompt LLMs, and compile speech audio transcripts.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li>Each user gets a baseline set of complimentary credits upon account creation.</li>
                            <li>Additional credits can be purchased securely under the Pricing menu. Credit purchases are processed through verified billing blocks and are non-refundable.</li>
                            <li>Credits are consumed dynamically based on mock interview duration and compiler operations.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. Permitted Platform Use</h2>
                        <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base mb-4">
                            You are granted a non-exclusive, non-transferable, revocable license to access mock modules for individual career training and preparation.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li>You must not inject malicious scripts, attempt SQL injection, or run scraper scripts over our sandbox environments.</li>
                            <li>You must not reverse engineer parsed prompts or capture audio mock signals to clone voice prints.</li>
                            <li>Violations of platform security result in immediate credit forfeiture and account bans.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Limitation of Liability</h2>
                        <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                            Our platform simulates real technical recruiter behaviors and prints comprehensive scoring estimates out of 100%. While we strive for realistic accuracy, we cannot guarantee job placement or promise that actual interviewers will follow identical behavioral formats. SmartHire.AI is not liable for outcomes in real-world corporate recruiting boards.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Modification of Terms</h2>
                        <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
                            We reserve the right to revise or adjust these Terms of Service at any time. Updates take effect immediately when published on this page. Your continued use of the platform constitutes agreement to the modified guidelines.
                        </p>
                    </section>

                    <section className="border-t border-gray-200 dark:border-slate-700 pt-8 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Have questions or concerns about these Terms? Feel free to contact our billing or support panel via the <a href="/contact" className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold">Contact Page</a>.
                        </p>
                    </section>
                </div>

            </div>
        </div>
    );
}

export default TermsOfService;
