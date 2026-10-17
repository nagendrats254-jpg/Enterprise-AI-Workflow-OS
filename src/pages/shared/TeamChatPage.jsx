import { useState, useRef, useEffect, useMemo } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Avatar } from '../../components/ui/Components';
import { IconSend, IconSearch } from '../../components/ui/Icons';
import { chatApi } from '../../services/api';
import { connectSocket, getSocket } from '../../services/socket';
import { DEMO_CHAT_CHANNELS, DEMO_CHAT_MESSAGES } from '../../data/demoData';
import { useAuth } from '../../context/AuthContext';

function ChannelItem({ channel, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px', width: '100%', border: 'none',
        background: active ? 'rgba(124,58,237,0.1)' : 'transparent',
        borderRadius: 6, cursor: 'pointer', textAlign: 'left',
        borderLeft: active ? '3px solid var(--color-violet-500)' : '3px solid transparent',
        marginBottom: 2,
        transition: 'background 0.1s',
      }}
    >
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: active ? 'var(--color-violet-500)' : 'var(--color-navy-100)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700,
        color: active ? '#fff' : 'var(--color-navy-500)',
        flexShrink: 0,
      }}>
        {channel.name[0]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: active ? 600 : 500, color: active ? 'var(--color-violet-700)' : 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {channel.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {channel.lastMessage || 'No messages yet'}
        </div>
      </div>
      <span style={{ fontSize: 10, color: 'var(--color-text-muted)', flexShrink: 0 }}>{channel.lastTime || ''}</span>
    </button>
  );
}

function ChatBubble({ message }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: message.mine ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap: 8,
      marginBottom: 14,
    }}>
      {!message.mine && <Avatar name={message.sender || 'User'} size={28} />}
      <div style={{ maxWidth: '72%' }}>
        {!message.mine && (
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 3, paddingLeft: 4 }}>
            {message.sender}
          </div>
        )}
        <div className={message.mine ? 'chat-bubble-me' : 'chat-bubble-them'}>
          {message.content}
        </div>
        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 3, textAlign: message.mine ? 'right' : 'left', paddingLeft: 4 }}>
          {message.time}
        </div>
      </div>
    </div>
  );
}

export default function TeamChatPage() {
  const { user } = useAuth();
  const [channels, setChannels] = useState(DEMO_CHAT_CHANNELS);
  const [activeChannel, setActiveChannel] = useState(DEMO_CHAT_CHANNELS[0]);
  const [messages, setMessages] = useState(DEMO_CHAT_MESSAGES);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const bottomRef = useRef();

  // Load channels from API
  useEffect(() => {
    chatApi.channels()
      .then(res => {
        if (res.channels && res.channels.length) {
          setChannels(res.channels);
          setActiveChannel(prev => res.channels.find(c => c.id === prev?.id) || res.channels[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Load messages whenever active channel changes
  useEffect(() => {
    if (!activeChannel?.id) return;
    chatApi.messages(activeChannel.id)
      .then(res => {
        if (res.messages) {
          setMessages(res.messages.map(m => ({
            ...m,
            mine: m.sender_id === user?.id || m.sender === user?.name,
          })));
        }
      })
      .catch(() => {
        // Fallback to demo
        setMessages(DEMO_CHAT_MESSAGES);
      });
  }, [activeChannel?.id, user?.id, user?.name]);

  // Connect to Socket.io
  useEffect(() => {
    const socket = connectSocket();

    function onConnect() {
      setIsSocketConnected(true);
      if (activeChannel?.id) {
        socket.emit('join-channel', activeChannel.id);
      }
    }

    function onDisconnect() {
      setIsSocketConnected(false);
    }

    function onNewMessage({ channelId, message }) {
      if (Number(channelId) === Number(activeChannel?.id)) {
        setMessages(prev => {
          if (prev.some(m => m.id === message.id)) return prev;
          return [...prev, {
            ...message,
            mine: message.sender_id === user?.id || message.sender === user?.name,
          }];
        });
      }

      // Update channel preview
      setChannels(prev => prev.map(ch => {
        if (Number(ch.id) === Number(channelId)) {
          return { ...ch, lastMessage: message.content, lastTime: message.time };
        }
        return ch;
      }));
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new-message', onNewMessage);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new-message', onNewMessage);
    };
  }, [activeChannel?.id, user?.id, user?.name]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim() || !activeChannel?.id) return;

    const content = input.trim();
    setInput('');

    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('send-message', {
        channelId: activeChannel.id,
        message: {
          sender: user?.name || 'Anonymous',
          sender_id: user?.id || null,
          content,
        },
      });
    } else {
      // Fallback via REST API
      try {
        const res = await chatApi.send({ channel_id: activeChannel.id, content });
        if (res.message) {
          setMessages(prev => [...prev, { ...res.message, mine: true }]);
        }
      } catch (err) {
        console.error('Failed to send message:', err.message);
      }
    }
  }

  const filteredChannels = useMemo(() => {
    return channels.filter(c =>
      (c.name || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [channels, search]);

  return (
    <AppShell pageTitle="Team Chat">
      <div style={{ maxWidth: 1200 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 className="page-title">Team Chat</h1>
              {isSocketConnected ? (
                <span style={{ fontSize: 11, background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                  ● WebSocket Live
                </span>
              ) : (
                <span style={{ fontSize: 11, background: '#fef3c7', color: '#d97706', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                  ○ Polling
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
              Real-time collaboration across departments saved directly to PostgreSQL.
            </p>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', height: 600, overflow: 'hidden', padding: 0 }}>
          {/* Channel List */}
          <div style={{
            width: 240, minWidth: 240, borderRight: '1px solid var(--color-border)',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--color-border-light)' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-text-primary)', marginBottom: 10 }}>Channels</div>
              <div className="topbar-search">
                <IconSearch style={{ width: 16, height: 16, color: 'var(--color-text-muted)' }} />
                <input placeholder="Search channels..." value={search} onChange={e => setSearch(e.target.value)} aria-label="Search channels" />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
              {filteredChannels.map(ch => (
                <ChannelItem
                  key={ch.id}
                  channel={ch}
                  active={activeChannel?.id === ch.id}
                  onClick={() => setActiveChannel(ch)}
                />
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {/* Chat header */}
            <div style={{
              padding: '12px 20px', borderBottom: '1px solid var(--color-border-light)',
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'var(--color-surface)',
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: 'var(--color-violet-500)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: '#fff',
              }}>
                {activeChannel?.name ? activeChannel.name[0] : '#'}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{activeChannel?.name || 'Channel'}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{activeChannel?.members || 0} members · Persistent chat history</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              <div style={{
                textAlign: 'center', marginBottom: 20,
                fontSize: 11, color: 'var(--color-text-muted)',
              }}>
                Channel History
              </div>
              {messages.map(msg => <ChatBubble key={msg.id} message={msg} />)}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--color-border-light)',
              display: 'flex', gap: 10, alignItems: 'flex-end',
              background: 'var(--color-surface)',
            }}>
              <input
                className="form-input"
                placeholder={`Message #${(activeChannel?.name || '').toLowerCase()}...`}
                value={input}
                onChange={e => setInput(e.target.value)}
                style={{ flex: 1 }}
                aria-label="Type a message"
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(e)}
              />
              <button
                type="submit"
                className="btn btn-primary btn-icon"
                disabled={!input.trim()}
                aria-label="Send message"
              >
                <IconSend style={{ width: 14, height: 14 }} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
