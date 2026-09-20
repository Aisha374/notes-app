const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled Note' },
  content: { type: String, default: '' },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', required: true },
  ancestors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Folder' }],
  shareToken: { type: String }
}, {
  timestamps: true
});

noteSchema.index({ parentId: 1 });
noteSchema.index({ ancestors: 1 });
noteSchema.index({ shareToken: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Note', noteSchema);
