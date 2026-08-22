import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { generateTripPlan, saveTripPlan } from '../api';
import { getDestinationImage } from '../data/destinationImages';
import { getActivityImage } from '../data/activityImages';
import { Compass, Calendar, Wallet, Users, ArrowRight, ArrowLeft, AlertCircle, RefreshCw, MapPin, Clock, Sparkles } from 'lucide-react';

const DYNAMIC_LOADING_MESSAGES = [
  'Understanding your travel preferences...',
  'Finding the right places and spots...',
  'Building your personalized itinerary...',
  'Balancing your target budget...',
  'Putting the journey together...'
];

const TRAVEL_STYLES = [
  { id: 'balanced', title: 'Balanced', desc: 'Mix of iconic landmarks, local food, and relaxation' },
  { id: 'budget', title: 'Budget Explorer', desc: 'Backpacker-friendly spots, local street food & transit' },
  { id: 'luxury', title: 'Comfort & Luxury', desc: 'Premium dining, high-end stays, and private transfers' },
  { id: 'adventure', title: 'Adventure & Nature', desc: 'Outdoor sports, trekking, scenic vistas, and thrills' },
  { id: 'relaxed', title: 'Relaxed & Wellness', desc: 'Leisurely pace, beaches, spas, and unhurried days' }
];

const CATEGORY_COLORS = {
  food: { bg: '#FDF0EC', text: '#EE6C4D' },
  sightseeing: { bg: '#FDF0EA', text: '#E85D2A' },
  transport: { bg: '#F0F4F8', text: '#4B6584' },
  hotel: { bg: '#F4F0F9', text: '#8B5CF6' },
  shopping: { bg: '#FAF3EA', text: '#D4A373' },
  entertainment: { bg: '#ECFDF5', text: '#10B981' },
  adventure: { bg: '#F4F5F0', text: '#6B705C' },
  relaxation: { bg: '#EFF6F1', text: '#3F7D52' },
  other: { bg: '#F3F4F6', text: '#6B7280' }
};

