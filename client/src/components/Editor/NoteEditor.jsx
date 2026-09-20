import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Toolbar from './Toolbar';
import EmptyState from '../ui/EmptyState';
import { fetchNote, updateNote } from '../../api/client';
import useDebounce from '../../hooks/useDebounce';
import { FileEdit, ArrowLeft, Check, Loader, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NoteEditor({ noteId }) {
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [title, setTitle] = useState('');
  const [pendingContent, setPendingContent] = useState(null);
  const navigate = useNavigate();
  const saveTimerRef = useRef(null);

  // LaTeX command → Unicode symbol pairs for paste cleanup
  // Ordered longest-first to avoid partial matches (e.g. \Rightarrow before \right)
  const latexPairs = [
    ['\\Rightarrow', '⇒'], ['\\rightarrow', '→'], ['\\Leftarrow', '⇐'], ['\\leftarrow', '←'],
    ['\\Leftrightarrow', '⇔'], ['\\leftrightarrow', '↔'], ['\\uparrow', '↑'], ['\\downarrow', '↓'],
    ['\\subseteq', '⊆'], ['\\supseteq', '⊇'], ['\\subset', '⊂'], ['\\supset', '⊃'],
    ['\\emptyset', '∅'], ['\\therefore', '∴'], ['\\approx', '≈'], ['\\equiv', '≡'],
    ['\\notin', '∉'], ['\\forall', '∀'], ['\\exists', '∃'],
    ['\\bullet', '•'], ['\\degree', '°'],
    ['\\partial', '∂'], ['\\nabla', '∇'],
    ['\\epsilon', 'ε'], ['\\lambda', 'λ'], ['\\sigma', 'σ'], ['\\omega', 'ω'],
    ['\\Sigma', 'Σ'], ['\\Omega', 'Ω'], ['\\Delta', 'Δ'], ['\\Phi', 'Φ'],
    ['\\alpha', 'α'], ['\\beta', 'β'], ['\\gamma', 'γ'], ['\\delta', 'δ'],
    ['\\theta', 'θ'], ['\\mu', 'μ'], ['\\pi', 'π'], ['\\phi', 'φ'],
    ['\\infty', '∞'], ['\\sqrt', '√'],
    ['\\times', '×'], ['\\cdot', '·'],
    ['\\land', '∧'], ['\\lor', '∨'], ['\\neg', '¬'],
    ['\\circ', '∘'], ['\\prod', '∏'], ['\\sum', '∑'], ['\\int', '∫'],
    ['\\cup', '∪'], ['\\cap', '∩'],
    ['\\leq', '≤'], ['\\geq', '≥'], ['\\neq', '≠'],
    ['\\div', '÷'], ['\\pm', '±'], ['\\mp', '∓'],
    ['\\in', '∈'],
  ];

  const cleanLatex = (text) => {
    let result = text;
    for (const [latex, unicode] of latexPairs) {
      // Use split+join for literal string replacement (no regex needed)
      while (result.includes(latex)) {
        result = result.replace(latex, unicode);
      }
    }
    return result;
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Underline,
      Placeholder.configure({ placeholder: 'Start writing...' }),
    ],
    content: '',
    editorProps: {
      transformPastedText(text) {
        return cleanLatex(text);
      },
      transformPastedHTML(html) {
        return cleanLatex(html);
      },
    },
    onUpdate: ({ editor }) => {
      setPendingContent(editor.getHTML());
      setSaveStatus('saving');
    },
  });

  // Load note when noteId changes
  useEffect(() => {
    if (!noteId) return;
    
    const loadNote = async () => {
      setLoading(true);
      setSaveStatus('idle');
      setPendingContent(null);
      try {
        const data = await fetchNote(noteId);
        setNote(data);
        setTitle(data.title);
        if (editor) {
          editor.commands.setContent(data.content || '');
        }
      } catch (err) {
        toast.error('Failed to load note');
      } finally {
        setLoading(false);
      }
    };
    
    loadNote();
  }, [noteId, editor]);

  // Debounced autosave for content
  const debouncedContent = useDebounce(pendingContent, 1000);

  useEffect(() => {
    if (!noteId || debouncedContent === null || saveStatus !== 'saving') return;

    const saveContent = async () => {
      try {
        await updateNote(noteId, { content: debouncedContent });
        setSaveStatus('saved');
        // Clear "Saved" indicator after 3 seconds
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (err) {
        setSaveStatus('error');
        toast.error('Failed to save note');
      }
    };

    saveContent();
  }, [debouncedContent, noteId]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const handleTitleBlur = async () => {
    if (title !== note?.title) {
      try {
        setSaveStatus('saving');
        await updateNote(noteId, { title });
        setNote(prev => ({ ...prev, title }));
        setSaveStatus('saved');
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 3000);
      } catch (err) {
        toast.error('Failed to update title');
        setTitle(note?.title || '');
        setSaveStatus('error');
      }
    }
  };

  const handleBack = async () => {
    // If there's unsaved content, save it before navigating
    if (pendingContent !== null && saveStatus === 'saving') {
      try {
        await updateNote(noteId, { content: pendingContent });
      } catch (err) {
        // Don't block navigation on save failure
      }
    }
    navigate('/');
  };

  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <span className="save-status saving">
            <Loader size={14} className="spin" /> Saving...
          </span>
        );
      case 'saved':
        return (
          <span className="save-status saved">
            <Check size={14} /> Saved
          </span>
        );
      case 'error':
        return (
          <span className="save-status error">
            <AlertCircle size={14} /> Error saving
          </span>
        );
      default:
        return null;
    }
  };

  if (!noteId) {
    return (
      <div className="editor-empty">
        <EmptyState 
          icon={<FileEdit size={48} />}
          title="Select a note"
          description="Choose a note from the sidebar or create a new one to start writing."
        />
      </div>
    );
  }

  if (loading) {
    return <div className="editor-loading">Loading editor...</div>;
  }

  return (
    <div className="note-editor">
      <div className="editor-header">
        <div className="editor-header-left">
          <button className="icon-btn back-btn" onClick={handleBack} title="Back to folders">
            <ArrowLeft size={20} />
          </button>
          <input 
            className="editor-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="Note Title"
          />
        </div>
        <div className="editor-status">
          {renderSaveStatus()}
        </div>
      </div>
      
      {editor && <Toolbar editor={editor} />}
      
      <div className="editor-content-wrapper">
        <EditorContent editor={editor} className="tiptap-editor" />
      </div>
    </div>
  );
}
