import React from 'react';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { CheckIcon } from '@heroicons/react/24/outline';

export const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      features: [
        'Up to 50 receipts/month',
        '1 GB storage',
        'Basic OCR processing',
        'Email support',
        'Manual categorization',
      ],
      cta: 'Current Plan',
      ctaDisabled: true,
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$9.99',
      description: 'For regular users',
      features: [
        'Unlimited receipts',
        '50 GB storage',
        'Advanced OCR processing',
        'Priority email support',
        'Auto-categorization',
        'Receipt analytics',
        'Tax report generation',
        'API access',
      ],
      cta: 'Upgrade to Pro',
      ctaDisabled: false,
      highlighted: true,
    },
    {
      name: 'Business',
      price: '$29.99',
      description: 'For teams and businesses',
      features: [
        'Unlimited receipts',
        '500 GB storage',
        'Premium OCR processing',
        '24/7 phone support',
        'Auto-categorization',
        'Advanced analytics',
        'Custom tax rules',
        'API access',
        'Team collaboration',
        'Dedicated account manager',
      ],
      cta: 'Upgrade to Business',
      ctaDisabled: false,
      highlighted: false,
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Pricing Plans"
        description="Choose the perfect plan for your needs"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden transition-all ${
              plan.highlighted
                ? 'ring-2 ring-purple-500 md:scale-105'
                : ''
            }`}
          >
            {plan.highlighted && (
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-2 text-sm font-semibold">
                Most Popular
              </div>
            )}

            <div className={`p-6 ${plan.highlighted ? 'pt-16' : ''}`}>
              {/* Plan Header */}
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-white/60 text-sm mb-4">{plan.description}</p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-white/60 ml-2">/month</span>
              </div>

              {/* CTA Button */}
              <button
                disabled={plan.ctaDisabled}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all mb-6 ${
                  plan.ctaDisabled
                    ? 'bg-white/10 text-white/60 cursor-not-allowed'
                    : plan.highlighted
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                {plan.cta}
              </button>

              {/* Features List */}
              <div className="space-y-3">
                <p className="text-xs text-white/60 font-semibold uppercase mb-4">Features</p>
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-12 bg-white/5 backdrop-blur-lg rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Can I change plans anytime?</h3>
            <p className="text-white/80">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">What payment methods do you accept?</h3>
            <p className="text-white/80">We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Is there a free trial?</h3>
            <p className="text-white/80">Yes! Start with our Free plan and upgrade whenever you're ready. No credit card required.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">What happens if I exceed my storage limit?</h3>
            <p className="text-white/80">We'll notify you when you're approaching your limit. You can upgrade anytime to get more storage.</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Do you offer refunds?</h3>
            <p className="text-white/80">Yes! We offer a 30-day money-back guarantee if you're not satisfied with your plan.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
