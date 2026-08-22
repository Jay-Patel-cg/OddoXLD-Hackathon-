import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTripById, getActivities, getTripStops, getExpenses, getExpenseSummary, getDestinations, addActivity, deleteActivity, addTripStop, deleteTripStop, addExpense } from '../api';
import Timeline from '../components/Timeline';
import BudgetSummary from '../components/BudgetSummary';
import CopilotPanel from '../components/CopilotPanel';
import Modal from '../components/Modal';
import { MapPin, Calendar, Wallet, Users, Plus, Sparkles, Compass, Share2, Clock, Tag } from 'lucide-react';

const DESTINATION_IMAGES = {
  Goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
  Jaipur: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
  Manali: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
  Bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80'
};

const TripDetails = () => {
  const { id: tripId } = useParams();

  const [trip, setTrip] = useState(null);
  const [activities, setActivities] = useState([]);
  const [stops, setStops] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('timeline'); // overview | timeline | stops | budget | calendar

  // Modals
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Forms
  const [newAct, setNewAct] = useState({ title: '', date: '', startTime: '09:00', endTime: '11:00', location: '', estimatedCost: 0, category: 'sightseeing' });
  const [newStop, setNewStop] = useState({ destinationId: '', arrivalDate: '', departureDate: '' });
  const [newExpense, setNewExpense] = useState({ title: '', amount: 0, category: 'food' });

  const loadTripData = async () => {
    try {
      const resTrip = await getTripById(tripId);
      if (resTrip.success && resTrip.data && resTrip.data.trip) {
        setTrip(resTrip.data.trip);
      }

      const resAct = await getActivities(tripId);
      if (resAct.success && resAct.data && resAct.data.activities) {
        setActivities(resAct.data.activities);
      }

      const resStops = await getTripStops(tripId);
      if (resStops.success && resStops.data && resStops.data.stops) {
        setStops(resStops.data.stops);
      }

      const resExp = await getExpenses(tripId);
      if (resExp.success && resExp.data && resExp.data.expenses) {
        setExpenses(resExp.data.expenses);
      }

      const resSum = await getExpenseSummary(tripId);
      if (resSum.success && resSum.data && resSum.data.summary) {
        setExpenseSummary(resSum.data.summary);
      }

      const resDest = await getDestinations();
      if (resDest.success && resDest.data && resDest.data.destinations) {
        setDestinations(resDest.data.destinations);
        if (resDest.data.destinations.length > 0) {
          setNewStop((prev) => ({ ...prev, destinationId: resDest.data.destinations[0]._id }));
        }
      }
    } catch (err) {
      console.error('TripDetails Load Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTripData();
  }, [tripId]);

  const handleAddActivity = async (e) => {
    e.preventDefault();
    try {
      await addActivity(tripId, newAct);
      setIsActivityModalOpen(false);
      setNewAct({ title: '', date: '', startTime: '09:00', endTime: '11:00', location: '', estimatedCost: 0, category: 'sightseeing' });
      loadTripData();
    } catch (err) {
      alert(err.message || 'Failed to add activity');
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      await deleteActivity(tripId, activityId);
      loadTripData();
    } catch (err) {
      alert(err.message || 'Failed to delete activity');
    }
  };

  const handleAddStop = async (e) => {
    e.preventDefault();
    try {
      await addTripStop(tripId, newStop);
      setIsStopModalOpen(false);
      loadTripData();
    } catch (err) {
      alert(err.message || 'Failed to add stop');
    }
  };

  const handleDeleteStop = async (stopId) => {
    try {
      await deleteTripStop(tripId, stopId);
      loadTripData();
    } catch (err) {
      alert(err.message || 'Failed to delete stop');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await addExpense(tripId, newExpense);
      setIsExpenseModalOpen(false);
      setNewExpense({ title: '', amount: 0, category: 'food' });
      loadTripData();
    } catch (err) {
      alert(err.message || 'Failed to add expense');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <Sparkles className="spin" size={32} color="var(--accent-terracotta)" />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="main-wrapper" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2>Trip not found</h2>
      </div>
    );
  }

  const coverImg = DESTINATION_IMAGES[trip.destination] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
  const startStr = trip.startDate ? new Date(trip.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : '';
  const endStr = trip.endDate ? new Date(trip.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  return (
    <div className="main-wrapper" style={{ paddingBottom: '120px' }}>
      {/* Cover Header */}
      <div
        style={{
          position: 'relative',
          height: '320px',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          marginBottom: '32px',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        <img src={coverImg} alt={trip.destination} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(18, 19, 22, 0.85) 0%, rgba(18, 19, 22, 0.2) 60%)',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '32px'
          }}
        >
          <div style={{ color: '#FFF', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div className="editorial-badge" style={{ background: 'rgba(255, 255, 255, 0.15)', color: '#FFF', border: '1px solid rgba(255, 255, 255, 0.3)', marginBottom: '8px' }}>
                <MapPin size={14} />
                <span>{trip.destination}</span>
              </div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#FFF', marginBottom: '8px' }}>
                {trip.title || trip.destination}
              </h1>
              <div style={{ display: 'flex', gap: '20px', fontSize: '0.95rem', opacity: 0.9 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} />
                  <span>{startStr} — {endStr}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Wallet size={16} />
                  <span>Target Budget: ₹{(trip.budget || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Link
              to={`/shared/${trip._id}`}
              target="_blank"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255,255,255,0.2)',
                color: '#FFF',
                border: '1px solid rgba(255,255,255,0.4)',
                fontSize: '0.88rem',
                fontWeight: '600'
              }}
            >
              <Share2 size={16} />
              <span>Share Itinerary</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Horizontal Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: 'var(--border-light)', paddingBottom: '16px', marginBottom: '32px', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`nav-item ${activeTab === 'timeline' ? 'active' : ''}`}
          style={{ padding: '10px 20px', fontSize: '0.95rem' }}
        >
          Journey Timeline ({activities.length})
        </button>
        <button
          onClick={() => setActiveTab('stops')}
          className={`nav-item ${activeTab === 'stops' ? 'active' : ''}`}
          style={{ padding: '10px 20px', fontSize: '0.95rem' }}
        >
          Multi-City Stops ({stops.length})
        </button>
        <button
          onClick={() => setActiveTab('budget')}
          className={`nav-item ${activeTab === 'budget' ? 'active' : ''}`}
          style={{ padding: '10px 20px', fontSize: '0.95rem' }}
        >
          Budget & Expenses
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
          style={{ padding: '10px 20px', fontSize: '0.95rem' }}
        >
          Visual Calendar
        </button>
      </div>

      {/* TAB 1: Timeline View */}
      {activeTab === 'timeline' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Journey Itinerary</h2>
            <button onClick={() => setIsActivityModalOpen(true)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Plus size={16} />
              <span>Add Activity</span>
            </button>
          </div>

          <Timeline
            activities={activities}
            onAddClick={() => setIsActivityModalOpen(true)}
            onDeleteClick={handleDeleteActivity}
            isOrganizer={true}
          />
        </div>
      )}

      {/* TAB 2: Multi-City Stops */}
      {activeTab === 'stops' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Multi-City Travel Stops</h2>
            <button onClick={() => setIsStopModalOpen(true)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Plus size={16} />
              <span>Add City Stop</span>
            </button>
          </div>

          {stops.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)', border: 'var(--border-light)' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No travel stops configured yet.</p>
              <button onClick={() => setIsStopModalOpen(true)} className="btn-secondary">
                <Plus size={16} />
                <span>Add First Stop</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {stops.map((stop, idx) => (
                <div key={stop._id} style={{ background: 'var(--surface-card)', padding: '20px', borderRadius: 'var(--radius-lg)', border: 'var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-terracotta)', fontWeight: '700', textTransform: 'uppercase' }}>Stop {idx + 1}</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{stop.destinationName || 'City Stop'}</h3>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {stop.arrivalDate ? new Date(stop.arrivalDate).toLocaleDateString() : ''} — {stop.departureDate ? new Date(stop.departureDate).toLocaleDateString() : ''}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteStop(stop._id)} className="btn-ghost" style={{ color: 'var(--status-error)' }}>
                    Delete Stop
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Budget & Expenses */}
      {activeTab === 'budget' && (
        <BudgetSummary
          summary={expenseSummary}
          expenses={expenses}
          onAddExpenseClick={() => setIsExpenseModalOpen(true)}
        />
      )}

      {/* TAB 4: Visual Calendar Grid */}
      {activeTab === 'calendar' && (
        <div style={{ background: 'var(--surface-card)', padding: '24px', borderRadius: 'var(--radius-xl)', border: 'var(--border-light)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '20px' }}>Calendar Overview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {activities.map((act) => (
              <div key={act._id} style={{ background: 'var(--bg-warm)', padding: '16px', borderRadius: 'var(--radius-md)', border: 'var(--border-light)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-terracotta)', fontWeight: '700' }}>
                  {act.date ? new Date(act.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Unscheduled'}
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: '700', margin: '4px 0' }}>{act.title}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', gap: '12px' }}>
                  <span>{act.startTime || 'All Day'}</span>
                  <span style={{ textTransform: 'capitalize' }}>{act.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating AI Copilot Assistant */}
      <CopilotPanel tripId={tripId} onActionExecuted={loadTripData} />

      {/* Modals */}
      <Modal isOpen={isActivityModalOpen} onClose={() => setIsActivityModalOpen(false)} title="Add Activity to Journey">
        <form onSubmit={handleAddActivity}>
          <div className="form-group">
            <label className="form-label">Activity Title</label>
            <input type="text" required placeholder="e.g. Paragliding at Solang Valley" value={newAct.title} onChange={(e) => setNewAct({ ...newAct, title: e.target.value })} className="form-input" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" required value={newAct.date} onChange={(e) => setNewAct({ ...newAct, date: e.target.value })} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select value={newAct.category} onChange={(e) => setNewAct({ ...newAct, category: e.target.value })} className="form-input">
                <option value="sightseeing">Sightseeing</option>
                <option value="food">Food & Dining</option>
                <option value="adventure">Adventure</option>
                <option value="transport">Transport</option>
                <option value="hotel">Hotel</option>
                <option value="shopping">Shopping</option>
                <option value="relaxation">Relaxation</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input type="text" placeholder="09:00" value={newAct.startTime} onChange={(e) => setNewAct({ ...newAct, startTime: e.target.value })} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input type="text" placeholder="11:00" value={newAct.endTime} onChange={(e) => setNewAct({ ...newAct, endTime: e.target.value })} className="form-input" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Estimated Cost (₹)</label>
            <input type="number" value={newAct.estimatedCost} onChange={(e) => setNewAct({ ...newAct, estimatedCost: Number(e.target.value) })} className="form-input" />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>
            <span>Add Activity</span>
          </button>
        </form>
      </Modal>

      <Modal isOpen={isStopModalOpen} onClose={() => setIsStopModalOpen(false)} title="Add City Stop">
        <form onSubmit={handleAddStop}>
          <div className="form-group">
            <label className="form-label">Select City</label>
            <select value={newStop.destinationId} onChange={(e) => setNewStop({ ...newStop, destinationId: e.target.value })} className="form-input">
              {destinations.map((d) => (
                <option key={d._id} value={d._id}>{d.city || d.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Arrival Date</label>
              <input type="date" required value={newStop.arrivalDate} onChange={(e) => setNewStop({ ...newStop, arrivalDate: e.target.value })} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Departure Date</label>
              <input type="date" required value={newStop.departureDate} onChange={(e) => setNewStop({ ...newStop, departureDate: e.target.value })} className="form-input" />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>
            <span>Add Stop</span>
          </button>
        </form>
      </Modal>

      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Log Expense">
        <form onSubmit={handleAddExpense}>
          <div className="form-group">
            <label className="form-label">Expense Title</label>
            <input type="text" required placeholder="e.g. Dinner at Cafe 1947" value={newExpense.title} onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })} className="form-input" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input type="number" required value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })} className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })} className="form-input">
                <option value="food">Food</option>
                <option value="transport">Transport</option>
                <option value="sightseeing">Sightseeing</option>
                <option value="hotel">Hotel</option>
                <option value="shopping">Shopping</option>
                <option value="entertainment">Entertainment</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>
            <span>Log Expense</span>
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default TripDetails;
