
export const DEFAULT_MESSAGES = [
  {
    id: '1',
    role: 'assistant' as const,
    content: 'Hello! I\'m your AI assistant. How can I help you today?',
    timestamp: new Date().toISOString(),
  }
];

export const LOADING_PHRASES = [
  'Thinking...',
  'Processing...',
  'Analyzing...',
  'Considering...',
  'Contemplating...',
];
