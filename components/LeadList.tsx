import React, { useState } from 'react';
import { Lead, MessageType, UserConfig } from '../types';
import { MapPin, Phone, Mail, MessageCircle, Smartphone, ChevronLeft, ExternalLink, Facebook, Instagram, Globe, Trash2, CheckSquare, Square, Filter, Send, MoreHorizontal } from 'lucide-react';
import MessageModal from './MessageModal';

interface LeadListProps {
  leads: Lead[];
  onBack: () => void;
  userConfig: UserConfig | null;
  onStatusChange: (leadId: string, newStatus: 'sent' | 'not_sent') => void;
  onDelete: (leadIds: string[]) => void;
}

const LeadList: React.FC<LeadListProps> = ({ leads, onBack, userConfig, onStatusChange, onDelete }) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [actionType, setActionType] = useState<MessageType | null>(null);
  const [activeTab, setActiveTab] = useState<'not_sent' | 'sent'>('not_sent');
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  const filteredLeads = leads.filter(lead => {
    const status = lead.status || 'not_sent';
    return status === activeTab;
  });

  const toggleSelectLead = (id: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLeads(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(l => l.id)));
    }
  };

  const handleBulkDelete = () => {
    onDelete(Array.from(selectedLeads));
    setSelectedLeads(new Set());
  };

  const handleClearAllSent = () => {
    const sentIds = leads.filter(l => l.status === 'sent').map(l => l.id);
    if (sentIds.length > 0) {
      onDelete(sentIds);
    }
  };

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
        className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-600 hover:shadow-md transition-all duration-300 ${colorClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {icon}
      </a>
    );
  };

  return (
    <div className="container mx-auto pb-32">
      {/* Sticky Header */}
      <div className="sticky top-[64px] z-30 backdrop-blur-xl bg-slate-50/80 dark:bg-slate-900/80 -mx-4 px-4 py-4 mb-8 border-b border-slate-200/50 dark:border-slate-800/50 transition-all">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2.5 -ml-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm active:scale-95 text-slate-600 dark:text-slate-300 transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">My Leads</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                {leads.length} businesses loaded
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {/* Tabs */}
            <div className="flex p-1.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl backdrop-blur-sm">
              <button
                onClick={() => { setActiveTab('not_sent'); setSelectedLeads(new Set()); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'not_sent'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm scale-[1.02]'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
              >
                <span>To Contact</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] ${activeTab === 'not_sent' ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  {leads.filter(l => (l.status || 'not_sent') === 'not_sent').length}
                </span>
              </button>
              <button
                onClick={() => { setActiveTab('sent'); setSelectedLeads(new Set()); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'sent'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm scale-[1.02]'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
              >
                <span>Sent</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] ${activeTab === 'sent' ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  {leads.filter(l => l.status === 'sent').length}
                </span>
              </button>
            </div>

            {/* Bulk Actions */}
            {activeTab === 'sent' && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                <button
                  onClick={toggleSelectAll}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:shadow-sm active:scale-95"
                  title="Select All"
                >
                  {selectedLeads.size === filteredLeads.length && filteredLeads.length > 0 ? <CheckSquare className="w-5 h-5 text-indigo-500" /> : <Square className="w-5 h-5" />}
                </button>

                {selectedLeads.size > 0 ? (
                  <button
                    onClick={handleBulkDelete}
                    className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all hover:shadow-sm active:scale-95"
                    title="Delete Selected"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                ) : (
                  filteredLeads.length > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to clear ALL sent leads?')) {
                          handleClearAllSent();
                        }
                      }}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      title="Clear All Sent"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeads.map((lead, index) => (
          <div
            key={lead.id}
            onClick={() => activeTab === 'sent' && toggleSelectLead(lead.id)}
            className={`group relative bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 border transition-all duration-300 flex flex-col h-full ${selectedLeads.has(lead.id)
              ? 'border-indigo-500 ring-2 ring-indigo-500/20 dark:border-indigo-400 dark:ring-indigo-400/20'
              : 'border-white/20 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-800'
              }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Card Header */}
            <div className="flex justify-between items-start mb-5">
              <div className="flex-1 min-w-0 mr-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  {activeTab === 'sent' && (
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-200 ${selectedLeads.has(lead.id)
                      ? 'bg-indigo-600 border-indigo-600 scale-110'
                      : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800'
                      }`}>
                      {selectedLeads.has(lead.id) && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                    </div>
                  )}
                  {lead.industry && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-500/20">
                      {lead.industry}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight break-words group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {lead.business_name}
                </h3>
              </div>

              {lead.website && (
                <a
                  href={lead.website}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-shrink-0 p-2.5 text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:text-white hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/30"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Details */}
            <div className="space-y-3.5 mb-8 flex-grow">
              {(lead.city || lead.country) && (
                <div className="flex items-start text-sm text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4 mr-3 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                  <span className="leading-tight font-medium">{[lead.city, lead.country].filter(Boolean).join(', ')}</span>
                </div>
              )}

              {lead.business_phone ? (
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <Phone className="w-4 h-4 mr-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-lg text-slate-700 dark:text-slate-300 font-semibold tracking-wide">{lead.business_phone}</span>
                </div>
              ) : (
                <div className="flex items-center text-sm text-slate-400">
                  <Phone className="w-4 h-4 mr-3 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                  <span className="italic text-xs">No phone available</span>
                </div>
              )}

              {lead.business_email ? (
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                  <Mail className="w-4 h-4 mr-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <span className="truncate max-w-[200px] font-medium" title={lead.business_email}>{lead.business_email}</span>
                </div>
              ) : (
                <div className="flex items-center text-sm text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4 mr-3 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                  <span className="italic text-xs">No email available</span>
                </div>
              )}

              {/* Social Icons Row */}
              {(lead.instagram || lead.facebook || lead.tiktok) && (
                <div className="flex items-center space-x-2 pt-4 mt-2 border-t border-slate-100 dark:border-slate-700/50">
                  {renderSocial(lead.instagram, <Instagram className="w-4 h-4" />, "text-pink-600")}
                  {renderSocial(lead.facebook, <Facebook className="w-4 h-4" />, "text-blue-600")}
                  {renderSocial(lead.tiktok, <span className="text-[10px] font-bold">Tk</span>, "text-black dark:text-white")}
                </div>
              )}
            </div>

            {/* 4 Action Buttons */}
            <div className="grid grid-cols-4 gap-2 mt-auto">
              <button
                onClick={(e) => { e.stopPropagation(); handleAction(lead, MessageType.SMS); }}
                disabled={!lead.business_phone}
                className="group/btn flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed h-[5rem]"
              >
                <div className="p-2 rounded-xl bg-white dark:bg-slate-700 text-indigo-500 dark:text-indigo-400 mb-1.5 shadow-sm group-hover/btn:scale-110 group-hover/btn:bg-indigo-500 group-hover/btn:text-white transition-all duration-300">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover/btn:text-indigo-600 dark:group-hover/btn:text-indigo-300">SMS</span>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handleAction(lead, MessageType.EMAIL); }}
                disabled={!lead.business_email}
                className="group/btn flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed h-[5rem]"
              >
                <div className="p-2 rounded-xl bg-white dark:bg-slate-700 text-blue-500 dark:text-blue-400 mb-1.5 shadow-sm group-hover/btn:scale-110 group-hover/btn:bg-blue-500 group-hover/btn:text-white transition-all duration-300">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover/btn:text-blue-600 dark:group-hover/btn:text-blue-300">Email</span>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handleAction(lead, MessageType.WHATSAPP); }}
                disabled={!lead.business_phone}
                className="group/btn flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-green-200 dark:hover:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed h-[5rem]"
              >
                <div className="p-2 rounded-xl bg-white dark:bg-slate-700 text-green-500 dark:text-green-400 mb-1.5 shadow-sm group-hover/btn:scale-110 group-hover/btn:bg-green-500 group-hover/btn:text-white transition-all duration-300">
                  <Smartphone className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover/btn:text-green-600 dark:group-hover/btn:text-green-300">WA</span>
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); handleAction(lead, MessageType.INSTAGRAM); }}
                disabled={!lead.instagram}
                className="group/btn flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-pink-200 dark:hover:border-pink-800 hover:bg-pink-50 dark:hover:bg-pink-900/20 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed h-[5rem]"
              >
                <div className="p-2 rounded-xl bg-white dark:bg-slate-700 text-pink-500 dark:text-pink-400 mb-1.5 shadow-sm group-hover/btn:scale-110 group-hover/btn:bg-pink-500 group-hover/btn:text-white transition-all duration-300">
                  <Instagram className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 group-hover/btn:text-pink-600 dark:group-hover/btn:text-pink-300">Insta</span>
              </button>
            </div>

            {/* Mark as Sent Button */}
            {activeTab === 'not_sent' && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(lead.id, 'sent');
                  }}
                  className="w-full py-3 bg-slate-900 dark:bg-white hover:bg-indigo-600 dark:hover:bg-indigo-400 text-white dark:text-slate-900 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center space-x-2 active:scale-[0.98] shadow-lg shadow-slate-900/10 dark:shadow-white/5"
                >
                  <span>Mark as Sent</span>
                  <CheckSquare className="w-4 h-4" />
                </button>
              </div>
            )}
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