const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Comment = require('../models/Comment'); 
const auth = require('../middleware/auth'); 
const Ticket = require('../models/Ticket');
const checkRole = require('../middleware/role');

router.post(
  '/',
  [
    auth, 
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description } = req.body;

      const slaDeadline = new Date();
      slaDeadline.setHours(slaDeadline.getHours() + 24);

      const newTicket = new Ticket({
        title,
        description,
        slaDeadline,
        user: req.user.id, 
      });

      const ticket = await newTicket.save();
      res.json(ticket);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

router.get('/', auth, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


router.get('/all', [auth, checkRole('agent', 'admin')], async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



router.patch('/:id/status', [auth, checkRole('agent', 'admin')], async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['open', 'in-progress', 'closed'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    ticket.status = status;
    
    if (!ticket.assignedTo) {
        ticket.assignedTo = req.user.id;
    }

    await ticket.save();
    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    if (ticket.user.toString() !== req.user.id && req.user.role === 'user') {
        return res.status(403).json({ msg: 'Forbidden: Access denied' });
    }

    const comments = await Comment.find({ ticket: req.params.id }).sort({ createdAt: 'asc' });

    res.json({ ticket, comments });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


router.post(
  '/:id/comments',
  [
    auth,
    [
      check('text', 'Comment text is required').not().isEmpty(),
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const ticket = await Ticket.findById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ msg: 'Ticket not found' });
      }

      const newComment = new Comment({
        text: req.body.text,
        user: req.user.id,
        ticket: req.params.id,
      });

      const comment = await newComment.save();
      res.json(comment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
