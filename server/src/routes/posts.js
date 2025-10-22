const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const Comment = require('../models/comment');
const User = require('../models/user');
const { authenticate } = require('../middleware/auth');

// Get all posts with user info and comments count
router.get('/', async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'avatar_url']
        }
      ],
      order: [['created_at', 'DESC']],
      where: { is_active: true }
    });

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch posts'
    });
  }
});

// Get specific post with comments
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findOne({
      where: { id, is_active: true },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'avatar_url']
        }
      ]
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch post'
    });
  }
});

// Create new post
router.post('/', authenticate, async (req, res) => {
  try {
    const { content, image_url } = req.body;
    const user_id = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Post content is required'
      });
    }

    const post = await Post.create({
      user_id,
      content: content.trim(),
      image_url
    });

    // Fetch the created post with user info
    const createdPost = await Post.findOne({
      where: { id: post.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'avatar_url']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdPost,
      message: 'Post created successfully'
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create post'
    });
  }
});

// Get comments for a post
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    
    const comments = await Comment.findAll({
      where: { post_id: id, is_active: true },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'avatar_url']
        }
      ],
      order: [['created_at', 'ASC']]
    });

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch comments'
    });
  }
});

// Add comment to a post
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user_id = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Comment content is required'
      });
    }

    // Check if post exists
    const post = await Post.findOne({ where: { id, is_active: true } });
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Create comment
    const comment = await Comment.create({
      post_id: id,
      user_id,
      content: content.trim()
    });

    // Update post comments count
    await Post.increment('comments_count', { where: { id } });

    // Fetch the created comment with user info
    const createdComment = await Comment.findOne({
      where: { id: comment.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'avatar_url']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdComment,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add comment'
    });
  }
});

// Like/Unlike a post
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findOne({ where: { id, is_active: true } });
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // For simplicity, just increment the likes count
    // In a real app, you'd track which users liked which posts
    await Post.increment('likes_count', { where: { id } });

    const updatedPost = await Post.findOne({ where: { id } });

    res.json({
      success: true,
      data: { likes_count: updatedPost.likes_count },
      message: 'Post liked successfully'
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false, 
      error: 'Failed to like post'
    });
  }
});

// Like/Unlike a comment
router.post('/:postId/comments/:commentId/like', authenticate, async (req, res) => {
  try {
    const { commentId } = req.params;
    
    const comment = await Comment.findOne({ where: { id: commentId, is_active: true } });
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    // For simplicity, just increment the likes count
    await Comment.increment('likes_count', { where: { id: commentId } });

    const updatedComment = await Comment.findOne({ where: { id: commentId } });

    res.json({
      success: true,
      data: { likes_count: updatedComment.likes_count },
      message: 'Comment liked successfully'
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like comment'
    });
  }
});

module.exports = router;