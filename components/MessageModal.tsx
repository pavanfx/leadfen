import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Send, Copy, MessageSquare, Mail, Phone, ChevronDown, Sparkles } from 'lucide-react';
import { Lead, MessageType, UserConfig } from '../types';
import { generateOutreachMessage } from '../services/geminiService';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  type: MessageType;
  userConfig: UserConfig | null;
}

const MessageModal: React.FC<MessageModalProps> = ({ isOpen, onClose, lead, type, userConfig }) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState({ subject: '', body: '' });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      handleGenerate();
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, lead, type]);

  const handleGenerate = async () => {
    setLoading(true);
    // Clear previous content but keep structure
    setContent(prev => ({ ...prev, body: '' }));
    
    const response = await generateOutreachMessage(lead, type, userConfig || undefined);
    setContent({
      subject: response.subject || '',
      body: response.body
    });
    setLoading(false);
  };

  const handleSend = () => {
    let url = '';
    const encodedBody = encodeURIComponent(content.body);
    const cleanPhone = lead.business_phone ? lead.business_phone.replace(/[^\d+]/g, '') : '';

    switch (type) {
      case MessageType.EMAIL:
        const subject = encodeURIComponent(content.subject);
        url = `mailto:${lead.business_email}?subject=${subject}&body=${encodedBody}`;
        break;
      case MessageType.WHATSAPP:
        // If phone starts with +, keep it, otherwise assume it might need country code or just pass as is
        url = `https://wa.me/${cleanPhone}?text=${encodedBody}`;
        break;
      case MessageType.SMS:
        // iOS uses '&' for body, Android often '?' but '?' usually works for first param
        const ua = navigator.userAgent.toLowerCase();
        const separator = (ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1) ? '&' : '?';
        url = `sms:${cleanPhone}${separator}body=${encodedBody}`;
        break;
    }
    window.open(url, '_blank');
  };

  const handleCopy = () => {
    const textToCopy = type === MessageType.EMAIL 
      ? `Subject: ${content.subject}\n\n${content.body}`
      : content.body;
      
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const getIcon = () => {
    switch(type) {
      case MessageType.EMAIL: return <Mail className="w-5 h-5" />;
      case MessageType.WHATSAPP: return <Phone className="w-5 h-5" />;
      default: return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getColor = () => {
    switch(type) {
      case MessageType.EMAIL: return 'text-blue-600 bg-blue-100';
      case MessageType.WHATSAPP: return 'text-green-600 bg-green-100';
      default: return 'text-indigo-600 bg-indigo-100';
    }
  };

  const getActionLabel = () => {
    switch(type) {
      case MessageType.EMAIL: return 'Open Mail App';
      case MessageType.WHATSAPP: return 'Open WhatsApp';
      default: return 'Open SMS App';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Overlay for clicking outside */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="bg-white w-full sm:w-full max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden transform transition-all max-h-[90vh] sm:max-h-[85vh] flex flex-col relative animate-slide-up sm:animate-scale-up">
        
        {/* Mobile Drag Handle */}
        <div className="sm:hidden w-full flex justify-center pt-3 pb-1" onClick={onClose}>
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-5 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getColor()}`}>
              {getIcon()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Review Message
                {userConfig && <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">Personalized</span>}
              </h3>
              <p className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-xs">To: {lead.business_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5 hidden sm:block" />
            <ChevronDown className="w-6 h-6 block sm:hidden" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium animate-pulse text-center">
                Analysing lead data...<br/>
                <span className="text-xs text-gray-400 font-normal">Crafting hooks for {lead.business_name}</span>
              </p>
            </div>
          ) : (
            <>
              {type === MessageType.EMAIL && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Subject</label>
                  <input 
                    type="text" 
                    value={content.subject}
                    onChange={(e) => setContent({...content, subject: e.target.value})}
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 font-medium placeholder-gray-400"
                    placeholder="Subject line..."
                  />
                </div>
              )}
              
              <div className="space-y-1.5 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Message Content</label>
                <div className="relative">
                  <textarea 
                    value={content.body}
                    onChange={(e) => setContent({...content, body: e.target.value})}
                    rows={type === MessageType.EMAIL ? 8 : 5}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900 leading-relaxed resize-none text-base placeholder-gray-400"
                    placeholder="AI generated message will appear here..."
                  ></textarea>
                  <div className="absolute bottom-3 right-3 pointer-events-none">
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 text-right px-1">
                  {content.body.length} characters
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center flex-shrink-0 pb-safe">
          <div className="flex space-x-2">
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="p-3 sm:px-4 sm:py-2.5 rounded-xl text-gray-600 hover:bg-white hover:shadow-sm hover:text-indigo-600 transition-all border border-transparent hover:border-gray-200 disabled:opacity-50 bg-transparent sm:bg-white sm:border-gray-200 sm:shadow-sm"
              title="Regenerate Message"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button 
              onClick={handleCopy}
              disabled={loading}
              className="p-3 sm:px-4 sm:py-2.5 rounded-xl text-gray-600 hover:bg-white hover:shadow-sm hover:text-gray-900 transition-all border border-transparent hover:border-gray-200 disabled:opacity-50 flex items-center bg-transparent sm:bg-white sm:border-gray-200 sm:shadow-sm"
              title="Copy to clipboard"
            >
              {copied ? <span className="font-bold text-green-600">Copied!</span> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          <button 
            onClick={handleSend}
            disabled={loading}
            className={`flex items-center space-x-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed
              ${type === MessageType.WHATSAPP ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 
                type === MessageType.EMAIL ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 
                'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
              }
            `}
          >
            <Send className="w-4 h-4" />
            <span>{getActionLabel()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;