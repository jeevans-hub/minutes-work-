import { NextResponse } from 'next/server';

// Basic Smart Keyword Engine
const getChatbotResponse = (message) => {
  const msg = message.toLowerCase();

  // FAQs
  if (msg.includes('pay') || msg.includes('cash') || msg.includes('credit')) {
    return {
      text: 'You can pay using Cash on Service, or securely Online via Credit Card/Wallet when booking.',
      type: 'faq',
    };
  }
  if (msg.includes('safe') || msg.includes('trust') || msg.includes('verify')) {
    return {
      text: 'All our workers go through a background check and are verified professionals. Look for the "Verified Pro" badge!',
      type: 'faq',
    };
  }
  if (msg.includes('cancel') || msg.includes('refund')) {
    return {
      text: 'You can cancel a booking before the worker arrives without any charges. Refunds are processed within 3-5 business days.',
      type: 'faq',
    };
  }

  // Service Diagnosis Rules
  const rules = [
    { keywords: ['ac', 'cooling', 'hot', 'air condition', 'hvac'], category: 'HVAC' },
    { keywords: ['pipe', 'leak', 'water', 'sink', 'toilet', 'tap', 'plumb'], category: 'Plumber' },
    { keywords: ['wire', 'spark', 'light', 'fan', 'switch', 'current', 'electric'], category: 'Electrician' },
    { keywords: ['wood', 'furniture', 'door', 'cabinet', 'chair', 'table'], category: 'Carpenter' },
    { keywords: ['paint', 'color', 'wall', 'peeling'], category: 'Painter' },
    { keywords: ['clean', 'dust', 'mess', 'mop', 'sweep', 'maid', 'housekeep'], category: 'Cleaner' },
    { keywords: ['garden', 'grass', 'plant', 'lawn', 'tree', 'yard'], category: 'Gardener' },
    { keywords: ['brick', 'cement', 'concrete', 'build', 'wall', 'mason'], category: 'Mason' },
  ];

  for (const rule of rules) {
    if (rule.keywords.some(kw => msg.includes(kw))) {
      return {
        text: `It sounds like you need a **${rule.category}**. Would you like me to help you find one nearby?`,
        type: 'recommendation',
        category: rule.category,
      };
    }
  }

  // Default fallback
  return {
    text: "I'm your MintWork assistant! Tell me what problem you're facing (e.g., 'My sink is leaking'), and I'll suggest the right professional to fix it.",
    type: 'general',
  };
};

export async function POST(request) {
  try {
    const { message } = await request.json();
    if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

    const response = getChatbotResponse(message);

    // Simulate slight network delay for "AI typing" effect
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chatbot error:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
