import React, { useState, useEffect } from 'react';
import { Sparkles, Database, History, Trash2, ChevronLeft } from 'lucide-react';
import FileUpload from './components/FileUpload';
import LeadList from './components/LeadList';
import UserConfigForm from './components/UserConfigForm';
import ThemeToggle from './components/ThemeToggle';
import { LeadData, UserConfig } from './types';

const App: React.FC = () => {
  const [data, setData] = useState<LeadData | null>(null);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [userConfig, setUserConfig] = useState<UserConfig | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    checkSavedData();
    checkUserConfig();
    checkTheme();
  }, []);

  const checkTheme = () => {
    const savedTheme = localStorage.getItem('leadGeniusTheme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('leadGeniusTheme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

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
    const newLeads = uploadedData.leads.map(lead => ({
      ...lead,
      status: lead.status || 'not_sent'
    }));

    // Get existing data
    let existingLeads: any[] = [];
    const saved = localStorage.getItem('leadGeniusData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.leads) {
          existingLeads = parsed.leads;
        }
      } catch (e) {
        console.error("Error parsing saved data for accumulation");
      }
    }

    // Combine new leads (on top) with existing leads
    const allLeads = [...newLeads, ...existingLeads];

    const newData = { ...uploadedData, leads: allLeads };
    setData(newData);
    localStorage.setItem('leadGeniusData', JSON.stringify(newData));
    setHasSavedData(true);
    setSavedCount(allLeads.length);
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

  const handleDeleteLeads = (leadIds: string[]) => {
    if (!data) return;

    if (window.confirm(`Are you sure you want to delete ${leadIds.length} lead(s)?`)) {
      const updatedLeads = data.leads.filter(lead => !leadIds.includes(lead.id));
      const updatedData = { ...data, leads: updatedLeads };
      setData(updatedData);
      localStorage.setItem('leadGeniusData', JSON.stringify(updatedData));
      setSavedCount(updatedLeads.length);
    }
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-800/50 transition-all duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => setData(null)}>
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-lg"></div>
              <div className="relative bg-gradient-to-br from-indigo-600 to-blue-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-all group-hover:scale-105 active:scale-95">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                LeadGenius<span className="text-indigo-600 dark:text-indigo-400">AI</span>
              </h1>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase">Growth Engine</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex items-center px-3 py-1.5 bg-slate-100/50 dark:bg-slate-800/50 rounded-full border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
              <div className={`w-2 h-2 rounded-full mr-2 ${process.env.API_KEY ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {process.env.API_KEY ? 'System Online' : 'Key Missing'}
              </span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 z-10 relative">
        {!data ? (
          <div className="flex-grow flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center mb-12 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 blur-3xl -z-10 rounded-full transform scale-150"></div>
              <h2 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                Supercharge Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 animate-gradient-x">Outreach Workflow</span>
              </h2>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
                Transform raw leads into personalized, high-conversion messages in seconds using advanced AI.
              </p>
            </div>

            <div className="w-full max-w-xl space-y-8">
              {/* User Profile Config Section */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-1 shadow-2xl shadow-indigo-500/5 border border-white/20 dark:border-slate-700/30 ring-1 ring-slate-900/5 dark:ring-slate-100/5">
                <UserConfigForm
                  existingConfig={userConfig}
                  onSave={handleSaveConfig}
                />
              </div>

              <div className={`transition-all duration-700 delay-100 ${!userConfig ? 'opacity-50 pointer-events-none blur-sm' : 'opacity-100'}`}>
                <FileUpload onDataLoaded={handleDataLoaded} />

                {hasSavedData && (
                  <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500 delay-200">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl opacity-30 group-hover:opacity-60 blur transition duration-500"></div>
                      <button
                        onClick={handleLoadSaved}
                        className="relative w-full bg-white dark:bg-slate-900 p-6 rounded-2xl flex items-center justify-between group-active:scale-[0.99] transition-all duration-200"
                      >
                        <div className="flex items-center gap-5">
                          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <History className="w-7 h-7" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-1">Resume Session</h3>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">Continue with {savedCount} saved leads</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div
                            onClick={handleClearSaved}
                            className="p-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-300 hover:text-red-500 rounded-xl transition-all duration-200"
                            title="Clear saved data"
                          >
                            <Trash2 className="w-5 h-5" />
                          </div>
                          <ChevronLeft className="w-6 h-6 text-slate-300 dark:text-slate-600 rotate-180 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Demo Data Helper */}
              <div className="mt-12 text-center">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-4">Supported Format</p>
                <div className="inline-block bg-slate-100 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-1">
                  <pre className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono px-4 py-2">
                    [ &#123; "business_name": "...", "business_phone": "..." &#125; ]
                  </pre>
                </div>
              </div>

              {/* Reset App Button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reset the app? This will clear all data and settings.')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors flex items-center gap-2 py-2 px-4 rounded-full hover:bg-red-50 dark:hover:bg-red-900/10"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Factory Reset</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-8 duration-700 h-full">
            <LeadList
              leads={data.leads}
              onBack={handleBack}
              userConfig={userConfig}
              onStatusChange={handleLeadStatusChange}
              onDelete={handleDeleteLeads}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;