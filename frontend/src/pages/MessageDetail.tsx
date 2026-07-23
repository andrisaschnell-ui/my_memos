import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { 
  getRecording, 
  deleteRecording, 
  updateRecordingText, 
  resummarizeRecording, 
  cleanRecordingTranscript, 
  Recording 
} from '../api/client'

export default function MessageDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [rec, setRec] = useState<Recording | null>(null)
  
  const [summary, setSummary] = useState('')
  const [transcript, setTranscript] = useState('')
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      getRecording(id).then(r => {
        setRec(r)
        setSummary(r.summary)
        setTranscript(r.transcript)
      }).catch(console.error)
    }
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

  const handleSave = async () => {
    if (!id) return
    setLoadingAction('save')
    try {
      const updated = await updateRecordingText(id, summary, transcript)
      setRec(updated)
      alert("Changes saved successfully!")
    } catch (err) {
      console.error(err)
      alert("Failed to save changes.")
    } finally {
      setLoadingAction(null)
    }
  }

  const handleCleanTranscript = async () => {
    if (!id) return
    setLoadingAction('clean')
    try {
      // First save current transcript to backend just in case
      await updateRecordingText(id, summary, transcript)
      const updated = await cleanRecordingTranscript(id, transcript)
      setRec(updated)
      setTranscript(updated.transcript)
      // Optional alert or toast
    } catch (err) {
      console.error(err)
      alert("Failed to clean transcript.")
    } finally {
      setLoadingAction(null)
    }
  }

  const handleResummarize = async () => {
    if (!id) return
    setLoadingAction('resummarize')
    try {
      const updated = await resummarizeRecording(id, transcript)
      setRec(updated)
      setSummary(updated.summary)
    } catch (err) {
      console.error(err)
      alert("Failed to update summary.")
    } finally {
      setLoadingAction(null)
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
        
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px 0', marginBottom: 24, fontSize: 15, alignItems: 'center' }}>
          <div style={{ color: '#64748B', fontWeight: 600 }}>Recorded:</div>
          <div style={{ color: '#1E293B' }}>{format(new Date(rec.created_at), 'dd MMMM yyyy, HH:mm')}</div>
          
          <div style={{ color: '#64748B', fontWeight: 600 }}>Message Name:</div>
          <div>
            <input 
              value={summary}
              onChange={e => setSummary(e.target.value)}
              style={{ width: '100%', padding: '6px 10px', fontSize: 16, fontWeight: 700, color: '#2563EB', border: '1px solid #CBD5E1', borderRadius: 6, boxSizing: 'border-box' }}
            />
          </div>
          
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ color: '#334155', margin: 0 }}>Full English Transcript</h3>
          <button 
            onClick={handleCleanTranscript} 
            disabled={loadingAction === 'clean'}
            style={{ background: '#F1F5F9', color: '#334155', border: '1px solid #CBD5E1', borderRadius: 6, padding: '6px 12px', fontSize: 13, fontWeight: 600, cursor: loadingAction ? 'not-allowed' : 'pointer' }}
          >
            {loadingAction === 'clean' ? 'Cleaning...' : '✨ Clean up Transcript'}
          </button>
        </div>
        
        <textarea
          value={transcript}
          onChange={e => setTranscript(e.target.value)}
          style={{ width: '100%', minHeight: 180, lineHeight: 1.7, background: '#F8FAFC', padding: 20, borderRadius: 8, border: '1px solid #E2E8F0', color: '#334155', fontSize: 16, whiteSpace: 'pre-wrap', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
        />

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button 
            onClick={handleResummarize} 
            disabled={loadingAction === 'resummarize'}
            style={{ background: '#F0F9FF', color: '#0369A1', border: '1px solid #BAE6FD', borderRadius: 6, padding: '10px 16px', fontWeight: 600, cursor: loadingAction ? 'not-allowed' : 'pointer' }}
          >
            {loadingAction === 'resummarize' ? 'Updating...' : '✨ Auto-Update Message Name'}
          </button>
          <button 
            onClick={handleSave} 
            disabled={loadingAction === 'save'}
            style={{ background: '#2563EB', color: '#FFF', border: 'none', borderRadius: 6, padding: '10px 20px', fontWeight: 600, cursor: loadingAction ? 'not-allowed' : 'pointer', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)' }}
          >
            {loadingAction === 'save' ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

