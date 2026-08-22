import React from 'react';
import { Clock, MapPin, Tag, Trash2, Plus } from 'lucide-react';

const CATEGORY_COLORS = {
  food: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444' },
  sightseeing: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981' },
  transport: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6' },
  hotel: { bg: 'rgba(139, 92, 246, 0.15)', text: '#8B5CF6' },
  shopping: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B' },
  entertainment: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10B981' },
  adventure: { bg: 'rgba(236, 72, 153, 0.15)', text: '#EC4899' },
  relaxation: { bg: 'rgba(20, 184, 166, 0.15)', text: '#14B8A6' },
  other: { bg: 'rgba(107, 114, 128, 0.15)', text: '#6B7280' }
};

const Timeline = ({ activities = [], onAddClick, onDeleteClick, isOrganizer = true }) => {
  // Group activities by date
  const groupedActivities = activities.reduce((acc, act) => {
    const dateStr = act.date ? new Date(act.date).toISOString().split('T')[0] : 'Unscheduled';
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(act);
    return acc;
  }, {});

  const dates = Object.keys(groupedActivities).sort();

  if (activities.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--surface-card)', borderRadius: 'var(--border-radius-xl)', border: 'var(--border-light)' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No activities planned yet for this journey.</p>
        {isOrganizer && onAddClick && (
          <button onClick={onAddClick} className="btn-primary">
            <Plus size={16} />
            <span>Add First Activity</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="timeline-container">
      {dates.map((dateStr, dayIndex) => {
        const formattedDate = dateStr !== 'Unscheduled'
          ? new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
          : 'Unscheduled';

        const dayActs = groupedActivities[dateStr];
        const dayCost = dayActs.reduce((sum, a) => sum + (Number(a.estimatedCost) || 0), 0);

        return (
          <div key={dateStr} style={{ marginBottom: '32px' }}>
            {/* Day Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--accent-emerald)',
                    color: '#FFF',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {dayIndex + 1}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Day {dayIndex + 1}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formattedDate}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-emerald)', background: 'var(--accent-sand)', padding: '4px 14px', borderRadius: 'var(--border-radius-pill)', border: 'var(--border-light)' }}>
                {dayActs.length} {dayActs.length === 1 ? 'Activity' : 'Activities'} · Est. ₹{dayCost.toLocaleString()}
              </div>
            </div>

            {/* Activities List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {dayActs.map((act) => {
                const catStyle = CATEGORY_COLORS[act.category] || CATEGORY_COLORS.other;

                return (
                  <div key={act._id || act.title} className="timeline-item" style={{ background: 'var(--surface-card)', border: 'var(--border-light)', padding: '20px', borderRadius: '16px', color: 'var(--text-main)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        {act.startTime && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                            <Clock size={13} />
                            <span>{act.startTime} {act.endTime ? `— ${act.endTime}` : ''}</span>
                          </div>
                        )}
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>{act.title}</h4>
                      </div>

                      {isOrganizer && onDeleteClick && act._id && (
                        <button
                          onClick={() => onDeleteClick(act._id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '8px',
                            padding: '6px 8px',
                            color: '#EF4444',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                          }}
                          title="Delete Activity"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    {act.description && (
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.4 }}>
                        {act.description}
                      </p>
                    )}

                    {/* Metadata Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', borderTop: 'var(--border-light)', paddingTop: '12px', marginTop: '6px' }}>
                      {act.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          <MapPin size={13} color="var(--accent-emerald)" />
                          <span>{act.location}</span>
                        </div>
                      )}

                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: '700',
                          padding: '4px 12px',
                          borderRadius: 'var(--border-radius-pill)',
                          background: catStyle.bg,
                          color: catStyle.text,
                          textTransform: 'capitalize'
                        }}
                      >
                        {act.category || 'Sightseeing'}
                      </span>

                      {act.estimatedCost > 0 && (
                        <div style={{ marginLeft: 'auto', fontSize: '0.9rem', fontWeight: '800', color: 'var(--accent-emerald)' }}>
                          ₹{Number(act.estimatedCost).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {isOrganizer && onAddClick && (
        <button onClick={onAddClick} className="btn-secondary" style={{ marginTop: '16px' }}>
          <Plus size={16} />
          <span>Add Activity to Journey</span>
        </button>
      )}
    </div>
  );
};

export default Timeline;
