const router = require('express').Router();
const { supabase } = require('../db');
const { auth } = require('../middleware/auth');

router.use(auth);

// GET /api/chat/channels
router.get('/channels', async (req, res) => {
  const { data: channels, error } = await supabase
    .from('chat_channels')
    .select('*')
    .order('id', { ascending: true });

  if (error) return res.status(500).json({ message: error.message });

  // Map to frontend expected camelCase keys
  const formatted = (channels || []).map(ch => ({
    id: ch.id,
    name: ch.name,
    members: ch.members,
    lastMessage: ch.last_message,
    lastTime: ch.last_time,
  }));

  res.json({ channels: formatted });
});

// GET /api/chat/messages/:channelId
router.get('/messages/:channelId', async (req, res) => {
  const channelId = parseInt(req.params.channelId);

  const { data: channel } = await supabase
    .from('chat_channels')
    .select('*')
    .eq('id', channelId)
    .single();

  if (!channel) return res.status(404).json({ message: 'Channel not found' });

  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('channel_id', channelId)
    .order('id', { ascending: true });

  if (error) return res.status(500).json({ message: error.message });

  const enriched = (messages || []).map(m => ({
    id: m.id,
    sender: m.sender,
    sender_id: m.sender_id,
    content: m.content,
    time: m.time,
    createdAt: m.created_at,
    mine: m.sender_id === req.user.id,
  }));

  res.json({
    messages: enriched,
    channel: {
      id: channel.id,
      name: channel.name,
      members: channel.members,
      lastMessage: channel.last_message,
      lastTime: channel.last_time,
    },
  });
});

// POST /api/chat/messages — send a message
router.post('/messages', async (req, res) => {
  const { channel_id, content } = req.body;
  if (!channel_id || !content?.trim()) {
    return res.status(400).json({ message: 'channel_id and content are required' });
  }

  const channelId = parseInt(channel_id);
  const { data: channel } = await supabase
    .from('chat_channels')
    .select('id')
    .eq('id', channelId)
    .single();

  if (!channel) return res.status(404).json({ message: 'Channel not found' });

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const { data: msg, error } = await supabase
    .from('chat_messages')
    .insert([
      {
        channel_id: channelId,
        sender: req.user.name,
        sender_id: req.user.id,
        content: content.trim(),
        time: timeStr,
      },
    ])
    .select('*')
    .single();

  if (error) return res.status(500).json({ message: error.message });

  // Update channel preview
  await supabase
    .from('chat_channels')
    .update({
      last_message: content.trim().slice(0, 50),
      last_time: timeStr,
    })
    .eq('id', channelId);

  res.status(201).json({
    message: {
      id: msg.id,
      sender: msg.sender,
      sender_id: msg.sender_id,
      content: msg.content,
      time: msg.time,
      createdAt: msg.created_at,
      mine: true,
    },
  });
});

module.exports = router;
