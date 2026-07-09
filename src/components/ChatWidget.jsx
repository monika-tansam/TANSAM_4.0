import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SUGGESTIONS = [
  "What labs does TANSAM have?",
  "How can I apply for the internship?",
  "Where is TANSAM located?",
  "Who inaugurated TANSAM and when?"
];

const FLOATING_MESSAGES = [
  "Ask TANSY",
  "TANSY can help you!",
  "Chat with TANSY"
];

const renderFormattedMessage = (content) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements = [];
  let inList = false;
  let listItems = [];

  const parseInline = (text) => {
    if (!text) return '';
    // Split by markdown bold (**text**)
    const parts = text.split(/\*\*([\s\S]+?)\*\*/g);
    return parts.flatMap((part, i) => {
      if (i % 2 === 1) {
        return [<strong key={`b-${i}`}>{part}</strong>];
      }
      
      // Split by markdown italic (*text*)
      const subParts = part.split(/\*([\s\S]+?)\*/g);
      return subParts.flatMap((subPart, j) => {
        if (j % 2 === 1) {
          return [<em key={`i-${i}-${j}`}>{subPart}</em>];
        }
        
        // Split by markdown inline code (`code`)
        const codeParts = subPart.split(/`([^`\n]+)`/g);
        return codeParts.map((codePart, k) => {
          if (k % 2 === 1) {
            return <code key={`c-${i}-${j}-${k}`} className="inline-code">{codePart}</code>;
          }
          return codePart;
        });
      });
    });
  };

  lines.forEach((line, idx) => {
    // Match bullet points starting with * or -
    const bulletMatch = line.match(/^[\-\*]\s+(.*)/);
    if (bulletMatch) {
      if (!inList) {
        inList = true;
        listItems = [];
      }
      listItems.push(<li key={`li-${idx}`}>{parseInline(bulletMatch[1])}</li>);
    } else {
      if (inList) {
        elements.push(<ul key={`ul-${idx}`} className="chat-list">{listItems}</ul>);
        inList = false;
        listItems = [];
      }
      
      if (line.trim() === '') {
        elements.push(<div key={`spacer-${idx}`} className="chat-spacer" />);
      } else {
        const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          const Tag = `h${level}`;
          elements.push(<Tag key={`h-${idx}`} className={`chat-h${level}`}>{parseInline(headerMatch[2])}</Tag>);
        } else {
          elements.push(<p key={`p-${idx}`} className="chat-paragraph">{parseInline(line)}</p>);
        }
      }
    }
  });

  if (inList) {
    elements.push(<ul key="ul-end" className="chat-list">{listItems}</ul>);
  }

  return elements;
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [floatingMsgIndex, setFloatingMsgIndex] = useState(0);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I am TANSY, the TANSAM Virtual Assistant. Ask me anything about TANSAM, our labs, or internship programs!'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) return;
    const interval = setInterval(() => {
      setFloatingMsgIndex(prev => (prev + 1) % FLOATING_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputValue.trim();
    if (!query) return;

    if (!textToSend) {
      setInputValue('');
    }
    setError(null);

    // Add user message
    const updatedMessages = [...messages, { role: 'user', content: query }];
    setMessages(updatedMessages);
    setIsTyping(true);

    // Format conversation history for RAG backend (omit system/welcome prompt)
    const historyPayload = updatedMessages
      .slice(1, -1) // skip welcome message & the current query
      .map(msg => ({ role: msg.role, content: msg.content }));

    try {
      const response = await fetch('http://localhost:5001/api/public/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          history: historyPayload
        })
      });

      if (!response.ok) {
        throw new Error('Failed to connect to TANSAM RAG service.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let assistantResponse = '';

      // Add placeholder assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      setIsTyping(false);

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: !done });
          
          // Split Server-Sent Events stream lines
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                // If it streams token
                if (data.token) {
                  assistantResponse += data.token;
                  setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1].content = assistantResponse;
                    return newMsgs;
                  });
                }
                
                if (data.error) {
                  throw new Error(data.error);
                }
              } catch (parseErr) {
                // Ignore parsing errors for empty chunks or incomplete lines
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError('Connection to local RAG server failed. Make sure the backend is running.');
      setMessages(prev => {
        // Remove the empty loader bubble if exists
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && lastMsg.content === '') {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbot-widget-container">
      {/* Floating Message */}
      <AnimatePresence mode="wait">
        {!isOpen && (
          <motion.div
            key={floatingMsgIndex}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              bottom: '85px',
              right: '25px',
              background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.15) 0%, rgba(0, 0, 0, 0.4) 100%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(0, 255, 255, 0.3)',
              padding: '8px 16px',
              borderRadius: '20px',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: '500',
              pointerEvents: 'none',
              boxShadow: '0 4px 15px rgba(0, 255, 255, 0.2)',
              whiteSpace: 'nowrap',
              zIndex: 9999
            }}
          >
            {FLOATING_MESSAGES[floatingMsgIndex]}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button 
        className="chatbot-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={!isOpen ? {
          scale: [1, 1.15, 1],
          boxShadow: [
            "0px 0px 0px rgba(0, 255, 255, 0)",
            "0px 0px 20px rgba(0, 255, 255, 0.6)",
            "0px 0px 0px rgba(0, 255, 255, 0)"
          ]
        } : {}}
        transition={!isOpen ? {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        } : {}}
        aria-label="Open Help Chatbot"
      >
        {isOpen ? <X size={24} /> : <Bot size={24} />}
      </motion.button>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="chatbot-window glass-panel"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="chatbot-header">
              <div className="chatbot-title-area">
                <div className="chatbot-avatar">
                  <Bot size={18} color="#00ffff" />
                </div>
                <div>
                  <h4>TANSY</h4>
                  <span className="online-badge">online</span>
                </div>
              </div>
              <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Content Area */}
            <div className="chatbot-body" ref={scrollRef}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`chat-bubble-wrapper ${msg.role}`}>
                  {msg.role === 'assistant' && (
                    <div className="chat-bubble-avatar">
                      <Bot size={14} />
                    </div>
                  )}
                  <div className={`chat-bubble ${msg.role}`}>
                    {renderFormattedMessage(msg.content)}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="chat-bubble-wrapper assistant">
                  <div className="chat-bubble-avatar">
                    <Bot size={14} />
                  </div>
                  <div className="chat-bubble assistant typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}

              {error && (
                <div className="chat-error-message">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Suggestion Chips */}
            {messages.length === 1 && !isTyping && (
              <div className="chatbot-suggestions">
                <div className="suggestions-header">
                  <Sparkles size={12} className="text-cyan" /> Suggested questions:
                </div>
                <div className="suggestions-list">
                  {SUGGESTIONS.map((sug, i) => (
                    <button 
                      key={i} 
                      className="suggestion-chip"
                      onClick={() => handleSend(sug)}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Footer */}
            <div className="chatbot-footer">
              <textarea 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask TANSAM Assistant..."
                rows={1}
                disabled={isTyping}
              />
              <button 
                className="chatbot-send-btn"
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isTyping}
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
