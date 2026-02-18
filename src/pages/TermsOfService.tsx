import React from 'react';
import Navbar from '../components/Navbar';
import { Footer } from '../components/Footer';

export const TermsOfService: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="container mx-auto px-4 py-16 flex-grow">
                <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-sm">
                    <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
                    <p className="mb-4 text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>

                    <div className="prose prose-blue">
                        <h2 className="text-xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
                        <p className="mb-4">
                            By accessing or using Snapceit, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                            If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                        </p>

                        <h2 className="text-xl font-semibold mt-6 mb-3">2. Use License</h2>
                        <p className="mb-4">
                            Permission is granted to temporarily download one copy of the materials (information or software) on Snapceit's website for personal, non-commercial transitory viewing only.
                            This is the grant of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul className="list-disc pl-5 mb-4 space-y-2">
                            <li>modify or copy the materials;</li>
                            <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
                            <li>attempt to decompile or reverse engineer any software contained on Snapceit's website;</li>
                            <li>remove any copyright or other proprietary notations from the materials; or</li>
                            <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
                        </ul>

                        <h2 className="text-xl font-semibold mt-6 mb-3">3. Disclaimer</h2>
                        <p className="mb-4">
                            The materials on Snapceit's website are provided on an 'as is' basis. Snapceit makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>

                        <h2 className="text-xl font-semibold mt-6 mb-3">4. Limitations</h2>
                        <p className="mb-4">
                            In no event shall Snapceit or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Snapceit's website, even if Snapceit or a Snapceit authorized representative has been notified orally or in writing of the possibility of such damage.
                        </p>

                        <h2 className="text-xl font-semibold mt-6 mb-3">5. Governing Law</h2>
                        <p className="mb-4">
                            These terms and conditions are governed by and construed in accordance with the laws of Ghana and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};
