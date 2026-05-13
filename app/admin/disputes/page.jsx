'use client';
import { useState, useEffect } from 'react';

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolution, setResolution] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const res = await fetch('/api/admin/disputes');
      const data = await res.json();
      if (res.ok) setDisputes(data.disputes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (status) => {
    if (!resolution) return alert('Please provide a resolution message');
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/disputes/${selectedDispute._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolution }),
      });
      if (res.ok) {
        alert('Dispute resolved');
        setSelectedDispute(null);
        setResolution('');
        fetchDisputes();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-24 text-center">Loading...</div>;

  return (
    <div className="min-h-screen pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Dispute <span className="gradient-text">Resolution Center</span></h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dispute List */}
          <div className="lg:col-span-2 space-y-4">
            {disputes.length === 0 ? (
              <div className="glass-card p-12 text-center text-slate-500">No active disputes</div>
            ) : (
              disputes.map((d) => (
                <div 
                  key={d._id} 
                  onClick={() => setSelectedDispute(d)}
                  className={`glass-card p-6 cursor-pointer border-l-4 transition-all ${
                    selectedDispute?._id === d._id ? 'border-indigo-500 bg-slate-800/50' : 
                    d.status === 'pending' ? 'border-rose-500' : 'border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{d.reason}</h3>
                    <span className={`badge ${
                      d.status === 'pending' ? 'bg-rose-500/20 text-rose-400' : 
                      d.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{d.details}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Raised by: {d.raisedBy?.name} ({d.raisedBy?.role})</span>
                    <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Resolution Panel */}
          <div className="lg:col-span-1">
            {selectedDispute ? (
              <div className="glass-card p-8 sticky top-24 animate-fade-in">
                <h2 className="text-xl font-bold mb-4">Resolve Dispute</h2>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold">Reason</label>
                    <p className="text-white">{selectedDispute.reason}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold">Details</label>
                    <p className="text-slate-300 text-sm leading-relaxed">{selectedDispute.details}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 uppercase font-bold">Booking</label>
                    <p className="text-slate-300 text-sm">ID: {selectedDispute.bookingId?._id}</p>
                    <p className="text-slate-300 text-sm">Category: {selectedDispute.bookingId?.category}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 block mb-1">Admin Resolution Note</label>
                    <textarea 
                      className="input-field min-h-[100px]"
                      placeholder="Explain the resolution to the user..."
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleResolve('resolved')}
                      disabled={updating}
                      className="flex-1 btn-success py-3 text-sm justify-center"
                    >
                      Resolve
                    </button>
                    <button 
                      onClick={() => handleResolve('dismissed')}
                      disabled={updating}
                      className="flex-1 btn-secondary py-3 text-sm justify-center"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center text-slate-500 sticky top-24">
                Select a dispute from the list to begin resolution
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
