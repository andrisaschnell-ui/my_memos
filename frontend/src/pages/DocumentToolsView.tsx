import { useState, useRef } from 'react'
import { api } from '../api/client'
import { useTranslation } from '../i18n/translations'

export function DocumentToolsView() {
  const { t } = useTranslation()
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<'fast' | 'ocr'>('fast')
  const [loading, setLoading] = useState(false)
  const [progressMsg, setProgressMsg] = useState('')
  const [extractedText, setExtractedText] = useState('')
  const [docxBase64, setDocxBase64] = useState('')
  const [outputFilename, setOutputFilename] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
        setErrorMsg('Only PDF files are supported.')
        setFile(null)
        return
      }
      setFile(selectedFile)
      setErrorMsg('')
      setExtractedText('')
      setDocxBase64('')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile.type !== 'application/pdf' && !droppedFile.name.endsWith('.pdf')) {
        setErrorMsg('Only PDF files are supported.')
        setFile(null)
        return
      }
      setFile(droppedFile)
      setErrorMsg('')
      setExtractedText('')
      setDocxBase64('')
    }
  }

  const handleRemoveFile = () => {
    setFile(null)
    setExtractedText('')
    setDocxBase64('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleConvert = async () => {
    if (!file) return
    setLoading(true)
    setErrorMsg('')
    setExtractedText('')
    setDocxBase64('')
    setProgressMsg(mode === 'ocr' ? 'Analyzing and performing AI Visual OCR page-by-page... (This can take up to a minute for larger PDFs)' : 'Reading PDF text directly...')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('mode', mode)

      const resp = await api.post('/document/pdf-to-docx', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000 // 2 minute timeout for long NVIDIA vision OCR jobs
      })

      if (resp.data.success) {
        setExtractedText(resp.data.text)
        setDocxBase64(resp.data.docx_base64)
        setOutputFilename(resp.data.filename)
      } else {
        setErrorMsg('Conversion failed. Please try again.')
      }
    } catch (err: any) {
      console.error('Error converting document:', err)
      setErrorMsg(err.response?.data?.detail || 'Failed to convert PDF. Ensure file is valid and API key is active.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!docxBase64 || !outputFilename) return
    try {
      const byteCharacters = atob(docxBase64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = outputFilename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      setErrorMsg('Failed to compile downloadable Word file.')
    }
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem', animation: 'fadeIn 0.3s ease-in' }}>
      
      {/* Visual Header Banner */}
      <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '2rem', borderRadius: '16px', border: '1px solid #334155', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, color: '#38bdf8', fontSize: '1.8rem', fontWeight: 800 }}>📄 {t.docTools || 'Document Tools'}</h2>
        <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8', fontSize: '0.95rem' }}>
          Upload PDF reports, guidelines, or immigration documents, extract text automatically, and convert them to editable Microsoft Word (.docx) files.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Side: Upload & Configuration Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Upload Box */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed #3b82f6',
              borderRadius: '16px',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              background: '#1e293b',
              cursor: 'pointer',
              transition: 'border-color 0.2s, background-color 0.2s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.8rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#60a5fa'
              e.currentTarget.style.backgroundColor = '#1e293b99'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6'
              e.currentTarget.style.backgroundColor = '#1e293b'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              style={{ display: 'none' }}
            />
            <div style={{ fontSize: '3rem' }}>📂</div>
            <div style={{ fontWeight: 'bold', color: '#f8fafc', fontSize: '1.1rem' }}>
              Drag & Drop PDF here
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              or click to browse from device
            </div>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div style={{ background: '#7f1d1d', border: '1px solid #ef4444', color: '#fca5a5', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Selected File Card Details */}
          {file && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1e293b', padding: '1rem 1.2rem', borderRadius: '12px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', overflow: 'hidden' }}>
                <span style={{ fontSize: '1.5rem' }}>📄</span>
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <div style={{ fontWeight: 'bold', color: '#f8fafc', fontSize: '0.95rem' }} title={file.name}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                style={{ background: '#334155', color: '#f8fafc', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Configuration Settings Box */}
          <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#f8fafc', fontSize: '1.1rem', fontWeight: 700 }}>⚙️ Extraction Mode</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', border: mode === 'fast' ? '1px solid #3b82f6' : '1px solid transparent', background: mode === 'fast' ? '#172554' : 'transparent' }}>
                <input
                  type="radio"
                  name="extraction_mode"
                  checked={mode === 'fast'}
                  onChange={() => setMode('fast')}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#f8fafc', fontSize: '0.9rem' }}>Fast Text Extraction</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                    Directly parses embedded digital text from PDF. Fast and best for standard digital text reports.
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', border: mode === 'ocr' ? '1px solid #3b82f6' : '1px solid transparent', background: mode === 'ocr' ? '#172554' : 'transparent' }}>
                <input
                  type="radio"
                  name="extraction_mode"
                  checked={mode === 'ocr'}
                  onChange={() => setMode('ocr')}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#f8fafc', fontSize: '0.9rem' }}>AI Visual OCR Mode (NVIDIA Vision LLM)</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                    Renders PDF pages as images and uses the Llama Vision LLM to perform advanced word-for-word OCR. Best for scanned, photographed, or poorly formatted documents.
                  </div>
                </div>
              </label>
            </div>

            <button
              onClick={handleConvert}
              disabled={!file || loading}
              style={{
                width: '100%',
                padding: '0.8rem',
                marginTop: '1.5rem',
                background: !file ? '#334155' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                color: !file ? '#94a3b8' : '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: !file ? 'not-allowed' : 'pointer',
                transition: 'transform 0.1s'
              }}
            >
              {loading ? 'Processing Document...' : 'Convert PDF to Word'}
            </button>
          </div>
        </div>

        {/* Right Side: Preview Panel & Download Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
          
          {/* File Processing Spinner */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '4rem 2rem', textAlign: 'center', height: '400px' }}>
              <div style={{ border: '4px solid #334155', borderTop: '4px solid #38bdf8', borderRadius: '50%', width: '48px', height: '48px', animation: 'spin 1s linear infinite' }}></div>
              <div style={{ fontWeight: 'bold', color: '#f8fafc' }}>Extracting Text...</div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '300px' }}>{progressMsg}</div>
              
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}

          {/* Success File Preview Pane */}
          {!loading && docxBase64 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '1.5rem', height: '100%' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#10b981', fontSize: '1.1rem', fontWeight: 700 }}>🎉 Extraction Successful!</h3>
                <button
                  onClick={handleDownload}
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  📥 Download Word File
                </button>
              </div>

              {/* Text Preview Screen Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>📝 Extracted Text Preview:</span>
                <textarea
                  readOnly
                  value={extractedText}
                  style={{
                    width: '100%',
                    height: '350px',
                    background: '#0f172a',
                    color: '#e2e8f0',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '1rem',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    resize: 'none',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          )}

          {/* Default Empty State preview panel */}
          {!loading && !docxBase64 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '4rem 2rem', textAlign: 'center', height: '400px', color: '#64748b' }}>
              <div style={{ fontSize: '4rem' }}>📝</div>
              <div style={{ fontSize: '0.95rem' }}>No document processed yet.</div>
              <div style={{ fontSize: '0.8rem', maxWidth: '250px' }}>Upload a PDF file and click "Convert PDF to Word" to see text preview and get download link here.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
