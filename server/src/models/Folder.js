const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled Folder' },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  ancestors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Folder' }],
  shareToken: { type: String }
}, {
  timestamps: true
});

folderSchema.index({ parentId: 1 });
folderSchema.index({ ancestors: 1 });
folderSchema.index({ shareToken: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Folder', folderSchema);
