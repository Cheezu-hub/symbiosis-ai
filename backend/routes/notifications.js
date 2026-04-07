const express = require('express');
const router = express.Router();
const { pool, authenticateToken } = require('../models/database');

router.use(authenticateToken);

// ─── GET /api/notifications ──────────────────────────────────────────────────
// Fetch recent notifications for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);

    const result = await pool.query(
      `SELECT * FROM notifications 
       WHERE industry_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [userId, limit]
    );

    res.json({
      success: true,
      data: result.rows.map(r => ({
        id:          r.id,
        type:        r.type,
        title:       r.title,
        message:     r.message,
        referenceId: r.reference_id,
        isRead:      r.is_read,
        createdAt:   r.created_at
      }))
    });
  } catch (err) {
    console.error('notifications GET error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
});

// ─── GET /api/notifications/unread-count ─────────────────────────────────────
// Get badge count for the UI
router.get('/unread-count', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM notifications WHERE industry_id = $1 AND is_read = false`,
      [req.user.id]
    );
    res.json({ success: true, data: { count: parseInt(result.rows[0].count) } });
  } catch (err) {
    console.error('notifications unread-count error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch count' });
  }
});

// ─── PUT /api/notifications/:id/read ─────────────────────────────────────────
// Mark a single notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE notifications SET is_read = true 
       WHERE id = $1 AND industry_id = $2 
       RETURNING id`,
      [req.params.id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('notifications read error:', err);
    res.status(500).json({ success: false, error: 'Failed to mark read' });
  }
});

// ─── PUT /api/notifications/read-all ─────────────────────────────────────────
// Mark all notifications as read for the user
router.put('/read-all', async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE industry_id = $1 AND is_read = false`,
      [req.user.id]
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    console.error('notifications read-all error:', err);
    res.status(500).json({ success: false, error: 'Failed to mark all read' });
  }
});

module.exports = router;
