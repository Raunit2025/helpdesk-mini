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
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const query = { user: req.user.id };
    
    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);
      
    const total = await Ticket.countDocuments(query);
    const next_offset = offset + tickets.length < total ? offset + tickets.length : null;

    res.json({ items: tickets, next_offset });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


router.get('/all', [auth, checkRole('agent', 'admin')], async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const tickets = await Ticket.find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const total = await Ticket.countDocuments();
    const next_offset = offset + tickets.length < total ? offset + tickets.length : null;

    res.json({ items: tickets, next_offset });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



router.patch('/:id/status', [auth, checkRole('agent', 'admin')], async (req, res) => {
  try {
    const { status, version } = req.body;

    if (!['open', 'in-progress', 'closed'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }


    const update = {
      $set: { status },
      $inc: { version: 1 },
    };

    const updatedTicket = await Ticket.findOneAndUpdate(
      { _id: req.params.id, version: version },
      update,
      { new: true }
    );

    if (!updatedTicket) {
      const ticketExists = await Ticket.findById(req.params.id);
      if (!ticketExists) {
        return res.status(404).json({ msg: 'Ticket not found' });
      }

      return res.status(409).json({
        error: {
          code: 'CONFLICT',
          message: 'This ticket has been modified by someone else. Please refresh and try again.',
        },
      });
    }

    res.json(updatedTicket);

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

router.patch('/:id/status', [auth, checkRole('agent', 'admin')], async (req, res) => {
  try {
    const { status, version } = req.body; 

    if (!['open', 'in-progress', 'closed'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    if (version !== undefined && ticket.version !== version) {
      return res.status(409).json({ 
        error: {
          code: 'CONFLICT',
          message: 'This ticket has been modified by someone else. Please refresh and try again.',
        },
      });
    }

    ticket.status = status;
    
    if (!ticket.assignedTo) {
      ticket.assignedTo = req.user.id;
    }

    ticket.version += 1; 

    await ticket.save();
    res.json(ticket);
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
