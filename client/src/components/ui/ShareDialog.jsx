import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShareDialog({ isOpen, onClose, shareToken, type }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/share/${shareToken}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Share {type === 'folder' ? 'Folder' : 'Note'}</h3>
          <button className="icon-btn" onClick={onClose}><X size={20}/></button>
        </div>
        <div className="modal-body">
          <p>Anyone with this link can view this {type}.</p>
          <div className="share-link-box">
            <input type="text" readOnly value={shareUrl} />
            <button className="btn-primary" onClick={handleCopy}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
