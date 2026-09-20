import { useState } from 'react';
import { ChevronRight, Folder, FileText } from 'lucide-react';
import SharedNote from './SharedNote';
import EmptyState from '../ui/EmptyState';

export default function SharedFolder({ folder, tree }) {
  const [selectedNote, setSelectedNote] = useState(null);

  const SharedTreeNode = ({ node, depth = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isFolder = node.type === 'folder';

    const handleToggle = () => {
      if (isFolder) {
        setIsExpanded(!isExpanded);
      } else {
        setSelectedNote(node);
      }
    };

    return (
      <div>
        <div 
          className={`tree-node ${selectedNote?._id === node._id ? 'selected' : ''}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={handleToggle}
        >
          <div className="tree-node-icon">
            {isFolder ? (
              <ChevronRight size={16} className={`chevron ${isExpanded ? 'expanded' : ''}`} />
            ) : (
              <span style={{ width: 16 }} />
            )}
            {isFolder ? <Folder size={16} className="text-muted" /> : <FileText size={16} className="text-muted" />}
          </div>
          <div className="tree-node-title">
            <span>{node.title || 'Untitled'}</span>
          </div>
        </div>
        {isFolder && isExpanded && (
          <div className="tree-node-children">
            {node.children?.map(child => (
              <SharedTreeNode key={child._id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="shared-folder-layout">
      <div className="shared-sidebar">
        <h2 className="shared-folder-title">{folder.title}</h2>
        <div className="sidebar-content">
          {tree.map(node => (
            <SharedTreeNode key={node._id} node={node} />
          ))}
        </div>
      </div>
      <div className="shared-main">
        {selectedNote ? (
          <SharedNote note={selectedNote} />
        ) : (
          <EmptyState 
            icon={<FileText size={48} />}
            title="Select a note"
            description="Choose a note from the sidebar to view its contents."
          />
        )}
      </div>
    </div>
  );
}
