import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Underline from '@tiptap/extension-underline';
import { useEffect } from 'react';

export default function SharedNote({ note }) {
  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit,
      Table,
      TableRow,
      TableHeader,
      TableCell,
      Underline,
    ],
    content: note.content || '',
  });

  useEffect(() => {
    if (editor && note) {
      editor.commands.setContent(note.content || '');
    }
  }, [editor, note]);

  return (
    <div className="shared-note-view note-editor">
      <div className="editor-header">
        <h1 className="shared-note-title">{note.title || 'Untitled Note'}</h1>
      </div>
      <div className="editor-content-wrapper read-only">
        <EditorContent editor={editor} className="tiptap-editor" />
      </div>
    </div>
  );
}
