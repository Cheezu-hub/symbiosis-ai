import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { Bell, Check, Clock, Briefcase, ShieldAlert, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationsPage = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch notifications.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) markAsRead(notif.id);
    
    // Route based on type
    if (notif.type.includes('trade')) {
      navigate('/trade-requests');
    } else if (notif.type.includes('transaction')) {
      navigate('/transactions');
    } else if (notif.type.includes('match')) {
      navigate('/matches');
    }
  };

  const getIcon = (type) => {
    if (type.includes('trade_request')) return <Briefcase size={20} color="var(--warning)" />;
    if (type.includes('trade_accepted')) return <Check size={20} color="var(--success)" />;
    if (type.includes('trade_rejected')) return <ShieldAlert size={20} color="var(--error)" />;
    if (type.includes('match')) return <Zap size={20} color="var(--primary)" />;
    return <Bell size={20} color="var(--text-secondary)" />;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="page-container fade-in-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>
            Notifications
          </h1>
          {unreadCount > 0 && (
            <Badge variant="primary">{unreadCount} unread</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <button className="btn-outline" onClick={markAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', color: 'var(--error)', borderRadius: '8px', marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      {loading && notifications.length === 0 ? (
        <div className="loading" style={{ height: '200px' }}><div className="spinner" /></div>
      ) : notifications.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '4rem', opacity: 0.7 }}>
          <Bell size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', margin: '0 auto' }} />
          <h3>You're all caught up.</h3>
          <p style={{ color: 'var(--text-secondary)' }}>No notifications to show right now.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map(notif => (
            <Card
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              style={{
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderLeft: notif.isRead ? '1px solid var(--border)' : '4px solid var(--primary)',
                background: notif.isRead ? 'var(--bg-card)' : 'rgba(88, 224, 119, 0.03)',
                opacity: notif.isRead ? 0.7 : 1
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ 
                  background: 'var(--bg-secondary)', 
                  padding: '0.75rem', 
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {getIcon(notif.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: notif.isRead ? 500 : 600 }}>{notif.title}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      <Clock size={12} /> {new Date(notif.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {notif.message}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
