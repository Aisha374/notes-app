import { useState } from 'react';
import { Plus } from 'lucide-react';
import TreeNode from './TreeNode';
import useTree from '../../hooks/useTree';
import { createFolder } from '../../api/client';
import toast from 'react-hot-toast';

export default function Sidebar() {
  const { tree, loading, refreshTree } = useTree();
  
  const handleCreateRootFolder = async () => {
    try {
      await createFolder('New Folder');
      refreshTree();
    } catch (err) {
      toast.error('Failed to create folder');
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button className="btn-ghost full-width justify-start" onClick={handleCreateRootFolder}>
          <Plus size={16} />
          <span>New Folder</span>
        </button>
      </div>
      <div className="sidebar-content">
        {loading ? (
          <div className="sidebar-loading">Loading...</div>
        ) : tree.length === 0 ? (
          <div className="sidebar-empty">No folders yet</div>
        ) : (
          tree.map(node => (
            <TreeNode key={node._id} node={node} depth={0} refreshTree={refreshTree} />
          ))
        )}
      </div>
    </aside>
  );
}
