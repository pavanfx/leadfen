import React, { useState } from 'react';
import { Lead, MessageType, UserConfig } from '../types';
import { MapPin, Phone, Mail, MessageCircle, Smartphone, ChevronLeft, ExternalLink, Facebook, Instagram, Globe } from 'lucide-react';
import MessageModal from './MessageModal';

interface LeadListProps {
  leads: Lead[];
  onBack: () => void;
  userConfig: UserConfig | null;
}

const LeadList: React.FC<LeadListProps> = ({ leads, onBack, userConfig }) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [actionType, setActionType] = useState<MessageType | null>(null);

  const handleAction = (lead: Lead, type: MessageType) => {
    setSelectedLead(lead);
    setActionType(type);
  };

  const closeAction = () => {
    setSelectedLead(null);
    setActionType(null);
  };

  // Helper to render social link if it exists
  const renderSocial = (url: string, icon: React.ReactNode, colorClass: string) => {
    if (!url) return null;
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noreferrer" 
        className={`p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors ${colorClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {icon}
      </a>
    );
  };

  return (
    <div className="container mx-auto px-4 py-4 pb-32">
      {/* Sticky Mobile Header */}
      <div className="sticky top-[56px] sm:top-[64px] z-20 bg-slate-50/95 backdrop-blur-md -mx-4 px-4 py-3 border-b border-gray-200/50 sm:border-none sm:static sm:bg-transparent sm:mx-0 sm:p-0 mb-6 flex items-center justify-between transition-all">
        <div className="flex items-center space-x-2">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-white active:bg-gray-200 text-gray-600 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Leads</h2>
            <p className="text-xs text-gray-500 font-medium">{leads.length} businesses</p>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leads.map((lead) => (
          <div 
            key={lead.id} 
            className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col h-full transition-all active:scale-[0.995]"
          >
            {/* Card Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 min-w-0 mr-3">
                <div className="flex flex-wrap gap-2 mb-1.5">
                  {lead.industry && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-indigo-50 text-indigo-600">
                      {lead.industry}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight break-words">{lead.business_name}</h3>
              </div>
              
              {lead.website && (
                <a 
                  href={lead.website} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-shrink-0 p-2 text-gray-400 bg-gray-50 rounded-full hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Details */}
            <div className="space-y-3 mb-6 flex-grow">
              {(lead.city || lead.country) && (
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2.5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="leading-tight">{[lead.city, lead.country].filter(Boolean).join(', ')}</span>
                </div>
              )}
              
              {lead.business_phone ? (
                 <div className="flex items-center text-sm text-gray-600">
                   <Phone className="w-4 h-4 mr-2.5 text-gray-400 flex-shrink-0" />
                   <span className="font-mono text-xs bg-gray-50 px-1.5 py-0.5 rounded text-gray-700 font-medium tracking-wide">{lead.business_phone}</span>
                 </div>
              ) : (
                <div className="flex items-center text-sm text-gray-400">
                   <Phone className="w-4 h-4 mr-2.5 text-gray-300 flex-shrink-0" />
                   <span className="italic text-xs">No phone available</span>
                 </div>
              )}
              
              {lead.business_email ? (
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate max-w-[200px]" title={lead.business_email}>{lead.business_email}</span>
                </div>
              ) : (
                <div className="flex items-center text-sm text-gray-400">
                  <Mail className="w-4 h-4 mr-2.5 text-gray-300 flex-shrink-0" />
                  <span className="italic text-xs">No email available</span>
                </div>
              )}

              {/* Social Icons Row */}
              {(lead.instagram || lead.facebook || lead.tiktok) && (
                 <div className="flex items-center space-x-1 pt-3 mt-1">
                    {renderSocial(lead.instagram, <Instagram className="w-3.5 h-3.5" />, "text-pink-600")}
                    {renderSocial(lead.facebook, <Facebook className="w-3.5 h-3.5" />, "text-blue-600")}
                    {renderSocial(lead.tiktok, <span className="text-[10px] font-bold">Tk</span>, "text-black")}
                 </div>
              )}
            </div>

            {/* 3 Action Buttons */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-50 mt-auto">
              <button 
                onClick={() => handleAction(lead, MessageType.SMS)}
                disabled={!lead.business_phone}
                className="group flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/50 active:bg-indigo-50 text-gray-600 active:text-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation h-[4.5rem]"
              >
                <div className="p-1.5 rounded-full bg-indigo-50 text-indigo-600 mb-1 group-disabled:bg-gray-100 group-disabled:text-gray-400">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide">Message</span>
              </button>
              
              <button 
                onClick={() => handleAction(lead, MessageType.EMAIL)}
                disabled={!lead.business_email}
                className="group flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-gray-100 hover:border-blue-100 hover:bg-blue-50/50 active:bg-blue-50 text-gray-600 active:text-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation h-[4.5rem]"
              >
                 <div className="p-1.5 rounded-full bg-blue-50 text-blue-600 mb-1 group-disabled:bg-gray-100 group-disabled:text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide">Email</span>
              </button>
              
              <button 
                onClick={() => handleAction(lead, MessageType.WHATSAPP)}
                disabled={!lead.business_phone}
                className="group flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-gray-100 hover:border-green-100 hover:bg-green-50/50 active:bg-green-50 text-gray-600 active:text-green-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation h-[4.5rem]"
              >
                 <div className="p-1.5 rounded-full bg-green-50 text-green-600 mb-1 group-disabled:bg-gray-100 group-disabled:text-gray-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide">WhatsApp</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedLead && actionType && (
        <MessageModal
          isOpen={!!selectedLead}
          onClose={closeAction}
          lead={selectedLead}
          type={actionType}
          userConfig={userConfig}
        />
      )}
    </div>
  );
};

export default LeadList;