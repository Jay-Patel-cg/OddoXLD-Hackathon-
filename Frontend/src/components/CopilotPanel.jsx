import React, { useState } from 'react';
import { Sparkles, Send, X, CheckCircle2 } from 'lucide-react';
import { askAssistant } from '../api';

const QUICK_PROMPTS = [
  'What is planned for this trip?',
  'Recommend good food spots',
  'Optimize my itinerary budget',
  'Add an evening activity'
];

const CopilotPanel = ({ tripId, onActionExecuted }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your Musafir AI Travel Copilot. Ask me anything about your trip, get recommendations, or let me update your itinerary!',
      action: 'ANSWER',
      changes: []
    }
  ]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend || !textToSend.trim() || !tripId) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim()
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInputMessage('');
    setLoading(true);

    try {
      const res = await askAssistant({ tripId, message: textToSend.trim() });

      if (res.success && res.data) {
        const aiMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: res.data.response || 'I have processed your request.',
          action: res.data.action,
          changes: res.data.changes || [],
          executed: res.data.executed || false
        };

        setMessages((prev) => [...prev, aiMsg]);

        if (res.data.executed && onActionExecuted) {
          onActionExecuted();
        }
      }
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: err.message || 'Sorry, I encountered an issue processing your request.',
        isError: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button className="copilot-trigger-btn" onClick={() => setIsOpen(!isOpen)}>
        <Sparkles size={18} />
        <span>Ask Musafir AI</span>
      </button>

      {/* Floating Copilot Panel */}
      {isOpen && (
        <div className="copilot-panel">
          {/* Header */}
          <div className="copilot-header">
            <div className="copilot-header-title">
              <Sparkles size={18} />
              <span>Musafir AI Travel Copilot</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ color: '#FFF', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="copilot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-bubble ${msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}
              >
                <div>{msg.text}</div>

                {/* Visual Action Feedback Card */}
                {msg.executed && (
                  <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}>
                      <CheckCircle2 size={15} />
                      <span>Action Applied to Journey</span>
                    </div>
                    <div style={{ marginTop: '2px', opacity: 0.9 }}>
                      Action: {msg.action} ({msg.changes.length} item modified)
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="chat-bubble chat-bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} className="spin" color="var(--accent-ocean)" />
                <span>Musafir AI is thinking...</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Chips Container (Flex Wrap - No horizontal scrollbar!) */}
          <div style={{ padding: '10px 16px', background: '#F8FBFD', borderTop: 'var(--border-light)', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp)}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  padding: '5px 12px',
                  borderRadius: 'var(--border-radius-pill)',
                  background: 'var(--surface-card)',
                  color: 'var(--text-navy)',
                  border: 'var(--border-light)',
                  cursor: 'pointer'
                }}
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="copilot-input-area"
          >
            <input
              type="text"
              placeholder="Ask Musafir AI about your trip..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="copilot-input"
            />
            <button type="submit" className="btn-primary" style={{ padding: '10px 16px', borderRadius: 'var(--border-radius-pill)' }} disabled={loading}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default CopilotPanel;
