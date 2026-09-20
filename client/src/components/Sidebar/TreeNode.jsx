import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Folder, FileText, MoreHorizontal, Plus } from 'lucide-react';
import TreeActions from './TreeActions';
import { updateFolder, updateNote, createFolder, createNote } from '../../api/client';
import toast from 'react-hot-toast';

export default function TreeNode({ node, depth = 0, refreshTree }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.title);
  const [showActions, setShowActions] = useState(false);
  
  const isFolder = node.type === 'folder';
  const navigate = useNavigate();
  const { noteId } = useParams();
  const isSelected = noteId === node._id;
  
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (isFolder) {
      setIsExpanded(!isExpanded);
    } else {
      navigate(`/note/${node._id}`);
    }
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleRename = async () => {
    if (editValue.trim() === '') {
      setEditValue(node.title);
      setIsEditing(false);
      return;
    }
    
    if (editValue !== node.title) {
      try {
        if (isFolder) {
          await updateFolder(node._id, editValue);
        } else {
          await updateNote(node._id, { title: editValue });
        }
        refreshTree();
      } catch (err) {
        toast.error('Failed to rename');
        setEditValue(node.title);
      }
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleRename();
    if (e.key === 'Escape') {
      setEditValue(node.title);
      setIsEditing(false);
    }
  };

  const handleCreateSubfolder = async (e) => {
    e.stopPropagation();
    try {
      await createFolder('New Folder', node._id);
      setIsExpanded(true);
      refreshTree();
    } catch (err) {
      toast.error('Failed to create folder');
    }
  };

  const handleCreateNote = async (e) => {
    e.stopPropagation();
    try {
      const newNote = await createNote('New Note', node._id);
      setIsExpanded(true);
      refreshTree();
      navigate(`/note/${newNote._id}`);
    } catch (err) {
      toast.error('Failed to create note');
    }
  };

  return (
    <div className="tree-node-container">
      <div 
        className={`tree-node ${isSelected ? 'selected' : ''}`} 
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleToggle}
      >
        <div className="tree-node-icon">
          {isFolder ? (
            <ChevronRight 
              size={16} 
              className={`chevron ${isExpanded ? 'expanded' : ''}`} 
            />
          ) : (
            <span style={{ width: 16 }} />
          )}
          {isFolder ? <Folder size={16} className="text-muted" /> : <FileText size={16} className="text-muted" />}
        </div>
        
        <div className="tree-node-title" onDoubleClick={handleDoubleClick}>
          {isEditing ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="tree-node-input"
            />
          ) : (
            <span>{node.title || 'Untitled'}</span>
          )}
        </div>

        <div className="tree-node-actions-trigger" onClick={(e) => { e.stopPropagation(); setShowActions(!showActions); }}>
          <MoreHorizontal size={16} />
        </div>

        {showActions && (
          <TreeActions 
            node={node} 
            onClose={() => setShowActions(false)} 
            onRename={() => { setShowActions(false); setIsEditing(true); }}
            refreshTree={refreshTree}
          />
        )}
      </div>

      {isFolder && isExpanded && (
        <div className="tree-node-children">
          {node.children?.map(child => (
            <TreeNode 
              key={child._id} 
              node={child} 
              depth={depth + 1} 
              refreshTree={refreshTree} 
            />
          ))}
          <div className="tree-node-quick-add" style={{ paddingLeft: `${(depth + 1) * 16 + 8 + 24}px` }}>
            <button className="btn-icon-text" onClick={handleCreateNote}><Plus size={14}/> Note</button>
            <button className="btn-icon-text" onClick={handleCreateSubfolder}><Plus size={14}/> Folder</button>
          </div>
        </div>
      )}
    </div>
  );
}
