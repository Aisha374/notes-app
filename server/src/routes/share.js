const express = require('express');
const router = express.Router();
const Folder = require('../models/Folder');
const Note = require('../models/Note');

// GET /api/share/:token
router.get('/:token', async (req, res, next) => {
  try {
    const token = req.params.token;
    
    const folder = await Folder.findOne({ shareToken: token }).lean();
    if (folder) {
      const descendantFolders = await Folder.find({ ancestors: folder._id }).lean();
      const allFolderIds = [folder._id, ...descendantFolders.map(f => f._id)];
      const notes = await Note.find({ parentId: { $in: allFolderIds } }).lean();
      
      const items = [
        { ...folder, type: 'folder', children: [] },
        ...descendantFolders.map(f => ({ ...f, type: 'folder', children: [] })),
        ...notes.map(n => ({ ...n, type: 'note' }))
      ];

      const sortFn = (a, b) => (a.title || '').localeCompare(b.title || '');
      items.sort(sortFn);
      items.sort((a, b) => {
        if (a.type === b.type) return 0;
        return a.type === 'folder' ? -1 : 1;
      });

      const itemMap = {};
      items.forEach(item => {
        itemMap[item._id.toString()] = item;
      });

      items.forEach(item => {
        if (item._id.toString() !== folder._id.toString() && item.parentId) {
          const parent = itemMap[item.parentId.toString()];
          if (parent && parent.type === 'folder') {
            parent.children.push(item);
          }
        }
      });

      return res.json({
        type: 'folder',
        folder,
        tree: itemMap[folder._id.toString()].children || []
      });
    }

    const note = await Note.findOne({ shareToken: token }).lean();
    if (note) {
      return res.json({ type: 'note', note });
    }

    res.status(404).json({ error: 'Shared resource not found' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
