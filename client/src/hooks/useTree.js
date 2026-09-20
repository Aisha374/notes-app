import { useState, useEffect, useCallback } from 'react';
import { fetchTree } from '../api/client';
import toast from 'react-hot-toast';

export default function useTree() {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshTree = useCallback(async () => {
    try {
      const data = await fetchTree();
      setTree(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tree');
      toast.error('Failed to load notes structure');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTree();
  }, [refreshTree]);

  return { tree, loading, error, refreshTree };
}
