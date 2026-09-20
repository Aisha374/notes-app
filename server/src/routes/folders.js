const express = require('express');
const router = express.Router();
const Folder = require('../models/Folder');
const Note = require('../models/Note');
const { nanoid } = require('nanoid');
const mongoose = require('mongoose');

// GET /api/folders/tree
router.get('/tree', async (req, res, next) => {
  try {
    const folders = await Folder.find().lean();
    const notes = await Note.find().lean();

    const sortFn = (a, b) => (a.title || '').localeCompare(b.title || '');
    
    const items = [
      ...folders.map(f => ({ ...f, type: 'folder', children: [] })),
      ...notes.map(n => ({ ...n, type: 'note' }))
    ];

    items.sort(sortFn);
    
    // Sort so folders are before notes
    items.sort((a, b) => {
      if (a.type === b.type) return 0;
      return a.type === 'folder' ? -1 : 1;
    });

    const itemMap = {};
    const roots = [];

    items.forEach(item => {
      itemMap[item._id.toString()] = item;
    });

    items.forEach(item => {
      if (item.parentId) {
        const parent = itemMap[item.parentId.toString()];
        if (parent && parent.type === 'folder') {
          parent.children.push(item);
        } else {
          roots.push(item);
        }
      } else {
        roots.push(item);
      }
    });

    res.json(roots);
  } catch (error) {
    next(error);
  }
});

// POST /api/folders
router.post('/', async (req, res, next) => {
  try {
    const { title, parentId } = req.body;
    let ancestors = [];
    
    if (parentId) {
      const parent = await Folder.findById(parentId);
      if (parent) {
        ancestors = [...parent.ancestors, parent._id];
      } else {
        return res.status(404).json({ error: 'Parent folder not found' });
      }
    }

    const folder = new Folder({
      title: title || 'Untitled Folder',
      parentId: parentId || null,
      ancestors
    });

    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/folders/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const { title } = req.body;
    const folder = await Folder.findByIdAndUpdate(
      req.params.id,
      { title },
      { new: true, runValidators: true }
    );
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    res.json(folder);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/folders/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const descendantFolders = await Folder.find({ ancestors: id }).select('_id');
    const allIds = [id, ...descendantFolders.map(f => f._id.toString())];

    await Note.deleteMany({ parentId: { $in: allIds } });
    await Folder.deleteMany({ _id: { $in: allIds } });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/folders/:id/copy
router.post('/:id/copy', async (req, res, next) => {
  try {
    const sourceId = req.params.id;
    const sourceFolder = await Folder.findById(sourceId).lean();
    if (!sourceFolder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    const descendantFolders = await Folder.find({ ancestors: sourceId }).lean();
    const allOldFolders = [sourceFolder, ...descendantFolders];
    
    const idMap = {};
    allOldFolders.forEach(f => {
      idMap[f._id.toString()] = new mongoose.Types.ObjectId();
    });

    const newFolders = allOldFolders.map(f => {
      const isRoot = f._id.toString() === sourceId;
      const newId = idMap[f._id.toString()];
      const newParentId = isRoot ? sourceFolder.parentId : idMap[f.parentId.toString()];
      
      let newAncestors = [];
      if (isRoot) {
        newAncestors = [...sourceFolder.ancestors];
      } else {
        const parentIndex = f.ancestors.findIndex(a => a.toString() === sourceId);
        const outsideAncestors = f.ancestors.slice(0, parentIndex);
        const insideAncestors = f.ancestors.slice(parentIndex).map(a => idMap[a.toString()]);
        newAncestors = [...outsideAncestors, ...insideAncestors];
      }

      return {
        _id: newId,
        title: isRoot ? `Copy of ${f.title}` : f.title,
        parentId: newParentId,
        ancestors: newAncestors,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    const allOldIds = allOldFolders.map(f => f._id);
    const notesToCopy = await Note.find({ parentId: { $in: allOldIds } }).lean();

    const newNotes = notesToCopy.map(n => {
      const parentIndex = n.ancestors.findIndex(a => a.toString() === sourceId);
      const outsideAncestors = n.ancestors.slice(0, parentIndex);
      const insideAncestors = n.ancestors.slice(parentIndex).map(a => idMap[a.toString()]);
      
      return {
        _id: new mongoose.Types.ObjectId(),
        title: n.title,
        content: n.content,
        parentId: idMap[n.parentId.toString()],
        ancestors: [...outsideAncestors, ...insideAncestors],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    if (newFolders.length > 0) {
      await Folder.insertMany(newFolders);
    }
    if (newNotes.length > 0) {
      await Note.insertMany(newNotes);
    }

    const newRootId = idMap[sourceId];
    const newRootFolder = await Folder.findById(newRootId);
    
    res.status(201).json(newRootFolder);
  } catch (error) {
    next(error);
  }
});

// POST /api/folders/:id/share
router.post('/:id/share', async (req, res, next) => {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    if (folder.shareToken) {
      return res.json({ token: folder.shareToken });
    }

    folder.shareToken = nanoid(10);
    await folder.save();
    res.json({ token: folder.shareToken });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
