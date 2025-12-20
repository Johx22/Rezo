import React, { useState, useEffect, useRef } from 'react';
import { ResumeData } from './types';
import { INITIAL_RESUME_STATE } from './constants';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Background } from './components/Background';
import { LandingPage } from './components/LandingPage';
import { Moon, Sun, ChevronDown, Pencil, Check, X, User, LogIn, UserPlus, Info, FileJson } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// --- Main Editor Component (The actual App) ---
const ResumeEditor: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME_STATE);
  const [resumeName, setResumeName] = useState("Untitled Resume");
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Name Editing State
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User Menu State
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showFeaturePopup, setShowFeaturePopup] = useState(false);

  // Toggle Dark Class on HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleEditClick = () => {
    setTempName(resumeName);
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      setResumeName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleCancelName = () => {
    setIsEditingName(false);
  };

  const handleFeatureUnavailable = () => {
    setShowUserMenu(false);
    setShowFeaturePopup(true);
  };

  // JSON Import Handlers
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        
        // Basic validation: Check if it has essential keys of ResumeData
        if (parsedData && typeof parsedData === 'object' && 'personalInfo' in parsedData) {
           setResumeData(parsedData);
           // Optional: You could also update the resume name based on the file name
           // const fileName = file.name.replace('.json', '');
           // setResumeName(fileName);
        } else {
           alert("Invalid JSON format: Missing resume data structure.");
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    // Reset value to allow selecting the same file again if needed
    event.target.value = '';
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden relative font-sans text-slate-900 dark:text-slate-200 transition-colors duration-300 print:h-auto print:overflow-visible">
      
      {/* Hidden File Input for Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".json"
      />

      {/* Live Animated Background */}
      <div className="no-print">
         <Background />
      </div>

      {/* Navbar - No Print */}
      <header className="no-print h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-white/20 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 shrink-0 z-20 shadow-sm dark:shadow-lg transition-colors duration-300">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-1 w-[200px] lg:w-[280px]">
            <div className="flex items-center justify-center">
                {/* Custom 'Rezo' Logo: Blue R with Dot */}
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                    <text x="2" y="28" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="30" className="fill-blue-600 dark:fill-blue-500">R</text>
                    <circle cx="27" cy="24" r="3.5" className="fill-slate-900 dark:fill-slate-100" />
                </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white hidden sm:inline relative top-[1px]">Rezo</span>
        </div>
        
        {/* Center: Resume Name Input */}
        <div className="flex-1 flex justify-center px-4">
            {isEditingName ? (
                <div className="flex items-center gap-2 w-full max-w-md justify-center animate-in fade-in zoom-in-95 duration-200">
                    <input 
                        ref={nameInputRef}
                        type="text" 
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveName();
                            if (e.key === 'Escape') handleCancelName();
                        }}
                        className="text-center text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 outline-none border-2 border-blue-500 rounded-lg px-3 py-1.5 w-full max-w-[240px] shadow-sm"
                        placeholder="Enter resume name..."
                    />
                    <button 
                        onClick={handleSaveName}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                        title="Save Name"
                    >
                        <Check size={18} />
                    </button>
                    <button 
                        onClick={handleCancelName}
                        className="p-2 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Discard Changes"
                    >
                        <X size={18} />
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-3 group cursor-pointer p-2 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors" onClick={handleEditClick}>
                    <span className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                        {resumeName}
                    </span>
                    <button 
                        className="text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 transition-colors"
                        title="Rename Resume"
                    >
                        <Pencil size={16} />
                    </button>
                </div>
            )}
        </div>
        
        {/* Right: Actions & User Info */}
        <div className="flex items-center justify-end gap-2 sm:gap-4 w-[200px] lg:w-[280px]">
            
            {/* Import JSON Button */}
            <button 
                onClick={handleImportClick}
                className="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
                title="Import JSON Data"
            >
                <FileJson size={18} />
                <span className="hidden lg:inline">Import</span>
            </button>

            {/* Theme Switcher */}
            <button 
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                <span className="hidden lg:inline">{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>

            <div className="h-6 w-px bg-slate-300/50 dark:bg-slate-800 hidden sm:block"></div>

            {/* User Menu */}
            <div className="relative">
                <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 cursor-pointer p-1 pr-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors outline-none"
                >
                     <div className="text-right hidden lg:block">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-none">Guest</p>
                    </div>
                    <div className="relative">
                        <div className="w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 border-2 border-white dark:border-slate-900 shadow-sm">
                            <User size={18} />
                        </div>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 dark:text-slate-500 hidden sm:block transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {showUserMenu && (
                    <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-40 animate-in fade-in zoom-in-95 duration-200">
                             <div className="p-1">
                                <button 
                                    onClick={handleFeatureUnavailable}
                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-3">
                                    <LogIn size={16} className="text-blue-500" /> Login
                                </button>
                                <button 
                                    onClick={handleFeatureUnavailable}
                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-3">
                                    <UserPlus size={16} className="text-green-500" /> Register
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative z-10 print:h-auto print:overflow-visible print:block">
        {/* Editor - Takes full screen, handles its own layout including the small preview */}
        <div className="w-full h-full bg-transparent no-print">
             <Editor data={resumeData} onChange={setResumeData} resumeName={resumeName} />
        </div>

        {/* Print Only Preview - Hidden from screen, visible on print. 
            Removed absolute positioning here to allow natural document flow in print mode 
        */}
        <div className="hidden print-only bg-white z-50">
            <Preview data={resumeData} />
        </div>
      </main>

      {/* Footer */}
      <footer className="no-print py-1.5 text-center text-[10px] sm:text-xs font-medium text-slate-400 dark:text-slate-600 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 shrink-0 z-20">
          Made with <span className="text-red-500 inline-block animate-pulse">♥</span> by Johann
      </footer>

      {/* Feature Unavailable Modal */}
      <AnimatePresence>
        {showFeaturePopup && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowFeaturePopup(false)}
            >
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 dark:border-slate-800 text-center p-6"
                >
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                        <Info size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Coming Soon</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        This feature is currently not available. We are working hard to bring user accounts to Rezo!
                    </p>
                    <button 
                        onClick={() => setShowFeaturePopup(false)} 
                        className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-opacity"
                    >
                        Got it
                    </button>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

// --- App Wrapper with Routing ---
const App: React.FC = () => {
    const [showEditor, setShowEditor] = useState(false);

    if (!showEditor) {
        return <LandingPage onStart={() => setShowEditor(true)} />;
    }

    return <ResumeEditor />;
};

export default App;