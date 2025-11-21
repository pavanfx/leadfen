import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Send, Copy, MessageSquare, Mail, Phone, ChevronDown, Sparkles, Instagram, Check } from 'lucide-react';
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
      case MessageType.INSTAGRAM:
        // Try to extract username from URL
        let username = '';
        try {
          const urlObj = new URL(lead.instagram);
          const pathParts = urlObj.pathname.split('/').filter(Boolean);
          if (pathParts.length > 0) {
            username = pathParts[0];
          }
        } catch (e) {
          console.error("Could not parse Instagram URL", e);
        }

        if (username) {
          url = `https://ig.me/m/${username}`;
        } else {
          url = lead.instagram;
        }

        // Auto-copy for Instagram since we can't pre-fill
        navigator.clipboard.writeText(content.body);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
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
    switch (type) {
      case MessageType.EMAIL: return <Mail className="w-5 h-5" />;
      case MessageType.WHATSAPP: return <Phone className="w-5 h-5" />;
      case MessageType.INSTAGRAM: return <Instagram className="w-5 h-5" />;
      default: return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getColor = () => {
    switch (type) {
      case MessageType.EMAIL: return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case MessageType.WHATSAPP: return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case MessageType.INSTAGRAM: return 'text-pink-600 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400';
      default: return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400';
    }
  };

  const getActionLabel = () => {
    switch (type) {
      case MessageType.EMAIL: return 'Open Mail App';
      case MessageType.WHATSAPP: return 'Open WhatsApp';
      case MessageType.INSTAGRAM: return 'Copy & Open Insta';
      default: return 'Open SMS App';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Overlay for clicking outside */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="bg-white dark:bg-slate-900 w-full sm:w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden transform transition-all max-h-[90vh] sm:max-h-[85vh] flex flex-col relative animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300 border border-slate-200 dark:border-slate-800">

        {/* Mobile Drag Handle */}
        <div className="sm:hidden w-full flex justify-center pt-3 pb-1 bg-white dark:bg-slate-900" onClick={onClose}>
          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-2xl ${getColor()}`}>
              {getIcon()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Review Message
                {userConfig && <span className="text-[10px] px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 rounded-full border border-indigo-100 dark:border-indigo-500/20 font-bold uppercase tracking-wide">Personalized</span>}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[150px] sm:max-w-xs">To: <span className="font-medium text-slate-700 dark:text-slate-300">{lead.business_name}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50 flex-grow">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-indigo-500 animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg text-slate-700 dark:text-slate-200 font-bold animate-pulse">
                  Crafting the perfect hook...
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Analyzing {lead.industry} trends for {lead.business_name}
                </p>
              </div>
            </div>
          ) : (
            <>
              {type === MessageType.EMAIL && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Subject Line</label>
                  <input
                    type="text"
                    value={content.subject}
                    onChange={(e) => setContent({ ...content, subject: e.target.value })}
                    className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white font-medium placeholder-slate-400 shadow-sm"
                    placeholder="Subject line..."
                  />
                </div>
              )}

              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '0.1s' }}>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">Message Content</label>
                <div className="relative group">
                  <textarea
                    value={content.body}
                    onChange={(e) => setContent({ ...content, body: e.target.value })}
                    rows={type === MessageType.EMAIL ? 12 : 8}
                    className="w-full p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-900 dark:text-white leading-relaxed resize-none text-base placeholder-slate-400 shadow-sm font-sans"
                    placeholder="AI generated message will appear here..."
                  ></textarea>
                  <div className="absolute bottom-4 right-4 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="w-5 h-5 text-indigo-300 dark:text-indigo-600" />
                  </div>
                </div>
                <div className="flex justify-between px-1">
                  <p className="text-[10px] text-slate-400 font-medium">
                    AI Generated • Editable
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {content.body.length} chars
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center flex-shrink-0 pb-safe z-10">
          <div className="flex space-x-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="p-3.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-slate-200 dark:border-slate-700 disabled:opacity-50 active:scale-95"
              title="Regenerate Message"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleCopy}
              disabled={loading}
              className="p-3.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-200 dark:border-slate-700 disabled:opacity-50 flex items-center active:scale-95"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={loading}
            className={`flex items-center space-x-2.5 px-8 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed
              ${type === MessageType.WHATSAPP ? 'bg-green-600 hover:bg-green-700 shadow-green-500/20' :
                type === MessageType.EMAIL ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' :
                  type === MessageType.INSTAGRAM ? 'bg-pink-600 hover:bg-pink-700 shadow-pink-500/20' :
                    'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
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