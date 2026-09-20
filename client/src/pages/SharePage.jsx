import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchShared } from '../api/client';
import SharedFolder from '../components/Share/SharedFolder';
import SharedNote from '../components/Share/SharedNote';
import TopBar from '../components/Layout/TopBar';

export default function SharePage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSharedData = async () => {
      try {
        const result = await fetchShared(token);
        setData(result);
      } catch (err) {
        setError('Shared link not found or expired.');
      } finally {
        setLoading(false);
      }
    };
    loadSharedData();
  }, [token]);

  if (loading) return <div className="full-page-message">Loading shared content...</div>;
  if (error) return <div className="full-page-message error">{error}</div>;
  if (!data) return <div className="full-page-message">Nothing found.</div>;

  return (
    <div className="share-page-layout app-layout">
      <TopBar />
      <main className="app-main share-main">
        {data.type === 'folder' ? (
          <SharedFolder folder={data.folder} tree={data.tree} />
        ) : (
          <SharedNote note={data.note} />
        )}
      </main>
    </div>
  );
}
