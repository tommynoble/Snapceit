import { useState } from 'react';
import { Check, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../auth/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Footer } from '../components/Footer';
import Navbar from '../components/Navbar';

const TIERS = [
    {
        name: 'Free',
        id: 'free',
        price: { monthly: 0, yearly: 0 },
        description: 'Perfect for testing the waters.',
        features: [
            '5 Receipts per month',
            'Basic AI Extraction',
            'Manual Categorization',
            'Email Support',
            'Mobile App Access',
            'Secure Cloud Storage',
            'Export to PDF'
        ],
        cta: 'Get started for free',
        popular: false,
    },
    {
        name: 'Starter Plus',
        id: 'starter',
        price: { monthly: 19.99, yearly: 15.99 },
        description: 'For freelancers & contractors.',
        features: [
            '50 Receipts per month',
            'Priority Processing',
            'Email Reports',
            '30-day History',
            'Basic Support',
            'Smart Tax Detection',
            'CSV/Excel Exports',
            'Bulk Uploads',
            'Expense Analytics',
            'Custom Categories'
        ],
        cta: 'Get started for free',
        popular: true,
    },
    {
        name: 'Enterprise',
        id: 'enterprise',
        price: "Contact Sales",
        description: 'For high-volume companies.',
        features: [
            '1,500 Receipts per month',
            'Custom ML Models',
            'White-label Options',
            'Unlimited History',
            'Dedicated Account Manager',
            'API Access',
            'SSO Integration',
            'Audit Logs',
            'SLA Guarantee',
            '1-on-1 Onboarding'
        ],
        cta: 'Contact Sales',
        popular: false,
    }
];

const FEATURES_COMPARISON = [
    {
        category: 'Core Features', items: [
            { name: 'Monthly Receipts', free: '5', starter: '50', ent: 'Unlimited' },
            { name: 'AI Extraction', free: true, starter: true, ent: true },
            { name: 'Cloud Storage', free: '30 Days', starter: '1 Year', ent: 'Unlimited' },
        ]
    },
    {
        category: 'Intelligence', items: [
            { name: 'Auto-Categorization', free: false, starter: false, ent: true },
            { name: 'Tax Deduction Tips', free: false, starter: false, ent: true },
            { name: 'Custom ML Models', free: false, starter: false, ent: true },
        ]
    },
    {
        category: 'Support', items: [
            { name: 'Support Level', free: 'Email', starter: 'Email', ent: '24/7 Dedicated' },
            { name: 'API Access', free: false, starter: false, ent: true },
            { name: 'White-labeling', free: false, starter: false, ent: true },
        ]
    }
];

