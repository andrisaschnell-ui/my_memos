import { useState, useEffect } from 'react'
import { api } from '../api/client'

interface ImmigrationRow {
  no: number
  guest_id: string
  reservation_id: string
  full_name: string
  nationality: string | null
  passport_number: string | null
  date_of_issue: string | null
  arrived_from: string | null
  visa_number: string | null
  visa_validity: string | null
  check_in: string | null
  check_out: string | null
}

export function ImmigrationView() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString().split('T')[0]
  })
  
  const [rows, setRows] = useState<ImmigrationRow[]>([])
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<'PT' | 'EN'>('PT')
  const [downloadingDocx, setDownloadingDocx] = useState(false)
  const [downloadingExcel, setDownloadingExcel] = useState(false)
  
  const activeLodgeId = localStorage.getItem('activeLodgeId') || ''
  const activeLodgeName = localStorage.getItem('activeLodgeName') || 'Default Lodge'
  const [lodgeLocation, setLodgeLocation] = useState('')
  const [locationSaving, setLocationSaving] = useState(false)
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null)
  
  const loadLocation = async () => {
    if (!activeLodgeId) return
    const email = localStorage.getItem('auth_email')
    if (email) {
      try {
        const resp = await api.get('/auth/lodges', { params: { email } })
        const lodgesList = resp.data || []
        const active = lodgesList.find((l: any) => l.id === activeLodgeId)
        if (active && active.location) {
          setLodgeLocation(active.location)
        } else {
          setLodgeLocation('')
        }
      } catch (err) {
        console.error('Error loading lodge location:', err)
      }
    }
  }

  const loadData = async () => {
    if (!startDate || !endDate) return
    setLoading(true)
    try {
      const resp = await api.get('/lodge/immigration-report', {
        params: { start_date: startDate, end_date: endDate }
      })
      setRows(resp.data || [])
    } catch (err) {
      console.error('Error loading immigration report data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLocation()
    loadData()
  }, [startDate, endDate, activeLodgeId])

  const handleSaveLocation = async () => {
    if (!activeLodgeId) return
    setLocationSaving(true)
    try {
      await api.put(`/auth/lodges/${activeLodgeId}/location`, { location: lodgeLocation })
      alert(language === 'EN' ? 'Lodge location saved!' : 'Localização do lodge guardada!')
    } catch (err) {
      console.error('Failed to save lodge location:', err)
      alert(language === 'EN' ? 'Failed to save location' : 'Falha ao guardar localização')
    } finally {
      setLocationSaving(false)
    }
  }

  const handleUpdateRowField = async (row: ImmigrationRow, field: string, value: string) => {
    // Send updated guest profile to backend
    try {
      const updatedData = {
        full_name: field === 'full_name' ? value : row.full_name,
        nationality: field === 'nationality' ? value : row.nationality,
        passport_number: field === 'passport_number' ? value : row.passport_number,
        date_of_issue: field === 'date_of_issue' ? value : row.date_of_issue,
        arrived_from: field === 'arrived_from' ? value : row.arrived_from,
        visa_number: field === 'visa_number' ? value : row.visa_number,
        visa_validity: field === 'visa_validity' ? value : row.visa_validity,
        check_in: row.check_in,
        check_out: row.check_out
      }
      
      await api.put(`/lodge/guests/${row.guest_id}`, updatedData)
      
      // Update local state
      setRows(prev =>
        prev.map(r => (r.guest_id === row.guest_id ? { ...r, [field]: value } : r))
      )
    } catch (err) {
      console.error('Error updating guest details:', err)
      alert(language === 'EN' ? 'Failed to update details' : 'Falha ao atualizar detalhes')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadDocx = async () => {
    if (!startDate || !endDate) return
    setDownloadingDocx(true)
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        language,
        lodge_name: activeLodgeName,
        lodge_location: lodgeLocation || '',
      })
      const resp = await api.get(`/lodge/immigration-report/docx?${params.toString()}`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([resp.data]))
      const a = document.createElement('a')
      a.href = url
      // Derive filename from Content-Disposition or fallback
      const cd = resp.headers['content-disposition'] || ''
      const match = cd.match(/filename="?([^"]+)"?/)
      a.download = match ? match[1] : `boletim_${activeLodgeName.replace(/ /g,'_')}_${startDate}.docx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading DOCX:', err)
      alert(language === 'EN' ? 'Failed to download Word document.' : 'Falha ao descarregar o documento Word.')
    } finally {
      setDownloadingDocx(false)
    }
  }

  const handleDownloadExcel = async () => {
    if (!startDate || !endDate) return
    setDownloadingExcel(true)
    try {
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        language,
        lodge_name: activeLodgeName,
        lodge_location: lodgeLocation || '',
      })
      const resp = await api.get(`/lodge/immigration-report/excel?${params.toString()}`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([resp.data]))
      const a = document.createElement('a')
      a.href = url
      const cd = resp.headers['content-disposition'] || ''
      const match = cd.match(/filename="?([^"]+)"?/)
      a.download = match ? match[1] : `boletim_${activeLodgeName.replace(/ /g,'_')}_${startDate}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading Excel:', err)
      alert(language === 'EN' ? 'Failed to download Excel document.' : 'Falha ao descarregar o documento Excel.')
    } finally {
      setDownloadingExcel(false)
    }
  }

  // Translation helpers
  const labels = {
    PT: {
      title: "Boletim de Alojamento / Lista de Migração",
      rep: "REPÚBLICA DE MOÇAMBIQUE",
      interior: "MINISTÉRIO DO INTERIOR",
      migration: "SERVIÇO NACIONAL DE MIGRAÇÃO",
      inham: "DIRECÇÃO PROVINCIAL DE MIGRAÇÃO - INHAMBANE",
      operations: "DEPARTAMENTO DE OPERAÇÕES MIGRATÓRIAS",
      movement: "REPARTIÇÃO DO MOVIMENTO MIGRATÓRIO",
      post: "POSTO DE TRAVESSIA AÉREO DE VILANKULO",
      law: "BOLETIM DE ALOJAMENTO, PLASMADO NO ARTIGO 40 DA LEI N°23/2022 DE 29 DE DEZEMBRO",
      location: "LOCALIZAÇÃO",
      establishment: "Nome do estabelecimento turístico",
      month: "Mês",
      date: "Data",
      startDate: "Data de Início",
      endDate: "Data de Fim",
      printBtn: "Imprimir Lista 🖨️",
      docxBtn: "Descarregar Word 📄",
      excelBtn: "Descarregar Excel 📊",
      saveLocBtn: "Gravar",
      loading: "A carregar dados...",
      noData: "Nenhum hóspede encontrado para o período selecionado.",
      colNo: "N/O",
      colName: "NOME COMPLETO",
      colNat: "NACIONALIDADE",
      colPass: "Nº PASSAPORTE",
      colIssue: "DATA EMISSÃO",
      colArrived: "PROVENIÊNCIA",
      colVisa: "VISTO Nº",
      colVal: "VALIDADE",
      colEntry: "ENTRADA",
      colExit: "SAÍDA",
      locationPlaceholder: "Digite a localização (ex: CHIBUENE)"
    },
    EN: {
      title: "Accommodation Report / Immigration List",
      rep: "REPUBLIC OF MOZAMBIQUE",
      interior: "MINISTRY OF INTERIOR",
      migration: "NATIONAL MIGRATION SERVICE",
      inham: "PROVINCIAL MIGRATION DIRECTION - INHAMBANE",
      operations: "MIGRATION OPERATIONS DEPARTMENT",
      movement: "MIGRATORY MOVEMENT SECTION",
      post: "VILANKULO AIR PORT OF ENTRY",
      law: "ACCOMMODATION BULLETIN, OUTLINED IN ARTICLE 40 OF LAW N°23/2022 OF DECEMBER 29",
      location: "LOCATION",
      establishment: "Name of tourist establishment",
      month: "Month",
      date: "Date",
      startDate: "Start Date",
      endDate: "End Date",
      printBtn: "Print List 🖨️",
      docxBtn: "Download Word 📄",
      excelBtn: "Download Excel 📊",
      saveLocBtn: "Save",
      loading: "Loading data...",
      noData: "No guests found for the selected period.",
      colNo: "N/O",
      colName: "FULL NAME",
      colNat: "NATIONALITY",
      colPass: "PASSPORT Nº",
      colIssue: "DATE OF ISSUE",
      colArrived: "ARRIVED FROM",
      colVisa: "VISA Nº",
      colVal: "VALIDITY",
      colEntry: "ENTRY",
      colExit: "EXIT",
      locationPlaceholder: "Enter location (e.g. CHIBUENE)"
    }
  }

  const t = labels[language]

  // Helper to extract current month name in Portuguese/English based on date range
  const getMonthName = () => {
    if (!startDate) return ''
    const d = new Date(startDate)
    const monthIndex = d.getMonth()
    const monthsPT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    const monthsEN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return language === 'PT' ? monthsPT[monthIndex] : monthsEN[monthIndex]
  }

  const getFormattedToday = () => {
    const today = new Date()
    const d = String(today.getDate()).padStart(2, '0')
    const m = String(today.getMonth() + 1).padStart(2, '0')
    const y = today.getFullYear()
    return `${d}/${m}/${y}`
  }

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* CSS overrides for printing format */}
      <style>{`
        @media print {
          body {
            background: #fff !important;
            color: #000 !important;
            font-family: Arial, sans-serif !important;
          }
          .no-print {
            display: none !important;
          }
          .print-header {
            display: block !important;
            color: #000 !important;
            margin-bottom: 20px;
          }
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          .print-table th, .print-table td {
            border: 1px solid #000 !important;
            padding: 6px 4px !important;
            font-size: 10px !important;
            color: #000 !important;
          }
          .print-table th {
            background-color: #f2f2f2 !important;
            font-weight: bold !important;
          }
          .print-container {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          @page {
            size: A4 landscape;
            margin: 1cm;
          }
        }
      `}</style>

      {/* Screen Mode Menu Controls */}
      <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#1e293b', padding: '1.5rem', borderRadius: '16px', border: '1px solid #334155', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ margin: 0, color: '#38bdf8', fontSize: '1.5rem', fontWeight: 800 }}>📂 {t.title}</h2>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button
              onClick={() => setLanguage(lang => lang === 'PT' ? 'EN' : 'PT')}
              style={{ padding: '0.6rem 1.2rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', border: 'none', borderRadius: '24px', fontWeight: 800, cursor: 'pointer' }}
            >
              🌐 {language === 'PT' ? 'Switch to English' : 'Mudar para Português'}
            </button>
            <button
              onClick={handleDownloadDocx}
              disabled={downloadingDocx || rows.length === 0}
              style={{
                padding: '0.6rem 1.4rem',
                background: downloadingDocx ? '#475569' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                color: '#fff',
                border: 'none',
                borderRadius: '24px',
                fontWeight: 800,
                cursor: downloadingDocx ? 'wait' : 'pointer',
                opacity: rows.length === 0 ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              {downloadingDocx ? '⏳ ...' : (t as any).docxBtn}
            </button>
            <button
              onClick={handleDownloadExcel}
              disabled={downloadingExcel || rows.length === 0}
              style={{
                padding: '0.6rem 1.4rem',
                background: downloadingExcel ? '#475569' : 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                border: 'none',
                borderRadius: '24px',
                fontWeight: 800,
                cursor: downloadingExcel ? 'wait' : 'pointer',
                opacity: rows.length === 0 ? 0.5 : 1,
                transition: 'all 0.2s'
              }}
            >
              {downloadingExcel ? '⏳ ...' : (t as any).excelBtn}
            </button>
            <button
              onClick={handlePrint}
              style={{ padding: '0.6rem 1.4rem', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '24px', fontWeight: 800, cursor: 'pointer' }}
            >
              {t.printBtn}
            </button>
          </div>
        </div>

        {/* Date Filter & Location Inputs */}
        <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', alignItems: 'flex-end', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{t.startDate}</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '0.5rem 0.8rem', borderRadius: '8px', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{t.endDate}</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '0.5rem 0.8rem', borderRadius: '8px', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: '1 1 250px' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>📍 {t.location} (LOCALIZAÇÃO)</span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input
                type="text"
                value={lodgeLocation}
                onChange={(e) => setLodgeLocation(e.target.value)}
                placeholder={t.locationPlaceholder}
                style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '0.5rem 0.8rem', borderRadius: '8px', outline: 'none' }}
              />
              <button
                onClick={handleSaveLocation}
                disabled={locationSaving}
                style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                {locationSaving ? '...' : t.saveLocBtn}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable page layout container */}
      <div className="print-container" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '2rem', color: '#fff' }}>
        
        {/* Official Header Area (Hidden on screen via styles, visible only on print output) */}
        <div className="print-header" style={{ display: 'none', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
          <div style={{ fontWeight: 'bold', fontSize: 13, textTransform: 'uppercase' }}>{t.rep}</div>
          <div style={{ fontSize: 11 }}>.........*.........</div>
          <div style={{ fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' }}>{t.interior}</div>
          <div style={{ fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase' }}>{t.migration}</div>
          <div style={{ fontSize: 11, textTransform: 'uppercase' }}>{t.inham}</div>
          <div style={{ fontSize: 11, textTransform: 'uppercase' }}>{t.operations}</div>
          <div style={{ fontSize: 11, textTransform: 'uppercase' }}>{t.movement}</div>
          <div style={{ fontSize: 11, textTransform: 'uppercase' }}>{t.post}</div>
          
          <div style={{ fontWeight: 'bold', fontSize: 12, textTransform: 'uppercase', marginTop: 15, marginBottom: 15, borderBottom: '1px solid #000', paddingBottom: 5 }}>
            {t.law}
          </div>

          <table style={{ width: '100%', fontSize: 11, marginBottom: 15, textAlign: 'left', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '3px 0', border: 'none' }}>
                  <strong>{t.location} / LOCATION:</strong> <span style={{ textDecoration: 'underline' }}>{lodgeLocation || 'CHIBUENE'}</span>
                </td>
                <td style={{ padding: '3px 0', border: 'none' }}>
                  <strong>{t.establishment} / LODGE NAME:</strong> <span style={{ textDecoration: 'underline' }}>{activeLodgeName}</span>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '3px 0', border: 'none' }}>
                  <strong>{t.month} / MONTH:</strong> <span style={{ textDecoration: 'underline' }}>{getMonthName()}</span>
                </td>
                <td style={{ padding: '3px 0', border: 'none' }}>
                  <strong>{t.date} / DATE:</strong> <span style={{ textDecoration: 'underline' }}>{getFormattedToday()}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Screen Version of Top Metadata Info */}
        <div className="no-print" style={{ marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
          <div style={{ fontSize: '0.9rem', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div>🏢 <strong>Establishment:</strong> {activeLodgeName}</div>
            <div>📍 <strong>Location:</strong> {lodgeLocation || '(Not set - enter above)'}</div>
            <div>📅 <strong>Month:</strong> {getMonthName()} | <strong>Date:</strong> {getFormattedToday()}</div>
          </div>
        </div>

        {/* Table Preview / Print Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>{t.loading}</div>
        ) : rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>{t.noData}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="print-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#0f172a', borderBottom: '2px solid #334155' }}>
                  <th style={{ padding: '10px 6px', textAlign: 'center', border: '1px solid #334155' }}>{t.colNo}</th>
                  <th style={{ padding: '10px 6px', textAlign: 'left', border: '1px solid #334155' }}>{t.colName}</th>
                  <th style={{ padding: '10px 6px', textAlign: 'left', border: '1px solid #334155' }}>{t.colNat}</th>
                  <th style={{ padding: '10px 6px', textAlign: 'left', border: '1px solid #334155' }}>{t.colPass}</th>
                  <th style={{ padding: '10px 6px', textAlign: 'left', border: '1px solid #334155' }}>{t.colIssue}</th>
                  <th style={{ padding: '10px 6px', textAlign: 'left', border: '1px solid #334155' }}>{t.colArrived}</th>
                  <th style={{ padding: '10px 6px', textAlign: 'left', border: '1px solid #334155' }}>{t.colVisa}</th>
                  <th style={{ padding: '10px 6px', textAlign: 'left', border: '1px solid #334155' }}>{t.colVal}</th>
                  <th style={{ padding: '10px 6px', textAlign: 'center', border: '1px solid #334155' }}>{t.colEntry}</th>
                  <th style={{ padding: '10px 6px', textAlign: 'center', border: '1px solid #334155' }}>{t.colExit}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.guest_id} style={{ borderBottom: '1px solid #334155', background: idx % 2 === 0 ? '#1e293b' : '#172554' }}>
                    <td style={{ padding: '8px 6px', textAlign: 'center', border: '1px solid #334155' }}>{idx + 1}</td>
                    
                    {/* Full Name */}
                    <td style={{ padding: '8px 6px', border: '1px solid #334155' }}>
                      {editingCell?.rowId === row.guest_id && editingCell?.field === 'full_name' ? (
                        <input
                          type="text"
                          defaultValue={row.full_name}
                          autoFocus
                          onBlur={(e) => {
                            handleUpdateRowField(row, 'full_name', e.target.value)
                            setEditingCell(null)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateRowField(row, 'full_name', e.currentTarget.value)
                              setEditingCell(null)
                            }
                          }}
                          style={{ width: '100%', background: '#0f172a', color: '#fff', border: 'none', padding: '2px', outline: 'none' }}
                        />
                      ) : (
                        <div onClick={() => setEditingCell({ rowId: row.guest_id, field: 'full_name' })} style={{ cursor: 'pointer', minHeight: '18px' }}>
                          {row.full_name}
                        </div>
                      )}
                    </td>

                    {/* Nationality */}
                    <td style={{ padding: '8px 6px', border: '1px solid #334155' }}>
                      {editingCell?.rowId === row.guest_id && editingCell?.field === 'nationality' ? (
                        <input
                          type="text"
                          defaultValue={row.nationality || ''}
                          autoFocus
                          onBlur={(e) => {
                            handleUpdateRowField(row, 'nationality', e.target.value)
                            setEditingCell(null)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateRowField(row, 'nationality', e.currentTarget.value)
                              setEditingCell(null)
                            }
                          }}
                          style={{ width: '100%', background: '#0f172a', color: '#fff', border: 'none', padding: '2px', outline: 'none' }}
                        />
                      ) : (
                        <div onClick={() => setEditingCell({ rowId: row.guest_id, field: 'nationality' })} style={{ cursor: 'pointer', minHeight: '18px' }}>
                          {row.nationality || <span style={{ color: '#64748b', fontSize: '0.8rem' }}>click to edit</span>}
                        </div>
                      )}
                    </td>

                    {/* Passport Number */}
                    <td style={{ padding: '8px 6px', border: '1px solid #334155' }}>
                      {editingCell?.rowId === row.guest_id && editingCell?.field === 'passport_number' ? (
                        <input
                          type="text"
                          defaultValue={row.passport_number || ''}
                          autoFocus
                          onBlur={(e) => {
                            handleUpdateRowField(row, 'passport_number', e.target.value)
                            setEditingCell(null)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateRowField(row, 'passport_number', e.currentTarget.value)
                              setEditingCell(null)
                            }
                          }}
                          style={{ width: '100%', background: '#0f172a', color: '#fff', border: 'none', padding: '2px', outline: 'none' }}
                        />
                      ) : (
                        <div onClick={() => setEditingCell({ rowId: row.guest_id, field: 'passport_number' })} style={{ cursor: 'pointer', minHeight: '18px' }}>
                          {row.passport_number || <span style={{ color: '#64748b', fontSize: '0.8rem' }}>edit</span>}
                        </div>
                      )}
                    </td>

                    {/* Date of Issue */}
                    <td style={{ padding: '8px 6px', border: '1px solid #334155' }}>
                      {editingCell?.rowId === row.guest_id && editingCell?.field === 'date_of_issue' ? (
                        <input
                          type="date"
                          defaultValue={row.date_of_issue || ''}
                          autoFocus
                          onBlur={(e) => {
                            handleUpdateRowField(row, 'date_of_issue', e.target.value)
                            setEditingCell(null)
                          }}
                          onChange={(e) => {
                            handleUpdateRowField(row, 'date_of_issue', e.target.value)
                            setEditingCell(null)
                          }}
                          style={{ width: '100%', background: '#0f172a', color: '#fff', border: 'none', padding: '2px', outline: 'none' }}
                        />
                      ) : (
                        <div onClick={() => setEditingCell({ rowId: row.guest_id, field: 'date_of_issue' })} style={{ cursor: 'pointer', minHeight: '18px' }}>
                          {row.date_of_issue || <span style={{ color: '#64748b', fontSize: '0.8rem' }}>set date</span>}
                        </div>
                      )}
                    </td>

                    {/* Arrived From (Proveniencia) */}
                    <td style={{ padding: '8px 6px', border: '1px solid #334155' }}>
                      {editingCell?.rowId === row.guest_id && editingCell?.field === 'arrived_from' ? (
                        <input
                          type="text"
                          defaultValue={row.arrived_from || ''}
                          autoFocus
                          onBlur={(e) => {
                            handleUpdateRowField(row, 'arrived_from', e.target.value)
                            setEditingCell(null)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateRowField(row, 'arrived_from', e.currentTarget.value)
                              setEditingCell(null)
                            }
                          }}
                          style={{ width: '100%', background: '#0f172a', color: '#fff', border: 'none', padding: '2px', outline: 'none' }}
                        />
                      ) : (
                        <div onClick={() => setEditingCell({ rowId: row.guest_id, field: 'arrived_from' })} style={{ cursor: 'pointer', minHeight: '18px' }}>
                          {row.arrived_from || <span style={{ color: '#64748b', fontSize: '0.8rem' }}>enter origin</span>}
                        </div>
                      )}
                    </td>

                    {/* Visa Number */}
                    <td style={{ padding: '8px 6px', border: '1px solid #334155' }}>
                      {editingCell?.rowId === row.guest_id && editingCell?.field === 'visa_number' ? (
                        <input
                          type="text"
                          defaultValue={row.visa_number || ''}
                          autoFocus
                          onBlur={(e) => {
                            handleUpdateRowField(row, 'visa_number', e.target.value)
                            setEditingCell(null)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateRowField(row, 'visa_number', e.currentTarget.value)
                              setEditingCell(null)
                            }
                          }}
                          style={{ width: '100%', background: '#0f172a', color: '#fff', border: 'none', padding: '2px', outline: 'none' }}
                        />
                      ) : (
                        <div onClick={() => setEditingCell({ rowId: row.guest_id, field: 'visa_number' })} style={{ cursor: 'pointer', minHeight: '18px' }}>
                          {row.visa_number || <span style={{ color: '#64748b', fontSize: '0.8rem' }}>enter visa</span>}
                        </div>
                      )}
                    </td>

                    {/* Visa Validity (Validade) */}
                    <td style={{ padding: '8px 6px', border: '1px solid #334155' }}>
                      {editingCell?.rowId === row.guest_id && editingCell?.field === 'visa_validity' ? (
                        <input
                          type="date"
                          defaultValue={row.visa_validity || ''}
                          autoFocus
                          onBlur={(e) => {
                            handleUpdateRowField(row, 'visa_validity', e.target.value)
                            setEditingCell(null)
                          }}
                          onChange={(e) => {
                            handleUpdateRowField(row, 'visa_validity', e.target.value)
                            setEditingCell(null)
                          }}
                          style={{ width: '100%', background: '#0f172a', color: '#fff', border: 'none', padding: '2px', outline: 'none' }}
                        />
                      ) : (
                        <div onClick={() => setEditingCell({ rowId: row.guest_id, field: 'visa_validity' })} style={{ cursor: 'pointer', minHeight: '18px' }}>
                          {row.visa_validity || <span style={{ color: '#64748b', fontSize: '0.8rem' }}>set expiry</span>}
                        </div>
                      )}
                    </td>

                    {/* Check In / Entry */}
                    <td style={{ padding: '8px 6px', textAlign: 'center', border: '1px solid #334155' }}>{row.check_in}</td>

                    {/* Check Out / Exit */}
                    <td style={{ padding: '8px 6px', textAlign: 'center', border: '1px solid #334155' }}>{row.check_out}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
