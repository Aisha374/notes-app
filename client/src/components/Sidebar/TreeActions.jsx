import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteFolder, deleteNote, copyFolder, shareFolder, shareNote } from '../../api/client';
import { Edit2, Copy, Share2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../ui/ConfirmDialog';
import ShareDialog from '../ui/ShareDialog';

export default function TreeActions({ node, onClose, onRename, refreshTree }) {
  const menuRef = useRef(null);
  const isFolder = node.type === 'folder';
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareToken, setShareToken] = useState(null);

  const navigate = useNavigate();
  const { noteId } = useParams();

  // Only close on click-outside when no dialog is open
  useEffect(() => {
    if (showConfirm || showShare) return; // don't register handler while a dialog is open

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, showConfirm, showShare]);

  const handleDelete = async () => {
    try {
      if (isFolder) {
        await deleteFolder(node._id);
      } else {
        await deleteNote(node._id);
        // If the deleted note was currently open, navigate away
        if (noteId === node._id) {
          navigate('/');
        }
      }
      refreshTree();
      toast.success('Deleted successfully');
      onClose();
    } catch (err) {
      toast.error('Failed to delete');
    }
    setShowConfirm(false);
  };

  const handleCopy = async () => {
    try {
      if (isFolder) {
        await copyFolder(node._id);
        refreshTree();
        toast.success('Folder copied');
        onClose();
      }
    } catch (err) {
      toast.error('Failed to copy folder');
    }
  };

  const handleShare = async () => {
    try {
      const res = isFolder ? await shareFolder(node._id) : await shareNote(node._id);
      setShareToken(res.token);
      setShowShare(true);
    } catch (err) {
      toast.error('Failed to generate share link');
    }
  };

  return (
    <>
      <div className="tree-actions-menu" ref={menuRef}>
        <button onClick={onRename} className="menu-item">
          <Edit2 size={14} /> Rename
        </button>
        {isFolder && (
          <button onClick={handleCopy} className="menu-item">
            <Copy size={14} /> Duplicate
          </button>
        )}
        <button onClick={handleShare} className="menu-item">
          <Share2 size={14} /> Share
        </button>
        <button onClick={() => setShowConfirm(true)} className="menu-item danger">
          <Trash2 size={14} /> Delete
        </button>
      </div>

      {showConfirm && (
        <ConfirmDialog
          isOpen={showConfirm}
          title={`Delete ${isFolder ? 'Folder' : 'Note'}`}
          message={`Are you sure you want to delete "${node.title}"?${isFolder ? ' This will delete all folders and notes inside it.' : ''} This cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => { setShowConfirm(false); onClose(); }}
        />
      )}

      {showShare && (
        <ShareDialog
          isOpen={showShare}
          shareToken={shareToken}
          type={node.type}
          onClose={() => { setShowShare(false); onClose(); }}
        />
      )}
    </>
  );
}
