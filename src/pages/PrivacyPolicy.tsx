import React from 'react';
import Navbar from '../components/Navbar';
import { Footer } from '../components/Footer';

export const PrivacyPolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="container mx-auto px-4 py-16 flex-grow">
                <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm">
                    <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
                    <p className="mb-4 text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>

                    <div className="prose prose-blue">
                        <h2 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h2>
                        <p className="mb-4">
                            Welcome to Snapceit ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data.
                            This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from)
                            and tell you about your privacy rights and how the law protects you.
                        </p>

                        <h2 className="text-xl font-semibold mt-6 mb-3">2. Data We Collect</h2>
                        <p className="mb-4">
                            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                        </p>
                        <ul className="list-disc pl-5 mb-4 space-y-2">
                            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
                            <li><strong>Financial Data:</strong> includes receipt images and data extracted from them.</li>
                            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
                        </ul>

                        <h2 className="text-xl font-semibold mt-6 mb-3">3. How We Use Your Data</h2>
                        <p className="mb-4">
                            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                        </p>
                        <ul className="list-disc pl-5 mb-4 space-y-2">
                            <li>Where we need to perform the contract we are about to enter into or have entered into with you.</li>
                            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                            <li>Where we need to comply with a legal or regulatory obligation.</li>
                        </ul>

                        <h2 className="text-xl font-semibold mt-6 mb-3">4. Data Security</h2>
                        <p className="mb-4">
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
                            In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                        </p>

                        <h2 className="text-xl font-semibold mt-6 mb-3">5. Contact Us</h2>
                        <p className="mb-4">
                            If you have any questions about this privacy policy or our privacy practices, please contact us at: support@snapceit.com
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};
