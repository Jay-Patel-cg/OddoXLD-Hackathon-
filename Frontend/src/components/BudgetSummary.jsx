import React from 'react';
import { Wallet, CreditCard, ArrowUpRight, Plus, PieChart, Tag } from 'lucide-react';

const CATEGORY_COLORS = {
  food: '#EE6C4D',
  sightseeing: '#E09F3E',
  transport: '#3B82F6',
  hotel: '#8B5CF6',
  shopping: '#EC4899',
  entertainment: '#10B981',
  other: '#6C727F'
};

const BudgetSummary = ({ summary, expenses = [], onAddExpenseClick }) => {
  const budget = summary?.totalBudget || 0;
  const spent = summary?.totalSpent || 0;
  const remaining = summary?.remaining || (budget - spent);
  const percentage = summary?.percentageUsed || (budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0);

  const categoryBreakdown = summary?.categoryBreakdown || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 3 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--surface-card)', padding: '20px', borderRadius: 'var(--radius-lg)', border: 'var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '8px' }}>
            <span>Total Budget</span>
            <Wallet size={18} color="var(--accent-terracotta)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)' }}>
            ₹{budget.toLocaleString()}
          </div>
        </div>

        <div style={{ background: 'var(--surface-card)', padding: '20px', borderRadius: 'var(--radius-lg)', border: 'var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '8px' }}>
            <span>Total Spent</span>
            <CreditCard size={18} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-amber)' }}>
            ₹{spent.toLocaleString()}
          </div>
        </div>

        <div style={{ background: 'var(--surface-card)', padding: '20px', borderRadius: 'var(--radius-lg)', border: 'var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '8px' }}>
            <span>Remaining Budget</span>
            <ArrowUpRight size={18} color={remaining < 0 ? 'var(--status-error)' : 'var(--status-success)'} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: remaining < 0 ? 'var(--status-error)' : 'var(--status-success)' }}>
            ₹{remaining.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Progress Bar Visualization */}
      <div style={{ background: 'var(--surface-card)', padding: '24px', borderRadius: 'var(--radius-xl)', border: 'var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Budget Usage</span>
          <span style={{ fontWeight: '700', fontSize: '0.95rem', color: percentage > 90 ? 'var(--status-error)' : 'var(--accent-terracotta)' }}>{percentage}% Used</span>
        </div>

        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{
              width: `${Math.min(100, percentage)}%`,
              background: percentage > 100 ? 'var(--status-error)' : 'var(--ai-gradient)'
            }}
          />
        </div>

        {/* Category Breakdown */}
        {Object.keys(categoryBreakdown).length > 0 && (
          <div style={{ marginTop: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {Object.entries(categoryBreakdown).map(([cat, amt]) => {
              const catColor = CATEGORY_COLORS[cat] || CATEGORY_COLORS.other;
              return (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: catColor }} />
                  <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>{cat}:</span>
                  <span style={{ fontWeight: '700' }}>₹{Number(amt).toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Expense List Header & Action */}
      <div style={{ background: 'var(--surface-card)', padding: '24px', borderRadius: 'var(--radius-xl)', border: 'var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Logged Expenses</h3>
          {onAddExpenseClick && (
            <button onClick={onAddExpenseClick} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Plus size={14} />
              <span>Log Expense</span>
            </button>
          )}
        </div>

        {expenses.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
            No expenses logged yet. Keep track of your travel spending here.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {expenses.map((exp) => (
              <div key={exp._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-warm)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{exp.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', gap: '12px', marginTop: '2px' }}>
                    <span style={{ textTransform: 'capitalize' }}>Category: {exp.category}</span>
                    <span>Paid by: {exp.paidBy?.name || 'Member'}</span>
                  </div>
                </div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-main)' }}>
                  ₹{Number(exp.amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetSummary;
