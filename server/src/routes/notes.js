const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const Folder = require('../models/Folder');
const { nanoid } = require('nanoid');

// GET /api/notes/:id
router.get('/:id', async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    next(error);
  }
});

// POST /api/notes
router.post('/', async (req, res, next) => {
  try {
    const { title, folderId } = req.body;
    
    if (!folderId) {
      return res.status(400).json({ error: 'folderId is required' });
    }

    const parentFolder = await Folder.findById(folderId);
    if (!parentFolder) {
      return res.status(404).json({ error: 'Parent folder not found' });
    }

    const ancestors = [...parentFolder.ancestors, parentFolder._id];

    const note = new Note({
      title: title || 'Untitled Note',
      parentId: folderId,
      ancestors
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/notes/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;

    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/notes/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await Note.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/notes/:id/share
router.post('/:id/share', async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (note.shareToken) {
      return res.json({ token: note.shareToken });
    }

    note.shareToken = nanoid(10);
    await note.save();
    res.json({ token: note.shareToken });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
