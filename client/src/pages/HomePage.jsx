import { useParams } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import NoteEditor from '../components/Editor/NoteEditor';

export default function HomePage() {
  const { noteId } = useParams();

  return (
    <AppLayout>
      <NoteEditor noteId={noteId} />
    </AppLayout>
  );
}
