import React, { useState } from 'react';
import { INITIAL_CHAT_MESSAGES } from '../data/campusState';

export default function ChatView({ activeRide, onBack, currentUser }) {
  const [messages, setMessages] = useState(INITIAL_CHAT_MESSAGES);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: `m_${Date.now()}`,
      sender: currentUser?.name || 'You',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDriver: false
    };

    setMessages([...messages, newMsg]);
    setInputText('');

    // Simulate auto-reply from driver after 1.5s
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `m_rep_${Date.now()}`,
          sender: activeRide?.driverName || 'Driver',
          text: 'Thanks for the update! See you there in 2 minutes.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isDriver: true
        }
      ]);
    }, 1500);
  };

  return (
    <div className="px-4 py-3 flex flex-col h-[calc(100vh-140px)] max-w-xl mx-auto pb-20">
      
      {/* Top Ride Banner */}
      <div className="bg-surface-container-lowest p-3 rounded-2xl border border-surface-container-high shadow-sm flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>

          <div>
            <div className="font-headline font-bold text-sm text-on-surface">
              {activeRide?.driverName || 'Campus Driver'}
            </div>
            <div className="text-[11px] text-secondary truncate max-w-[200px]">
              {activeRide?.route || 'Campus Route'}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1 font-label-sm font-bold text-primary text-xs">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse"></span>
            Online
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-2 text-secondary">
            <span className="material-symbols-outlined text-4xl opacity-30">chat_bubble_outline</span>
            <p className="font-headline font-bold text-xs text-on-surface">No messages yet</p>
            <p className="text-[11px] max-w-xs">Send a message to coordinate pickup location and timing with your driver.</p>
          </div>
        ) : (
          messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.isDriver ? 'items-start' : 'items-end'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-xs ${
                msg.isDriver
                  ? 'bg-surface-container text-on-surface rounded-tl-sm'
                  : 'bg-primary text-on-primary rounded-tr-sm shadow-sm'
              }`}
            >
              <div className="font-bold text-[10px] mb-0.5 opacity-75">
                {msg.sender}
              </div>
              <p className="leading-relaxed">{msg.text}</p>
            </div>
            <span className="text-[10px] text-secondary mt-0.5 px-1 font-mono">
              {msg.time}
            </span>
          </div>
        )))}
      </div>

      {/* Quick Coordination Reply Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 scrollbar-none">
        {[
          "👋 I'm at the pickup spot",
          "⏱️ Running 2 mins late",
          "📍 Near Gate 1",
          "🚗 Look for the hybrid",
          "👍 Sounds good!"
        ].map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => setInputText(chip)}
            className="px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface hover:bg-surface-container border border-surface-container text-[11px] font-medium whitespace-nowrap transition-colors"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSendMessage} className="mt-1.5 flex items-center gap-2 bg-surface-container-lowest p-2 rounded-2xl border border-surface-container-high shadow-sm">
        <input
          id="chat-input"
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Message driver about pickup..."
          className="flex-1 bg-transparent border-0 outline-none text-xs text-on-surface px-2 placeholder:text-secondary"
        />
        <button
          type="submit"
          className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center hover:bg-primary-fixed-dim transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">send</span>
        </button>
      </form>

    </div>
  );
}
