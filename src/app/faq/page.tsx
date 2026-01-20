'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqData = [
    {
        question: "When is the mango season at Salem Farm?",
        answer: "Our primary harvest season typically runs from late March through June. This is when you'll find our widest variety of naturally ripened mangoes at their peak flavor."
    },
    {
        question: "How do you ensure the quality of your mangoes?",
        answer: "All our fruits are naturally ripened on the tree or under hay. We strictly follow carbide-free ripening processes to ensure the fruits are healthy, tasty, and safe for consumption."
    },
    {
        question: "Do you ship pan-India?",
        answer: "Yes, we deliver to almost all major cities across India using reliable courier partners specialized in handling perishables."
    },
    {
        question: "How long does delivery take?",
        answer: "Deliveries usually take 3-5 business days depending on your location. Each box is packed with care to ensure the mangoes reach you in perfect condition."
    },
    {
        question: "Can I place a bulk order for events or corporate gifts?",
        answer: "Absolutely! Please visit our Corporate Gifts or Bulk Enquiry pages under the 'More' menu for special pricing and customized packaging options."
    },
    {
        question: "Is my payment secure?",
        answer: "Yes, we use Razorpay for all transactions, ensuring industry-standard encryption and security. We support UPI, credit/debit cards, and net banking."
    }
];

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            style={{
                borderBottom: '1px solid var(--border-light)',
                padding: 'var(--space-6) 0',
                cursor: 'pointer'
            }}
            onClick={() => setIsOpen(!isOpen)}
        >
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem'
            }}>
                <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    margin: 0,
                    color: isOpen ? 'var(--color-mango-600)' : 'inherit',
                    transition: 'color 0.2s'
                }}>
                    {question}
                </h3>
                {isOpen ? <ChevronUp size={20} color="var(--color-mango-600)" /> : <ChevronDown size={20} color="var(--text-secondary)" />}
            </div>

            <div style={{
                maxHeight: isOpen ? '500px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease-out, opacity 0.3s ease-out',
                opacity: isOpen ? 1 : 0,
                marginTop: isOpen ? '1rem' : '0'
            }}>
                <p style={{
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                    fontSize: '1rem',
                    margin: 0
                }}>
                    {answer}
                </p>
            </div>
        </div>
    );
};

export default function FAQPage() {
    return (
        <div style={{ minHeight: '100vh', background: 'white', padding: 'var(--space-24) 0 8rem' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-20)' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem', color: 'var(--color-mango-900)' }}>
                        Frequently Asked Questions
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                        Everything you need to know about our farm-fresh mangoes, delivery process, and more.
                    </p>
                </div>

                <div style={{
                    background: 'white',
                    borderRadius: '1rem',
                    padding: '0 var(--space-4)',
                    marginBottom: 'var(--space-12)'
                }}>
                    {faqData.map((item, index) => (
                        <FAQItem key={index} {...item} />
                    ))}
                </div>

                <div style={{
                    marginTop: 'var(--space-24)',
                    textAlign: 'center',
                    padding: 'var(--space-16) var(--space-8)',
                    background: 'var(--color-mango-50)',
                    borderRadius: '2rem',
                    border: '1px solid var(--color-mango-100)'
                }}>
                    <h3 style={{ color: 'var(--color-mango-900)', marginBottom: '0.75rem', fontSize: '1.5rem', fontWeight: '700' }}>Still have questions?</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.05rem' }}>
                        Can&apos;t find the answer you&apos;re looking for? Please chat with our friendly team.
                    </p>
                    <a
                        href="/contact"
                        className="btn btn-primary"
                        style={{ display: 'inline-block', textDecoration: 'none', padding: '1rem 2.5rem', borderRadius: '0.75rem' }}
                    >
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
}
