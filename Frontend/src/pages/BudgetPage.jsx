import React, { useState, useEffect } from 'react';
import { getTrips, getExpenses, addExpense, deleteExpense } from '../api';
import { Wallet, PieChart, Plus, Trash2, Calendar, Tag, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const CATEGORY_COLORS = {
  food: '#F28A5B',
  sightseeing: '#2E9BC3',
  transport: '#40566B',
  hotel: '#8ED8F8',
  shopping: '#F4E9D8',
  other: '#65788A'
};

const BudgetPage = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Expense Modal / Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchUserTrips = async () => {
      try {
        const res = await getTrips();
        if (res.success && res.data && res.data.trips && res.data.trips.length > 0) {
          setTrips(res.data.trips);
          setSelectedTripId(res.data.trips[0]._id);
        }
      } catch (err) {
        console.error('Failed to load trips:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTrips();
  }, []);

  useEffect(() => {
    if (!selectedTripId) return;

    const fetchTripExpenses = async () => {
      try {
        const res = await getExpenses(selectedTripId);
        if (res.success && res.data && res.data.expenses) {
          setExpenses(res.data.expenses);
        }
      } catch (err) {
        console.error('Failed to load expenses:', err);
      }
    };

    fetchTripExpenses();
  }, [selectedTripId]);

  const selectedTrip = trips.find((t) => t._id === selectedTripId) || trips[0];
  const targetBudget = selectedTrip?.budget || 25000;
  const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const remainingBudget = targetBudget - totalSpent;
  const percentageSpent = Math.min(100, Math.round((totalSpent / targetBudget) * 100));

  // Category totals
  const categoryTotals = expenses.reduce((acc, exp) => {
    const cat = exp.category || 'other';
    acc[cat] = (acc[cat] || 0) + Number(exp.amount);
    return acc;
  }, {});

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!title || !amount || !selectedTripId) return;

    setIsAdding(true);
    try {
      const res = await addExpense(selectedTripId, {
        title,
        amount: Number(amount),
        category,
        date,
        notes
      });

      if (res.success && res.data && res.data.expense) {
        setExpenses((prev) => [res.data.expense, ...prev]);
        setTitle('');
        setAmount('');
        setNotes('');
      }
    } catch (err) {
      console.error('Failed to add expense:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      const res = await deleteExpense(selectedTripId, expenseId);
      if (res.success) {
        setExpenses((prev) => prev.filter((e) => e._id !== expenseId));
      }
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  return (
    <div className="main-wrapper">
      {/* Editorial Header */}
      <div style={{ margin: '32px 0 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-ocean)', textTransform: 'uppercase' }}>Travel Finance</span>
          <h1 style={{ fontSize: '2.6rem', fontWeight: '800', marginTop: '4px' }}>
            Budget & <span>Expenses</span>
          </h1>
        </div>

        {trips.length > 0 && (
          <div className="form-group" style={{ marginBottom: 0, width: '260px' }}>
            <label className="form-label">Select Journey</label>
            <select value={selectedTripId} onChange={(e) => setSelectedTripId(e.target.value)} className="form-input">
              {trips.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.title} ({t.destination})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Top 3 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div style={{ background: 'var(--surface-card)', padding: '24px', borderRadius: 'var(--border-radius-xl)', border: 'var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>Target Journey Budget</div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-main)' }}>₹{targetBudget.toLocaleString()}</div>
        </div>

        <div style={{ background: 'var(--surface-card)', padding: '24px', borderRadius: 'var(--border-radius-xl)', border: 'var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>Total Amount Spent</div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--accent-sunset)' }}>₹{totalSpent.toLocaleString()}</div>
        </div>

        <div style={{ background: 'var(--surface-card)', padding: '24px', borderRadius: 'var(--border-radius-xl)', border: 'var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '6px' }}>Remaining Budget</div>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: remainingBudget >= 0 ? 'var(--status-success)' : 'var(--status-error)' }}>
            ₹{remainingBudget.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Budget Progress Indicator */}
      <div style={{ background: 'var(--surface-card)', padding: '28px', borderRadius: 'var(--border-radius-xl)', border: 'var(--border-light)', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontWeight: '700', fontSize: '1rem' }}>Budget Consumption</span>
          <span style={{ fontWeight: '800', color: 'var(--accent-ocean)' }}>{percentageSpent}% Spent</span>
        </div>
        <div className="wizard-progress-bar" style={{ height: '10px' }}>
          <div className="wizard-progress-fill" style={{ width: `${percentageSpent}%`, background: percentageSpent > 90 ? 'var(--status-error)' : 'var(--accent-ocean)' }} />
        </div>
      </div>

      {/* 2-Column Workspace: Add Expense Form vs Expense List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        {/* Left: Add Expense Form */}
        <div style={{ background: 'var(--surface-card)', padding: '28px', borderRadius: 'var(--border-radius-xl)', border: 'var(--border-light)', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '16px' }}>Log New Expense</h3>
          <form onSubmit={handleAddExpense}>
            <div className="form-group">
              <label className="form-label">Expense Title</label>
              <input type="text" placeholder="e.g. Dinner by the beach" value={title} onChange={(e) => setTitle(e.target.value)} required className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input type="number" placeholder="1200" value={amount} onChange={(e) => setAmount(e.target.value)} required className="form-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-input">
                <option value="food">Food & Dining</option>
                <option value="sightseeing">Sightseeing & Tickets</option>
                <option value="transport">Transportation</option>
                <option value="hotel">Stays & Lodging</option>
                <option value="shopping">Shopping</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input" />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={isAdding}>
              <Plus size={16} />
              <span>{isAdding ? 'Logging...' : 'Add Expense'}</span>
            </button>
          </form>
        </div>

        {/* Right: Expenses List */}
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '16px' }}>Logged Expenses ({expenses.length})</h3>
          {expenses.length === 0 ? (
            <div style={{ background: 'var(--surface-card)', padding: '48px', borderRadius: 'var(--border-radius-xl)', border: 'var(--border-light)', textAlign: 'center' }}>
              <Wallet size={36} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
              <p style={{ color: 'var(--text-muted)' }}>No expenses logged yet for this trip.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {expenses.map((exp) => (
                <div key={exp._id} style={{ background: 'var(--surface-card)', padding: '18px 24px', borderRadius: 'var(--border-radius-lg)', border: 'var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: '700', padding: '3px 10px', borderRadius: 'var(--border-radius-pill)', background: 'var(--bg-cloud)', color: 'var(--accent-ocean)', textTransform: 'capitalize' }}>
                        {exp.category || 'Food'}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{exp.date ? new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                    </div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{exp.title}</h4>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--accent-sunset)' }}>
                      ₹{Number(exp.amount).toLocaleString()}
                    </div>
                    <button onClick={() => handleDeleteExpense(exp._id)} className="btn-ghost" style={{ padding: '4px', color: 'var(--status-error)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;
