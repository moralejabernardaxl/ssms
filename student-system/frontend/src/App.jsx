import { useState } from 'react'
import { api } from './api'
import DatabaseManager from './DatabaseManager'

const EMPTY_FORM = { idnum: '', year_level: '1st Year', name: '', age: '', program: '' }
const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year']

function Landing({ onEnter }) {
  return (
    <div className="landing">
      <div className="landing-glow" aria-hidden="true" />
      <div className="landing-content">
        <div className="landing-index"><span>SSR / 01</span><span>Registrarâ€™s archive</span></div>
        <p className="landing-kicker">Every name leaves a mark.</p>
        <h1>Student<br /><em>Records</em></h1>
        <p>
          A considered archive of student identities, programs, and years of study.
          Search the record. Add to the collection.
        </p>
        <div className="landing-action">
          <button className="btn btn-primary btn-large" onClick={onEnter}>Enter the archive <span aria-hidden="true">â†—</span></button>
          <span className="landing-note">LOCAL DATABASE&nbsp; Â· &nbsp;SQL SERVER</span>
        </div>
      </div>
    </div>
  )
}

function StudentsSection() {
  const [dbMessage, setDbMessage] = useState(null)
  const [dbBusy, setDbBusy] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formBusy, setFormBusy] = useState(false)
  const [formMessage, setFormMessage] = useState(null)
  const [tableVisible, setTableVisible] = useState(false)
  const [tableBusy, setTableBusy] = useState(false)
  const [tableError, setTableError] = useState(null)
  const [students, setStudents] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)

  async function handleCreateDatabase() {
    setDbBusy(true); setDbMessage(null)
    try { const data = await api('/api/create-database', { method: 'POST' }); setDbMessage({ tone: 'good', text: data.message }) }
    catch (err) { setDbMessage({ tone: 'bad', text: `Could not initialize database: ${err.message}` }) }
    finally { setDbBusy(false) }
  }
  function updateField(field, value) { setForm((current) => ({ ...current, [field]: value })) }
  async function refreshTable() {
    setTableBusy(true); setTableError(null)
    try { setStudents(await api('/api/students')) }
    catch (err) { setTableError(`Could not load records: ${err.message}`) }
    finally { setTableBusy(false) }
  }
  async function toggleRecords() {
    if (tableVisible) { setTableVisible(false); return }
    setTableVisible(true); await refreshTable()
  }
  async function handleAddStudent(e) {
    e.preventDefault(); setFormBusy(true); setFormMessage(null)
    try {
      await api('/api/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, age: Number(form.age) }) })
      setFormMessage({ tone: 'good', text: `${form.name} was added to the registry.` })
      setForm(EMPTY_FORM)
      if (tableVisible) refreshTable()
    } catch (err) { setFormMessage({ tone: 'bad', text: err.message }) }
    finally { setFormBusy(false) }
  }

  return <>
    <section className="workspace-intro">
      <div><span className="eyebrow">STUDENT REGISTRY / 2024—25</span><h1>Records desk</h1><p>Maintain the register and browse the current student archive.</p></div>
      <div className="intro-actions">
        <button className="btn btn-accent" onClick={handleCreateDatabase} disabled={dbBusy}>{dbBusy ? 'Initializing…' : 'Initialize database'}</button>
        <button className="btn btn-primary" onClick={() => setShowAddForm((value) => !value)}>{showAddForm ? 'Close entry' : '+ New student'}</button>
      </div>
      {dbMessage && <p className={`inline-message ${dbMessage.tone}`}>{dbMessage.text}</p>}
    </section>

    <section className="metric-strip" aria-label="Registry overview">
      <div className="metric-cell"><span className="metric-label">COLLECTION</span><strong>Student records</strong><span className="metric-foot">Primary register</span></div>
      <div className="metric-cell"><span className="metric-label">VISIBLE ENTRIES</span><strong>{tableVisible && !tableError ? students.length.toString().padStart(2, '0') : '— —'}</strong><span className="metric-foot">{tableVisible ? 'Latest archive count' : 'Load records to view'}</span></div>
      <div className="metric-cell"><span className="metric-label">CONNECTION</span><strong className="connection-status"><i /> SQL Server</strong><span className="metric-foot">Local instance</span></div>
    </section>

    <div className="records-workspace">
      {showAddForm && <section className="panel entry-panel">
        <div className="section-heading"><span className="section-number">01</span><div><span className="eyebrow">NEW ARCHIVE ENTRY</span><h2>Add a student</h2></div><button className="icon-close" aria-label="Close form" onClick={() => setShowAddForm(false)}>×</button></div>
        <form onSubmit={handleAddStudent} className="student-form">
          <label>ID number<input required value={form.idnum} onChange={(e) => updateField('idnum', e.target.value)} placeholder="2024-00931" /></label>
          <label>Year level<select value={form.year_level} onChange={(e) => updateField('year_level', e.target.value)}>{YEAR_LEVELS.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
          <label>Full name<input required value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Dela Cruz, Juan" /></label>
          <label>Age<input required type="number" min="10" max="100" value={form.age} onChange={(e) => updateField('age', e.target.value)} /></label>
          <label>Program<input required value={form.program} onChange={(e) => updateField('program', e.target.value)} placeholder="BS Computer Science" /></label>
          <button className="btn btn-primary" type="submit" disabled={formBusy}>{formBusy ? 'Adding…' : 'Add to registry'}</button>
          {formMessage && <p className={`inline-message ${formMessage.tone}`}>{formMessage.text}</p>}
        </form>
      </section>}

      <section className="panel records-panel">
        <div className="table-header">
          <div className="section-heading"><span className="section-number">{showAddForm ? '02' : '01'}</span><div><span className="eyebrow">THE COLLECTION</span><h2>Student records</h2></div></div>
          <div className="record-controls"><span className="record-total">{tableVisible && !tableBusy && !tableError ? `${students.length} entries` : 'Archive view'}</span><button className="btn btn-ghost" onClick={toggleRecords}>{tableVisible ? 'Hide records' : 'Load records'}</button></div>
        </div>
        {!tableVisible && <div className="empty-state"><span className="empty-mark">SR</span><div><strong>Archive ready</strong><p>Load the register to browse student records.</p></div><button className="btn btn-primary" onClick={toggleRecords}>Open register <span aria-hidden="true">?</span></button></div>}
        {tableVisible && tableBusy && <p className="muted">Loading records…</p>}
        {tableVisible && !tableBusy && tableError && <p className="inline-message bad">{tableError}</p>}
        {tableVisible && !tableBusy && !tableError && students.length === 0 && <div className="empty-state"><span className="empty-mark">Ø</span><div><strong>No records yet</strong><p>Add a student to begin this collection.</p></div></div>}
        {tableVisible && !tableBusy && !tableError && students.length > 0 && <div className="table-scroll"><table><thead><tr><th>ID number</th><th>Year</th><th>Name</th><th>Age</th><th>Program</th></tr></thead><tbody>{students.map((student) => <tr key={student.idnum}><td>{student.idnum}</td><td>{student.year_level}</td><td>{student.name}</td><td>{student.age}</td><td>{student.program}</td></tr>)}</tbody></table></div>}
      </section>
    </div>
  </>
}
function Dashboard() {
  const [view, setView] = useState('students')
  return <div className="app-shell">
    <aside className="side-rail">
      <div className="rail-brand"><span className="brand-symbol">S</span><span>SSR<span className="brand-period">.</span></span></div>
      <span className="rail-label">WORKSPACE</span>
      <nav className="rail-nav" aria-label="Workspace navigation">
        <button className={`rail-link${view === 'students' ? ' active' : ''}`} onClick={() => setView('students')}><span className="rail-icon">?</span><span>Registry</span><small>01</small></button>
        <button className={`rail-link${view === 'databases' ? ' active' : ''}`} onClick={() => setView('databases')}><span className="rail-icon">?</span><span>Data vault</span><small>02</small></button>
      </nav>
      <div className="rail-spacer" />
      <div className="rail-status"><i /><div><strong>System online</strong><span>LOCAL / SQL SERVER</span></div></div>
      <div className="rail-version">STUDENT RECORDS SYSTEM <span>V1.0</span></div>
    </aside>
    <main className="dashboard">
      <header className="dashboard-header"><div className="header-identity"><span className="wordmark">Student Records</span><span className="header-caption">REGISTRAR’S ARCHIVE <i>•</i> LOCAL SYSTEM</span></div><span className="header-date">ARCHIVE ACCESS <i>•</i> SECURE LOCAL</span></header>
      {view === 'students' ? <StudentsSection /> : <><section className="workspace-intro"><div><span className="eyebrow">SYSTEM CONFIGURATION / 02</span><h1>Data vault</h1><p>Create and manage databases, tables, and records.</p></div></section><DatabaseManager /></>}
    </main>
  </div>
}
export default function App() {
  const [entered, setEntered] = useState(false)
  return entered ? <Dashboard /> : <Landing onEnter={() => setEntered(true)} />
}
