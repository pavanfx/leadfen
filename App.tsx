import React, { useState, useEffect } from 'react';
import { Sparkles, Database, History, Trash2 } from 'lucide-react';
import FileUpload from './components/FileUpload';
import LeadList from './components/LeadList';
import UserConfigForm from './components/UserConfigForm';
import { LeadData, UserConfig } from './types';

const App: React.FC = () => {
  const [data, setData] = useState<LeadData | null>(null);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null);

  useEffect(() => {
    checkSavedData();
    checkUserConfig();
  }, []);

  const checkSavedData = () => {
    const saved = localStorage.getItem('leadGeniusData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.leads && parsed.leads.length > 0) {
          setHasSavedData(true);
          setSavedCount(parsed.leads.length);
        }
      } catch (e) {
        console.error("Error parsing saved data");
        localStorage.removeItem('leadGeniusData');
      }
    } else {
      setHasSavedData(false);
      setSavedCount(0);
    }
  };

  const checkUserConfig = () => {
    const savedConfig = localStorage.getItem('leadGeniusConfig');
    if (savedConfig) {
      try {
        setUserConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Error parsing config");
      }
    }
  };

  const handleSaveConfig = (config: UserConfig) => {
    setUserConfig(config);
    localStorage.setItem('leadGeniusConfig', JSON.stringify(config));
  };

  const handleDataLoaded = (uploadedData: LeadData) => {
    // Initialize status for new leads if not present
    const leadsWithStatus = uploadedData.leads.map(lead => ({
      ...lead,
      status: lead.status || 'not_sent'
    }));

    const newData = { ...uploadedData, leads: leadsWithStatus };
    setData(newData);
    localStorage.setItem('leadGeniusData', JSON.stringify(newData));
    setHasSavedData(true);
    setSavedCount(newData.leads.length);
  };

  const handleLeadStatusChange = (leadId: string, newStatus: 'sent' | 'not_sent') => {
    if (!data) return;

    const updatedLeads = data.leads.map(lead =>
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    );

    const updatedData = { ...data, leads: updatedLeads };
    setData(updatedData);
    localStorage.setItem('leadGeniusData', JSON.stringify(updatedData));
  };

  const handleLoadSaved = () => {
    const saved = localStorage.getItem('leadGeniusData');
    if (saved) {
      setData(JSON.parse(saved));
    }
  };

  const handleClearSaved = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to clear your saved list?')) {
      localStorage.removeItem('leadGeniusData');
      setHasSavedData(false);
      setSavedCount(0);
      setData(null);
    }
  };

  const handleBack = () => {
    setData(null);
    checkSavedData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 pb-safe">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm safe-top">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2" onClick={() => setData(null)}>
            <div className="bg-indigo-600 p-1.5 sm:p-2 rounded-lg cursor-pointer">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight cursor-pointer">
              LeadGenius<span className="text-indigo-600">AI</span>
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-6 text-sm font-medium text-gray-500">
            {process.env.API_KEY ? (
              <span className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] sm:text-xs font-bold">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span>ONLINE</span>
              </span>
            ) : (
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] sm:text-xs font-bold">KEY MISSING</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col w-full max-w-5xl mx-auto">
        {!data ? (
          <div className="flex-grow flex flex-col items-center justify-start px-4 py-8 sm:py-12 animate-in fade-in duration-500">
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
                Mobile Lead <br className="block sm:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Automation</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-500 max-w-md mx-auto leading-relaxed px-2">
                Upload leads and generate AI outreach messages customized for your business.
              </p>
            </div>

            <div className="w-full max-w-xl space-y-6">
              {/* User Profile Config Section */}
              <UserConfigForm
                existingConfig={userConfig}
                onSave={handleSaveConfig}
              />

              {/* Only show upload options if config is set (or you can allow it regardless, but contextual flow is better) */}
              <div className={`transition-all duration-500 ${!userConfig ? 'opacity-50 pointer-events-none filter grayscale' : 'opacity-100'}`}>
                <FileUpload onDataLoaded={handleDataLoaded} />

                {hasSavedData && (
                  <div className="relative group mt-6">
                    <button
                      onClick={handleLoadSaved}
                      className="w-full bg-white p-5 rounded-2xl border-2 border-indigo-100 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all flex items-center justify-between group active:scale-[0.98]"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                          <History className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-gray-900 text-lg">Resume Session</h3>
                          <p className="text-gray-500 text-sm">Continue with {savedCount} saved leads</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-indigo-600 font-medium text-sm hidden sm:inline">Open List</span>
                        <div
                          onClick={handleClearSaved}
                          className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
                          title="Clear saved data"
                        >
                          <Trash2 className="w-5 h-5" />
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Demo Data Helper */}
              <div className="mt-8 p-4 bg-slate-100 rounded-xl border border-slate-200 w-full">
                <div className="flex items-center space-x-2 mb-2">
                  <Database className="w-4 h-4 text-slate-500" />
                  <p className="text-xs font-bold text-slate-500 uppercase">JSON Format</p>
                </div>
                <pre className="bg-white text-slate-600 p-3 rounded-lg text-[10px] sm:text-xs overflow-x-auto border border-slate-200 font-mono leading-relaxed">
                  {`[
  {
    "business_name": "Cafe Miami",
    "business_phone": "(555) 123-4567",
    "industry": "Hospitality",
    "city": "Miami"
  }
]`}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-500 h-full">
            <LeadList
              leads={data.leads}
              onBack={handleBack}
              userConfig={userConfig}
              onStatusChange={handleLeadStatusChange}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;