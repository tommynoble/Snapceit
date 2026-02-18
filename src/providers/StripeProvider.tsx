import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Replace with your publishable key
// In production, this should be in .env.local: VITE_STRIPE_PUBLISHABLE_KEY
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';

interface StripeContextType {
    stripePromise: Promise<Stripe | null>;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

export function useStripeContext() {
    const context = useContext(StripeContext);
    if (!context) {
        throw new Error('useStripeContext must be used within a StripeProvider');
    }
    return context;
}

export const StripeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [stripePromise] = useState(() => loadStripe(STRIPE_PUBLISHABLE_KEY));

    return (
        <StripeContext.Provider value={{ stripePromise }}>
            <Elements stripe={stripePromise}>
                {children}
            </Elements>
        </StripeContext.Provider>
    );
};
