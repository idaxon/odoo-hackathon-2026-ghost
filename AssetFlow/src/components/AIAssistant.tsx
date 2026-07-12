import { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, AlertCircle, Wrench, ShieldCheck, DollarSign, MapPin } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  type: 'text' | 'waste' | 'projector' | 'replace' | 'maintenance';
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Hello! I am your AssetFlow AI Copilot. I can help you analyze idle assets, resource bookings, replacement recommendations, and maintenance queues. Select a prompt below or type your question.',
      type: 'text'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat area
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Listen for open-ai-chat custom events from the dashboard
  useEffect(() => {
    const handleCustomQuery = (e: Event) => {
      const customEvent = e as CustomEvent<{ query: string }>;
      const text = customEvent.detail.query;
      setIsOpen(true);
      processQuery(text);
    };

    window.addEventListener('open-ai-chat', handleCustomQuery);
    return () => window.removeEventListener('open-ai-chat', handleCustomQuery);
  }, [messages]);

  const processQuery = (userText: string) => {
    if (!userText.trim()) return;

    const lowerText = userText.toLowerCase();
    let responseType: ChatMessage['type'] = 'text';
    let responseText = '';

    if (lowerText.includes('waste') || lowerText.includes('wasting')) {
      responseType = 'waste';
      responseText = 'Laptop-12 has been unused for 37 days. Recommend moving to HR. Estimated savings: ₹21,000';
    } else if (lowerText.includes('projector') || lowerText.includes('available')) {
      responseType = 'projector';
      responseText = 'Projector P17 — Floor 2, Meeting Room A — Available now';
    } else if (lowerText.includes('replace')) {
      responseType = 'replace';
      responseText = 'Printer P17 — Repair cost ₹16,000 vs Replacement ₹13,000 → Recommendation: Replace';
    } else if (lowerText.includes('maintenance')) {
      responseType = 'maintenance';
      responseText = 'Assets needing maintenance today';
    } else {
      responseType = 'text';
      responseText = 'I can help with idle assets, replacements, bookings, and maintenance. Try asking about one of those.';
    }

    setMessages(prev => [
      ...prev,
      { role: 'user', text: userText, type: 'text' },
      { role: 'assistant', text: responseText, type: responseType }
    ]);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    processQuery(query);
    setQuery('');
  };

  const handleChipClick = (promptText: string) => {
    processQuery(promptText);
  };

  const renderResponseCard = (msg: ChatMessage) => {
    if (msg.role === 'user' || msg.type === 'text') {
      return (
        <div className={`p-3 rounded-lg text-sm leading-relaxed max-w-[85%] ${
          msg.role === 'user' 
            ? 'bg-primary text-white ml-auto rounded-tr-none' 
            : 'bg-gray-50 text-text border border-border-light mr-auto rounded-tl-none font-medium'
        }`}>
          {msg.text}
        </div>
      );
    }

    switch (msg.type) {
      case 'waste':
        return (
          <div className="card-premium p-4 border-l-4 border-l-secondary bg-white text-xs space-y-3 mr-auto max-w-[90%] shadow-sm">
            <div className="flex items-center gap-1.5 border-b border-border-light pb-2">
              <DollarSign size={14} className="text-secondary" />
              <span className="font-bold text-text uppercase tracking-wider">Budget Optimization Card</span>
            </div>
            <div className="space-y-1.5 text-text">
              <div className="flex justify-between">
                <span className="text-text-muted">Idle Asset:</span>
                <span className="font-semibold font-mono">Laptop-12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Reason:</span>
                <span className="font-semibold">Unused for 37 days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Action Recommendation:</span>
                <span className="font-semibold">Transfer to HR department</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Confidence Index:</span>
                <span className="tag-status bg-green-50 text-green-700 border-green-200 border text-[10px] py-0 px-1.5">96%</span>
              </div>
              <div className="pt-2 border-t border-border-light flex justify-between items-baseline">
                <span className="font-semibold text-text-muted">Estimated Savings:</span>
                <span className="font-bold text-sm text-secondary">₹21,000</span>
              </div>
            </div>
          </div>
        );

      case 'projector':
        return (
          <div className="card-premium p-4 border-l-4 border-l-secondary bg-white text-xs space-y-3 mr-auto max-w-[90%] shadow-sm">
            <div className="flex items-center gap-1.5 border-b border-border-light pb-2">
              <MapPin size={14} className="text-secondary" />
              <span className="font-bold text-text uppercase tracking-wider">Resource Allocation Map</span>
            </div>
            <div className="space-y-1.5 text-text">
              <div className="flex justify-between">
                <span className="text-text-muted">Resource Node:</span>
                <span className="font-semibold font-mono">Projector P17</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Location details:</span>
                <span className="font-semibold">Floor 2, Meeting Room A</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Status:</span>
                <span className="tag-status bg-green-50 text-green-700 border-green-200 border text-[10px] py-0 px-1.5">Available Now</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Confidence:</span>
                <span className="font-semibold font-mono">100%</span>
              </div>
            </div>
          </div>
        );

      case 'replace':
        return (
          <div className="card-premium p-4 border-l-4 border-l-primary bg-white text-xs space-y-3 mr-auto max-w-[90%] shadow-sm">
            <div className="flex items-center gap-1.5 border-b border-border-light pb-2">
              <AlertCircle size={14} className="text-primary" />
              <span className="font-bold text-text uppercase tracking-wider">Lifecycle Replacement Audit</span>
            </div>
            <div className="space-y-2 text-text">
              <div className="flex justify-between">
                <span className="text-text-muted">Target Node:</span>
                <span className="font-semibold font-mono">Printer P17</span>
              </div>
              
              {/* Cost comparison progress bars */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[10px] text-text-muted font-medium">
                  <span>Repair Cost</span>
                  <span>₹16,000</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full w-full"></div>
                </div>

                <div className="flex justify-between text-[10px] text-text-muted font-medium pt-1">
                  <span>Replacement Cost</span>
                  <span>₹13,000</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-green-600 h-full w-[81%]"></div>
                </div>
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-text-muted">Recommendation:</span>
                <span className="font-bold text-red-600">Replace Device</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Expected Savings:</span>
                <span className="font-semibold text-secondary">₹3,000 (avoided loss)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Confidence:</span>
                <span className="tag-status bg-green-50 text-green-700 border-green-200 border text-[10px] py-0 px-1.5">91%</span>
              </div>
            </div>
          </div>
        );

      case 'maintenance':
        return (
          <div className="card-premium p-4 border-l-4 border-l-secondary bg-white text-xs space-y-3 mr-auto max-w-[90%] shadow-sm">
            <div className="flex items-center gap-1.5 border-b border-border-light pb-2">
              <Wrench size={14} className="text-secondary" />
              <span className="font-bold text-text uppercase tracking-wider">Today's Maintenance Queue</span>
            </div>
            <div className="space-y-2 text-text">
              <div className="divide-y divide-border-light">
                <div className="py-1.5 flex justify-between items-center first:pt-0">
                  <span className="font-medium">1. Server Rack B4</span>
                  <span className="text-[10px] text-red-600 font-semibold bg-red-50 border border-red-100 px-1 rounded-[4px]">Temp alert</span>
                </div>
                <div className="py-1.5 flex justify-between items-center">
                  <span className="font-medium">2. HQ HVAC Unit 2</span>
                  <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 border border-amber-100 px-1 rounded-[4px]">Compressor noise</span>
                </div>
                <div className="py-1.5 flex justify-between items-center last:pb-0">
                  <span className="font-medium">3. Toyota Forklift FL-03</span>
                  <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 border border-amber-100 px-1 rounded-[4px]">Hydraulic leak</span>
                </div>
              </div>
              <div className="pt-2 border-t border-border-light flex justify-between items-center text-[10px] text-text-muted">
                <span>Dispatch Status:</span>
                <span className="text-green-700 font-bold flex items-center gap-0.5">
                  <ShieldCheck size={11} /> Technicians Sent
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Confidence:</span>
                <span className="font-semibold font-mono">88%</span>
              </div>
            </div>
          </div>
        );
    }
  };

  const chips = [
    { label: 'Wasting budget?', query: 'What is wasting budget?' },
    { label: 'Available projector?', query: 'Find an available projector' },
    { label: 'Replace Printer P17?', query: 'Should I replace Printer P17?' },
    { label: 'Maintenance list?', query: 'Show maintenance list' }
  ];

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 bg-primary hover:bg-[#613e58] text-white w-12 h-12 rounded-lg shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200"
        title="AI Assistant"
      >
        {isOpen ? <X size={20} /> : <Sparkles size={20} className="animate-pulse" />}
      </button>

      {/* Side Chat Sidebar Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-96 max-h-[520px] h-[520px] bg-surface border border-border-light rounded-lg shadow-xl z-40 flex flex-col justify-between overflow-hidden animate-slide-in">
          {/* Header */}
          <div className="h-12 border-b border-border-light flex items-center justify-between px-4 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary animate-pulse" />
              <span className="font-bold text-sm text-text">AssetFlow AI Copilot</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-text-muted hover:text-text p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Conversation Messages Screen */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg">
            {messages.map((msg, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                {renderResponseCard(msg)}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips & Input controls footer */}
          <div className="p-3 border-t border-border-light bg-surface space-y-2.5">
            {/* Suggestions prompt chips */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              {chips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChipClick(chip.query)}
                  className="bg-gray-50 border border-border-light hover:bg-gray-100 hover:border-border-medium text-text text-[10px] py-1 px-2 rounded-[4px] font-medium transition-colors cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input submission box */}
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask about idle assets, repairs, bookings..."
                className="input-premium flex-1 text-xs py-1.5 px-3"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="btn-primary py-1.5 px-3 rounded-[6px]"
              >
                <Send size={12} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
