import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { getRecording, deleteRecording, Recording } from '../api/client'

export default function MessageDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rec, setRec] = useState<Recording | null>(null)

  useEffect(() => {
    if (id) getRecording(id).then(setRec).catch(console.error)
  }, [id])

  const handleDelete = async () => {
    if (!id || !window.confirm("Are you sure you want to delete this message?")) return
    try {
      await deleteRecording(id)
      navigate('/')
    } catch (err) {
      console.error(err)
    }
  }

  if (!rec) return <div style={{ maxWidth: 700, margin: '40px auto', padding: 24, fontFamily: 'sans-serif' }}>Loading memo details...</div>

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#2563EB', textDecoration: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 16 }}>
          ← Back
        </button>
        <button onClick={handleDelete} style={{ background: '#EF4444', color: '#FFF', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}>
          🗑️ Delete Message
        </button>
      </div>
      
      <div style={{ background: '#FFF', borderRadius: 12, border: '1px solid #E2E8F0', padding: 32, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#1E293B', fontSize: '1.5rem' }}>🧠 Memo Details</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px 0', marginBottom: 24, fontSize: 15 }}>
          <div style={{ color: '#64748B', fontWeight: 600 }}>Recorded:</div>
          <div style={{ color: '#1E293B' }}>{format(new Date(rec.created_at), 'dd MMMM yyyy, HH:mm')}</div>
          
          <div style={{ color: '#64748B', fontWeight: 600 }}>Message Name:</div>
          <div style={{ color: '#2563EB', fontWeight: 700, fontSize: 17 }}>{rec.summary}</div>
          
          {rec.client && (
            <>
              <div style={{ color: '#64748B', fontWeight: 600 }}>Client:</div>
              <div style={{ color: '#1E293B', fontWeight: 600 }}>{rec.client.name}</div>
            </>
          )}

          <div style={{ color: '#64748B', fontWeight: 600 }}>Status:</div>
          <div style={{ textTransform: 'capitalize', fontWeight: 600, color: rec.status === 'urgent' ? '#DC2626' : rec.status === 'done' ? '#16A34A' : '#475569' }}>{rec.status}</div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '24px 0' }} />

        <h3 style={{ color: '#334155', marginTop: 0 }}>Full English Transcript</h3>
        <p style={{ lineHeight: 1.7, background: '#F8FAFC', padding: 20, borderRadius: 8, border: '1px solid #E2E8F0', color: '#334155', fontSize: 16, whiteSpace: 'pre-wrap' }}>
          {rec.transcript}
        </p>
      </div>
    </div>
  )
}
