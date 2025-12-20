import React, { useEffect, useRef } from 'react';
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, className, placeholder }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Initialize content only once on mount
  useEffect(() => {
    if (editorRef.current) {
        if (value && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }
  }, []); 

  // Handle external updates (e.g. AI enhancement)
  useEffect(() => {
      // If the editor is NOT focused, we can safely update the content from props
      // This allows the "Enhance with AI" button to update the text.
      if (editorRef.current && document.activeElement !== editorRef.current) {
          if (editorRef.current.innerHTML !== value) {
              editorRef.current.innerHTML = value;
          }
      }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      let html = editorRef.current.innerHTML;
      if (html === '<br>') {
          html = '';
      }
      onChange(html);
    }
  };

  const execCommand = (command: string) => {
    document.execCommand(command, false);
    if (editorRef.current) {
        editorRef.current.focus();
        handleInput();
    }
  };

  const ToolbarButton = ({ icon: Icon, command, title }: any) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()} // Prevent losing focus
      onClick={() => execCommand(command)}
      className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
    >
      <Icon size={16} />
    </button>
  );

  return (
    <div className={`border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-600 focus-within:border-blue-500 dark:focus-within:border-blue-600 transition-all ${className}`}>
      <style>{`
        [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: #94a3b8;
            pointer-events: none;
        }
        .dark [contenteditable]:empty:before {
            color: #475569;
        }
      `}</style>
      <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 transition-colors">
        <ToolbarButton icon={Bold} command="bold" title="Bold" />
        <ToolbarButton icon={Italic} command="italic" title="Italic" />
        <ToolbarButton icon={Underline} command="underline" title="Underline" />
        <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
        <ToolbarButton icon={List} command="insertUnorderedList" title="Bullet List" />
        <ToolbarButton icon={ListOrdered} command="insertOrderedList" title="Numbered List" />
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="p-3 min-h-[150px] outline-none text-sm text-slate-900 dark:text-slate-200 leading-relaxed max-h-[400px] overflow-y-auto [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:mb-1"
        data-placeholder={placeholder}
      />
    </div>
  );
};