export function Pricing() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState<string | null>(null);
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

    const handleSubscribe = async (tierId: string) => {
        if (!currentUser) {
            toast.error('Please log in to view pricing options');
            navigate('/login');
            return;
        }

        if (tierId === 'free') {
            toast.success('You have selected the Free plan.');
            return;
        }

        setLoading(tierId);
        // Simulate API call
        setTimeout(() => {
            toast.success(`Redirecting to Stripe for ${tierId} (${billingInterval})...`);
            setLoading(null);
        }, 1000);
    };

    return (
        <>
            <Navbar />
            <div className="pt-40 pb-24 sm:pt-52 sm:pb-32 relative isolate overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl" aria-hidden="true">
                    <div className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
                </div>

                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Header */}
                    <div className="mx-auto max-w-4xl text-center">
                        <h2 className="text-base font-semibold leading-7 text-cyan-400">Pricing</h2>
                        <p className="mt-2 text-5xl font-bold tracking-tight text-white sm:text-6xl">
                            Transparent pricing for everyone
                        </p>
                        <p className="mt-6 text-lg leading-8 text-white">
                            Choose the perfect plan for your needs. Always know what you'll pay.
                        </p>
                    </div>

                    {/* Billing Toggle */}
                    <div className="mt-16 flex justify-center">
                        <div className="relative flex rounded-full bg-white/10 p-1 ring-1 ring-white/20">
                            <button
                                onClick={() => setBillingInterval('monthly')}
                                className={`${billingInterval === 'monthly' ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'} relative rounded-full px-6 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingInterval('yearly')}
                                className={`${billingInterval === 'yearly' ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'} relative rounded-full px-6 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500`}
                            >
                                Yearly <span className="absolute -top-3 -right-3 text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-1.5 py-0.5 rounded-full border border-emerald-400/20">-20%</span>
                            </button>
                        </div>
                    </div>

                    {/* Pricing Cards */}
                    <div className="isolate mx-auto mt-20 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        {TIERS.map((tier, tierIdx) => (
                            <motion.div
                                key={tier.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: tierIdx * 0.1 }}
                                className={`relative flex flex-col justify-between rounded-3xl bg-white/5 p-8 xl:p-10 transition-all hover:bg-white/10 ${tier.popular ? 'bg-white/10 border-2 border-cyan-500 shadow-2xl shadow-cyan-900/20 scale-105 lg:scale-110 z-10 py-12 xl:py-16' : 'ring-1 ring-white/10'}`}
                            >
                                {tier.popular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                        <span className="inline-block rounded-full bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 px-4 py-1.5 text-xs font-bold leading-5 text-white shadow-lg shadow-cyan-500/30">
                                            Most popular
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center justify-between gap-x-4">
                                        <h3 id={tier.id} className="text-2xl font-bold leading-8 text-white">
                                            {tier.name}
                                        </h3>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-gray-100">{tier.description}</p>
                                    <p className="mt-6 flex items-baseline gap-x-1">
                                        <span className="text-4xl font-bold tracking-tight text-white">
                                            {typeof tier.price === 'string' ? tier.price : `$${billingInterval === 'monthly' ? tier.price.monthly : tier.price.yearly}`}
                                        </span>
                                        {typeof tier.price !== 'string' && (
                                            <span className="text-sm font-semibold leading-6 text-gray-100">
                                                /{billingInterval === 'monthly' ? 'mo' : 'mo (billed yearly)'}
                                            </span>
                                        )}
                                    </p>
                                    <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-100">
                                        {tier.features.map((feature) => (
                                            <li key={feature} className="flex gap-x-3">
                                                <Check className="h-6 w-5 flex-none text-white" aria-hidden="true" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button
                                    onClick={() => handleSubscribe(tier.id)}
                                    disabled={loading === tier.id}
                                    className={`mt-8 block rounded-md px-4 py-3 text-center text-sm leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 ${tier.popular ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-400 hover:via-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/30 font-bold' : 'bg-white/10 text-white hover:bg-white/20 font-semibold'}`}
                                >
                                    {loading === tier.id ? 'Loading...' : tier.cta}
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    {/* Feature Comparison Table */}
                    <div className="mt-24 flow-root sm:mt-32">
                        <div className="mx-auto max-w-7xl px-6 lg:px-8">
                            <div className="mx-auto max-w-4xl text-center mb-16">
                                <h2 className="text-base font-semibold leading-7 text-cyan-400">Compare Plans</h2>
                                <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                                    Compare features side-by-side
                                </p>
                            </div>

                            <div className="overflow-x-auto rounded-3xl ring-1 ring-white/10 bg-white/5">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="p-6 text-sm font-semibold text-white border-b border-white/10 bg-white/5 w-1/4 min-w-[200px]">Feature</th>
                                            {TIERS.map((tier) => (
                                                <th key={tier.id} className="p-6 text-sm font-semibold text-white border-b border-l border-white/10 text-center min-w-[150px]">
                                                    {tier.name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {FEATURES_COMPARISON.map((section) => (
                                            <>
                                                <tr key={section.category} className="bg-white/5">
                                                    <th colSpan={5} className="py-4 pl-6 text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">{section.category}</th>
                                                </tr>
                                                {section.items.map((feature) => (
                                                    <tr key={feature.name} className="hover:bg-white/5 transition-colors">
                                                        <td className="p-6 text-sm text-gray-100 font-medium">{feature.name}</td>
                                                        <td className="p-6 text-sm text-gray-200 text-center border-l border-white/10">
                                                            {typeof feature.free === 'boolean' ? (
                                                                feature.free ? <Check className="mx-auto h-5 w-5 text-cyan-400" /> : <Minus className="mx-auto h-5 w-5 text-gray-500" />
                                                            ) : feature.free}
                                                        </td>
                                                        <td className="p-6 text-sm text-gray-200 text-center border-l border-white/10">
                                                            {typeof feature.starter === 'boolean' ? (
                                                                feature.starter ? <Check className="mx-auto h-5 w-5 text-cyan-400" /> : <Minus className="mx-auto h-5 w-5 text-gray-500" />
                                                            ) : feature.starter}
                                                        </td>
                                                        <td className="p-6 text-sm text-gray-200 text-center border-l border-white/10">
                                                            {typeof feature.ent === 'boolean' ? (
                                                                feature.ent ? <Check className="mx-auto h-5 w-5 text-cyan-400" /> : <Minus className="mx-auto h-5 w-5 text-gray-500" />
                                                            ) : feature.ent}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <Footer />
        </>
    );
}
