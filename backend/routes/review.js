const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Property = require('../models/Property');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { check, validationResult } = require('express-validator');

// @route   POST api/reviews
// @desc    Create a review
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('property', 'Property ID is required').not().isEmpty(),
      check('rating', 'Please include a rating between 1 and 5').isInt({ min: 1, max: 5 }),
      check('title', 'Please add a title').not().isEmpty(),
      check('comment', 'Please add a comment').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const property = await Property.findById(req.body.property);
      if (!property) {
        return res.status(404).json({ msg: 'Property not found' });
      }

      // Check if user already reviewed this property
      const existingReview = await Review.findOne({
        property: req.body.property,
        user: req.user.id
      });

      if (existingReview) {
        return res.status(400).json({ msg: 'You have already reviewed this property' });
      }

      const review = new Review({
        property: req.body.property,
        agent: property.user, // Property owner/agent
        user: req.user.id,
        rating: req.body.rating,
        title: req.body.title,
        comment: req.body.comment,
        images: req.body.images || [],
        isRecommended: req.body.isRecommended || false
      });

      const savedReview = await review.save();
      
      // Populate user details
      await savedReview.populate('user', 'name avatar');
      
      res.json(savedReview);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/reviews/property/:propertyId
// @desc    Get reviews for a property
// @access  Public
router.get('/property/:propertyId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const reviews = await Review.find({ 
      property: req.params.propertyId,
      status: 'approved' 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name avatar')
      .populate('response.respondedBy', 'name');

    const count = await Review.countDocuments({ 
      property: req.params.propertyId,
      status: 'approved' 
    });

    res.json({
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalReviews: count
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/reviews/agent/:agentId
// @desc    Get reviews for an agent
// @access  Public
router.get('/agent/:agentId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    const reviews = await Review.find({ 
      agent: req.params.agentId,
      status: 'approved' 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('property', 'title images')
      .populate('user', 'name avatar');

    const count = await Review.countDocuments({ 
      agent: req.params.agentId,
      status: 'approved' 
    });

    res.json({
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalReviews: count
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', [auth], async (req, res) => {
  try {
    const { rating, title, comment, images, isRecommended } = req.body;
    
    let review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ msg: 'Review not found' });
    }

    // Make sure user owns the review
    if (review.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;
    review.images = images || review.images;
    if (typeof isRecommended !== 'undefined') {
      review.isRecommended = isRecommended;
    }

    await review.save();
    
    // Recalculate average rating
    await Review.calculateAverageRating(review.property);
    
    res.json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', [auth], async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ msg: 'Review not found' });
    }

    // Make sure user owns the review or is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const propertyId = review.property;
    
    await review.remove();
    
    // Recalculate average rating
    await Review.calculateAverageRating(propertyId);
    
    res.json({ msg: 'Review removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/reviews/:id/like
// @desc    Like or unlike a review
// @access  Private
router.put('/:id/like', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ msg: 'Review not found' });
    }

    // Check if the review has already been liked by this user
    const isLiked = review.likes.some(
      like => like.toString() === req.user.id
    );

    if (isLiked) {
      // Remove like
      review.likes = review.likes.filter(
        like => like.toString() !== req.user.id
      );
    } else {
      // Add like
      review.likes.unshift(req.user.id);
    }

    await review.save();
    
    res.json({ likes: review.likes });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/reviews/:id/respond
// @desc    Add a response to a review (agent/admin only)
// @access  Private
router.put(
  '/:id/respond',
  [auth, [check('text', 'Response text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const review = await Review.findById(req.params.id)
        .populate('agent', 'id')
        .populate('property', 'user');
      
      if (!review) {
        return res.status(404).json({ msg: 'Review not found' });
      }

      // Check if user is the agent who received the review or admin
      const isAgent = review.agent._id.toString() === req.user.id;
      const isPropertyOwner = review.property.user.toString() === req.user.id;
      const isAdmin = req.user.role === 'admin';
      
      if (!isAgent && !isPropertyOwner && !isAdmin) {
        return res.status(401).json({ msg: 'Not authorized to respond to this review' });
      }

      const response = {
        text: req.body.text,
        respondedAt: Date.now(),
        respondedBy: req.user.id
      };

      review.response = response;
      await review.save();
      
      await review.populate('response.respondedBy', 'name');
      
      res.json(review);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/reviews/:id/status
// @desc    Update review status (admin only)
// @access  Private/Admin
router.put(
  '/:id/status',
  [auth, admin, [check('status', 'Status is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { status } = req.body;
      
      const review = await Review.findById(req.params.id);
      
      if (!review) {
        return res.status(404).json({ msg: 'Review not found' });
      }
      
      review.status = status;
      await review.save();
      
      // Recalculate average rating if review is approved/rejected
      if (status === 'approved' || status === 'rejected') {
        await Review.calculateAverageRating(review.property);
      }
      
      res.json(review);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