const AiPlanner = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  // 13-Step Planner State
  const [destination, setDestination] = useState(searchParams.get('destination') || 'Goa');
  const [startDate, setStartDate] = useState('2026-12-01');
  const [endDate, setEndDate] = useState('2026-12-05');
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState(25000);
  const [currency, setCurrency] = useState('INR');
  const [travelStyle, setTravelStyle] = useState('balanced');
  const [interests, setInterests] = useState(['sightseeing', 'food']);
  const [activities, setActivities] = useState(['Trekking', 'Local markets']);
  const [accommodation, setAccommodation] = useState('boutique');
  const [transport, setTransport] = useState('private');
  const [pace, setPace] = useState('balanced');
  const [requirements, setRequirements] = useState([]);
  const [notes, setNotes] = useState('');

  // Generation & Result State
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let interval;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % DYNAMIC_LOADING_MESSAGES.length);
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const togglePill = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleGenerate = async () => {
    setError('');
    setIsGenerating(true);
    setGeneratedPlan(null);

    const payload = {
      destination: destination.trim(),
      startDate,
      endDate,
      budget: Number(budget),
      currency,
      travelers: Number(travelers),
      travelStyle,
      interests,
      additionalNotes: `Accommodation: ${accommodation}. Transport: ${transport}. Pace: ${pace}. Requirements: ${requirements.join(', ')}. ${notes}`.trim()
    };

    try {
      const res = await generateTripPlan(payload);

      if (res.success && res.data && res.data.plan) {
        setGeneratedPlan(res.data.plan);
      } else {
        throw new Error(res.message || 'AI engine failed to construct trip plan.');
      }
    } catch (err) {
      setError(err.message || 'We couldn\'t build your itinerary right now. Please verify your inputs and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!generatedPlan) return;
    setIsSaving(true);
    setError('');

    try {
      const res = await saveTripPlan({ plan: generatedPlan });
      if (res.success && res.data && res.data.trip) {
        navigate(`/trips/${res.data.trip._id}`);
      } else {
        throw new Error(res.message || 'Failed to save trip plan');
      }
    } catch (err) {
      setError(err.message || 'Failed to save trip. Please ensure you are signed in.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="main-wrapper">
      {/* Editorial Header */}
      <div style={{ textAlign: 'center', margin: '32px 0 24px 0' }}>
        <h1 style={{ fontSize: '2.8rem', fontWeight: '800', marginBottom: '8px' }}>
          Plan something <span>unforgettable.</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Tell us what you want. Musafir will design the journey.
        </p>
      </div>

      {error && (
        <div style={{ maxWidth: '720px', margin: '0 auto 24px auto', background: 'rgba(217, 56, 56, 0.1)', color: 'var(--status-error)', padding: '16px 20px', borderRadius: 'var(--border-radius-md)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertCircle size={20} />
          <div style={{ flex: 1 }}>{error}</div>
        </div>
      )}

      {/* Dynamic AI Loading Screen */}
      {isGenerating && (
        <div style={{ textAlign: 'center', padding: '80px 20px', maxWidth: '540px', margin: '0 auto' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-sand)', color: 'var(--accent-terracotta)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <Compass size={32} className="spin" />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '12px' }}>
            Building your journey to {destination}...
          </h2>
          <p style={{ color: 'var(--accent-terracotta)', fontSize: '1.1rem', fontWeight: '700', minHeight: '30px' }}>
            {DYNAMIC_LOADING_MESSAGES[loadingMsgIdx]}
          </p>
        </div>
      )}

      {/* Generated Result Screen (Desktop 2-Column Layout) */}
      {!isGenerating && generatedPlan && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', maxWidth: '1280px', margin: '0 auto' }}>
          {/* Left Column: Visual Itinerary Timeline */}
          <div>
            {generatedPlan.stops?.map((stop, stopIdx) => {
              const stopImg = getDestinationImage(stop.cityName || destination);

              return (
                <div key={stopIdx} style={{ marginBottom: '48px' }}>
                  {/* Visual Day Banner Image */}
                  <div
                    style={{
                      position: 'relative',
                      height: '240px',
                      borderRadius: 'var(--border-radius-xl)',
                      overflow: 'hidden',
                      marginBottom: '24px',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <img src={stopImg} alt={stop.cityName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(24, 24, 24, 0.85) 0%, rgba(24, 24, 24, 0.1) 60%)', display: 'flex', alignItems: 'flex-end', padding: '24px' }}>
                      <div style={{ color: '#FFF' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', background: 'var(--accent-terracotta)', color: '#FFF', padding: '4px 12px', borderRadius: 'var(--border-radius-pill)', textTransform: 'uppercase' }}>
                          Day {stopIdx + 1} · {stop.cityName}
                        </span>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#FFF', marginTop: '6px' }}>
                          {stop.notes || `${stop.cityName} Exploration`}
                        </h2>
                      </div>
                    </div>
                  </div>

                  {/* Image-Rich Activity Timeline */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {stop.activities?.map((act, actIdx) => {
                      const actImg = getActivityImage(act, stop.cityName);
                      const catStyle = CATEGORY_COLORS[act.category] || CATEGORY_COLORS.other;

                      return (
                        <div
                          key={actIdx}
                          style={{
                            background: 'var(--surface-card)',
                            borderRadius: 'var(--border-radius-lg)',
                            border: 'var(--border-light)',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'grid',
                            gridTemplateColumns: '200px 1fr',
                            overflow: 'hidden'
                          }}
                        >
                          <img src={actImg} alt={act.title} style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '140px' }} />
                          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)' }}>
                                  <Clock size={13} />
                                  <span>{act.startTime || '09:00'} — {act.endTime || '11:00'}</span>
                                </div>
                                <span style={{ fontSize: '0.78rem', fontWeight: '700', padding: '3px 10px', borderRadius: 'var(--border-radius-pill)', background: catStyle.bg, color: catStyle.text, textTransform: 'capitalize' }}>
                                  {act.category || 'Sightseeing'}
                                </span>
                              </div>

                              <h4 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '6px' }}>{act.title}</h4>
                              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '12px' }}>
                                {act.description}
                              </p>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: 'var(--border-light)', paddingTop: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                <MapPin size={13} color="var(--accent-terracotta)" />
                                <span>{act.location || stop.cityName}</span>
                              </div>
                              <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--accent-terracotta)' }}>
                                ₹{Number(act.estimatedCost || 0).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Sticky Trip Summary Sidebar */}
          <div style={{ position: 'sticky', top: '96px', alignSelf: 'flex-start' }}>
            <div style={{ background: 'var(--surface-card)', padding: '28px', borderRadius: 'var(--border-radius-xl)', border: 'var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
              <img src={getDestinationImage(destination)} alt={destination} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--border-radius-lg)', marginBottom: '20px' }} />

              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--accent-terracotta)', textTransform: 'uppercase' }}>Trip Overview</span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '4px 0 8px 0' }}>
                {generatedPlan.trip?.title || destination}
              </h3>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                {generatedPlan.trip?.startDate} — {generatedPlan.trip?.endDate} · {travelers} Travelers
              </div>

              {/* Budget Progress Indicator */}
              <div style={{ background: 'var(--bg-warm)', padding: '18px', borderRadius: 'var(--border-radius-lg)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Target Budget</span>
                  <span style={{ fontWeight: '800' }}>₹{(generatedPlan.trip?.budget || budget).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Estimated Cost</span>
                  <span style={{ fontWeight: '800', color: 'var(--accent-terracotta)' }}>₹{(generatedPlan.summary?.estimatedTotalCost || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Remaining</span>
                  <span style={{ fontWeight: '800', color: 'var(--status-success)' }}>₹{(generatedPlan.summary?.remainingBudget || 0).toLocaleString()}</span>
                </div>

                <div className="wizard-progress-bar" style={{ height: '8px', marginBottom: '4px' }}>
                  <div className="wizard-progress-fill" style={{ width: `${Math.min(100, generatedPlan.summary?.percentageOfBudget || 70)}%` }} />
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.78rem', fontWeight: '700', color: 'var(--accent-terracotta)' }}>
                  {generatedPlan.summary?.percentageOfBudget || 70}% Planned
                </div>
              </div>

              <button onClick={handleSaveTrip} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} disabled={isSaving}>
                <span>{isSaving ? 'Saving Trip...' : 'Save This Trip'}</span>
                <ArrowRight size={18} />
              </button>

              <button onClick={() => setGeneratedPlan(null)} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>
                <RefreshCw size={16} />
                <span>Modify & Regenerate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 13-Step Guided Wizard Form */}
      {!isGenerating && !generatedPlan && (
        <div className="wizard-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-muted)' }}>
            <span>Step {step} of 13</span>
            <span>{Math.round((step / 13) * 100)}% Completed</span>
          </div>

          <div className="wizard-progress-bar">
            <div className="wizard-progress-fill" style={{ width: `${(step / 13) * 100}%` }} />
          </div>

          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>Where do you want to go?</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Enter your dream city or country destination.</p>
              <div className="form-group">
                <label className="form-label">Destination City</label>
                <input type="text" placeholder="e.g. Goa, Jaipur, Manali, Bali, Paris" value={destination} onChange={(e) => setDestination(e.target.value)} className="form-input" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>When are you traveling?</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Select your start and end dates.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-input" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>How many travelers?</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Specify your travel group size.</p>
              <div className="form-group">
                <label className="form-label">Number of Travelers</label>
                <input type="number" min="1" max="20" value={travelers} onChange={(e) => setTravelers(e.target.value)} className="form-input" />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>What's your total budget?</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Set your budget target for activities and stays.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Budget Amount</label>
                  <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="form-input">
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>Choose your travel style</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Select the overall vibe for your journey.</p>
              <div className="selectable-grid">
                {TRAVEL_STYLES.map((s) => (
                  <div key={s.id} onClick={() => setTravelStyle(s.id)} className={`selectable-card ${travelStyle === s.id ? 'selected' : ''}`}>
                    <div style={{ fontWeight: '700', fontSize: '1.05rem', marginBottom: '4px' }}>{s.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>What are your primary interests?</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Select all that apply.</p>
              <div className="pill-container">
                {['sightseeing', 'food', 'nature', 'shopping', 'nightlife', 'wellness', 'history'].map((item) => (
                  <div key={item} onClick={() => togglePill(interests, setInterests, item)} className={`pill-item ${interests.includes(item) ? 'selected' : ''}`}>
                    {item.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 7 && (
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>Preferred activities</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Select activities you would love to experience.</p>
              <div className="pill-container">
                {['Trekking', 'Museums', 'Water sports', 'Fine dining', 'Local markets', 'Beach relaxation', 'Historical tours'].map((item) => (
                  <div key={item} onClick={() => togglePill(activities, setActivities, item)} className={`pill-item ${activities.includes(item) ? 'selected' : ''}`}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 8 && (
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>Accommodation preference</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Where do you prefer to stay?</p>
              <div className="selectable-grid">
                {[
                  { id: 'boutique', title: 'Boutique Hotel', desc: 'Unique charm and personalized hospitality' },
                  { id: 'resort', title: 'Luxury Resort', desc: 'Full amenities, pools, and relaxation' },
                  { id: 'hostel', title: 'Social Hostel', desc: 'Budget-friendly and great for meeting travelers' },
                  { id: 'heritage', title: 'Heritage Stay', desc: 'Authentic regional architecture and history' }
                ].map((a) => (
                  <div key={a.id} onClick={() => setAccommodation(a.id)} className={`selectable-card ${accommodation === a.id ? 'selected' : ''}`}>
                    <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '4px' }}>{a.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{a.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 9 && (
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>Transportation preference</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>How do you prefer getting around?</p>
              <div className="selectable-grid">
                {[
                  { id: 'private', title: 'Private Transfers', desc: 'Chauffeur driven cars and seamless transfers' },
                  { id: 'public', title: 'Public Transit & Train', desc: 'Scenic trains, metro, and local buses' },
                  { id: 'rental', title: 'Self-Drive Rental', desc: 'Freedom to explore at your own pace' },
                  { id: 'flight', title: 'Flight + Taxi', desc: 'Fastest transit between major hubs' }
                ].map((t) => (
                  <div key={t.id} onClick={() => setTransport(t.id)} className={`selectable-card ${transport === t.id ? 'selected' : ''}`}>
                    <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '4px' }}>{t.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 10 && (
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>What pace do you prefer?</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Choose your daily scheduling density.</p>
              <div className="selectable-grid">
                {[
                  { id: 'packed', title: 'Packed & Fast', desc: 'See as much as possible every single day' },
                  { id: 'balanced', title: 'Balanced Vibe', desc: '2-3 major activities per day with free time' },
                  { id: 'slow', title: 'Slow & Leisurely', desc: 'Unplanned mornings and unhurried afternoons' }
                ].map((p) => (
                  <div key={p.id} onClick={() => setPace(p.id)} className={`selectable-card ${pace === p.id ? 'selected' : ''}`}>
                    <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '4px' }}>{p.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 11 && (
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>Special requirements</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Any specific needs for your group?</p>
              <div className="pill-container">
                {['Vegetarian food', 'Halal food', 'Accessibility needed', 'Family-friendly', 'Pet-friendly'].map((req) => (
                  <div key={req} onClick={() => togglePill(requirements, setRequirements, req)} className={`pill-item ${requirements.includes(req) ? 'selected' : ''}`}>
                    {req}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 12 && (
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>Additional notes</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Specify custom instructions or must-see places.</p>
              <div className="form-group">
                <textarea rows="4" placeholder="e.g. Include a sunset dinner on the last day, prefer early morning starts..." value={notes} onChange={(e) => setNotes(e.target.value)} className="form-input" style={{ resize: 'vertical' }} />
              </div>
            </div>
          )}

          {step === 13 && (
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>Review your trip preferences</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>Confirm your selections before generating.</p>

              <div style={{ background: 'var(--bg-warm)', padding: '20px', borderRadius: 'var(--border-radius-lg)', marginBottom: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Destination</span>
                  <div style={{ fontWeight: '700' }}>{destination}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dates</span>
                  <div style={{ fontWeight: '700' }}>{startDate} — {endDate}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Travelers & Style</span>
                  <div style={{ fontWeight: '700' }}>{travelers} Travelers · {travelStyle.toUpperCase()}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Budget</span>
                  <div style={{ fontWeight: '700', color: 'var(--accent-terracotta)' }}>₹{Number(budget).toLocaleString()} {currency}</div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            )}

            {step < 13 ? (
              <button onClick={() => setStep(step + 1)} className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                <span>Continue</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={handleGenerate} className="btn-primary" style={{ flex: 2, justifyContent: 'center', padding: '14px' }}>
                <Compass size={18} />
                <span>Generate My Trip ✦</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiPlanner;
