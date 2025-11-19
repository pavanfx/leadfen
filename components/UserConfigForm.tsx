import React, { useState, useEffect } from 'react';
import { UserConfig } from '../types';
import { Sparkles, Save, Edit2, Briefcase, Building2, Wand2 } from 'lucide-react';
import { optimizeServiceDescription } from '../services/geminiService';

interface UserConfigFormProps {
  existingConfig: UserConfig | null;
  onSave: (config: UserConfig) => void;
}

const UserConfigForm: React.FC<UserConfigFormProps> = ({ existingConfig, onSave }) => {
  const [isEditing, setIsEditing] = useState(!existingConfig);
  const [orgName, setOrgName] = useState(existingConfig?.orgName || '');
  const [services, setServices] = useState(existingConfig?.services || '');
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    if (existingConfig) {
      setOrgName(existingConfig.orgName);
      setServices(existingConfig.services);
      setIsEditing(false);
    }
  }, [existingConfig]);

  const handleOptimize = async () => {
    if (!services) return;
    setOptimizing(true);
    const optimizedText = await optimizeServiceDescription(services);
    setServices(optimizedText);
    setOptimizing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orgName && services) {
      onSave({ orgName, services });
      setIsEditing(false);
    }
  };

  if (!isEditing && existingConfig) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-indigo-100 shadow-sm mb-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-gray-900 font-bold text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              {existingConfig.orgName}
            </h3>
            <div className="mt-2 text-sm text-gray-600 leading-relaxed flex gap-2">
              <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
              <p>{existingConfig.services}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
            aria-label="Edit details"
          >
            <Edit2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8 animate-fade-in">
      <div className="flex items-center gap-2 mb-4 text-gray-900 font-bold text-lg">
        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
          <Sparkles className="w-5 h-5" />
        </div>
        <h2>Setup Your Profile</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        We'll use this to personalize your AI outreach messages.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Organization Name
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-gray-900 placeholder-gray-400"
              placeholder="e.g. Acme Marketing"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            What services do you sell?
          </label>
          <div className="relative">
            <textarea
              value={services}
              onChange={(e) => setServices(e.target.value)}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px] text-gray-900 placeholder-gray-400"
              placeholder="e.g. We make websites and do SEO..."
              required
            />
            <div className="absolute bottom-3 right-3">
              <button
                type="button"
                onClick={handleOptimize}
                disabled={!services || optimizing}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50"
              >
                {optimizing ? (
                  <span className="animate-spin">⌛</span>
                ) : (
                  <Wand2 className="w-3.5 h-3.5" />
                )}
                {optimizing ? 'Optimizing...' : 'Optimize with AI'}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
            Tip: Use the AI button to rewrite your services professionally.
          </p>
        </div>

        <button
          type="submit"
          disabled={!orgName || !services}
          className="w-full mt-2 flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
        >
          <Save className="w-5 h-5" />
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default UserConfigForm;