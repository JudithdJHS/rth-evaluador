'use client'
import { useState, useRef, useEffect } from 'react'
import { PREGUNTAS_CONTEXTO } from '@/lib/rth-profile'
import styles from './page.module.css'

type Answer = { q: string; a: string }
type CompIG = { url: string; caption: string; result: string }
type Dimension = { name: string; score: number; level: string; note: string }
type Recommendation = { text: string; priority: string }
type FunnelAlignment = { declared: string; actual: string; aligned: boolean; explanation: string; impact: string }
type Report = {
  score: number
  verdict: string
  verdict_sub: string
  funnel_alignment: FunnelAlignment
  dimensions: Dimension[]
  recommendations: Recommendation[]
  improved_piece: string
  competitor_ideas: string
}

const STAGES = ['Tope de funnel', 'Medio funnel', 'Fondo de funnel', 'Post-compra']

export default function Home() {
  const [step, setStep] = useState(1)
  const [pieceText, setPieceText] = useState('')
  const [fileName, setFileName] = useState('')
  const [channel, setChannel] = useState('')
  const [answers, setAnswers] = useState<Answer[]>([])
  const [qIdx, setQIdx] = useState(0)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([])
  const [ytRefs, setYtRefs] = useState<string[]>([])
  const [igRefs, setIgRefs] = useState<CompIG[]>([])
  const [ytUrl, setYtUrl] = useState('')
  const [igUrl, setIgUrl] = useState('')
  const [igCap, setIgCap] = useState('')
  const [igRes, setIgRes] = useState('')
  const [compTab, setCompTab] = useState<'yt' | 'ig'>('yt')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

  const goToStep = (n: number) => { setStep(n); window.scrollTo(0, 0) }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFileName(f.name)
  }

  const step1Next = () => {
    if (!pieceText && !fileName) { alert('Agrega el contenido de la pieza antes de continuar.'); return }
    if (!channel) { alert('Selecciona el canal de publicación.'); return }
    goToStep(2)
    if (answers.length === 0) initChat()
  }

  const initChat = () => {
    setMessages([{
      role: 'assistant',
      text: `Pieza recibida para ${channel}. Voy a hacerte ${PREGUNTAS_CONTEXTO.length} preguntas para afinar el análisis. Empecemos.`
    }])
    setQIdx(0)
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', text: PREGUNTAS_CONTEXTO[0].pregunta }])
    }, 600)
  }

  const sendMsg = (val?: string) => {
    const v = val || chatInput.trim()
    if (!v) return
    const newAnswers = [...answers, { q: PREGUNTAS_CONTEXTO[qIdx]?.pregunta || '', a: v }]
    setAnswers(newAnswers)
    setMessages(prev => [...prev, { role: 'user', text: v }])
    setChatInput('')
    const nextIdx = qIdx + 1
    setQIdx(nextIdx)
    if (nextIdx < PREGUNTAS_CONTEXTO.length) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', text: PREGUNTAS_CONTEXTO[nextIdx].pregunta }])
      }, 400)
    } else {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', text: 'Contexto completo. Puedes agregar referencias de competencia o ir directo al reporte.' }])
      }, 400)
    }
  }

  const addYT = () => {
    if (!ytUrl) return
    setYtRefs(prev => [...prev, ytUrl])
    setYtUrl('')
  }

  const addIG = () => {
    if (!igUrl && !igCap) return
    setIgRefs(prev => [...prev, { url: igUrl, caption: igCap, result: igRes }])
    setIgUrl(''); setIgCap(''); setIgRes('')
  }

  const generateReport = async () => {
    goToStep(4)
    setLoading(true)
    setReport(null)
    setError('')
    try {
      const res = await fetch('/api/evaluar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pieceText, channel, answers, competitorYT: ytRefs, competitorIG: igRefs, hasFile: !!fileName })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al generar el reporte')
      setReport(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const newEval = () => {
    setPieceText(''); setFileName(''); setChannel(''); setAnswers([])
    setQIdx(0); setMessages([]); setYtRefs([]); setIgRefs([])
    setReport(null); setError('')
    if (fileRef.current) fileRef.current.value = ''
    goToStep(1)
  }

  const priorityLabel: Record<string, string> = { critical: 'Crítico', moderate: 'Moderado', low: 'Secundario' }
  const verdictClass = report ? (report.score >= 7 ? styles.ok : report.score >= 5 ? styles.warn : styles.bad) : ''

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.logoRow}>
          <div className={styles.logoMark}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L16 14H2L9 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className={styles.title}>Evaluador de contenido</h1>
            <p className={styles.subtitle}>Regálame tu Historia · Análisis estratégico</p>
          </div>
        </div>
        <div className={styles.steps}>
          {['Pieza', 'Contexto', 'Competencia', 'Reporte'].map((s, i) => (
            <div key={s} className={styles.stepWrap}>
              <div className={`${styles.step} ${step === i + 1 ? styles.stepActive : step > i + 1 ? styles.stepDone : ''}`}>
                <span className={styles.stepNum}>{step > i + 1 ? '✓' : i + 1}</span>
                <span className={styles.stepLabel}>{s}</span>
              </div>
              {i < 3 && <div className={styles.stepLine} />}
            </div>
          ))}
        </div>
      </header>

      <main className={styles.main}>

        {step === 1 && (
          <div className={styles.screen}>
            <div className={styles.card}>
              <p className={styles.cardLabel}>Contenido de la pieza</p>
              <div className={styles.uploadZone} onClick={() => fileRef.current?.click()}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                {fileName ? <p className={styles.fileName}>{fileName}</p> : <>
                  <p>Sube imagen, PDF o video</p>
                  <small>JPG · PNG · PDF · MP4</small>
                </>}
              </div>
              <input ref={fileRef} type="file" accept="image/*,.pdf,video/*" onChange={handleFile} style={{ display: 'none' }} />
              <div className={styles.orDiv}><span>o pega el texto</span></div>
              <label className={styles.fieldLabel}>Copy · guion · caption · texto de la pieza</label>
              <textarea
                className={styles.textarea}
                value={pieceText}
                onChange={e => setPieceText(e.target.value)}
                placeholder="Pega aquí el copy, guion del Reel, caption del carrusel, texto de la Story..."
                rows={5}
              />
            </div>
            <div className={styles.card}>
              <p className={styles.cardLabel}>Canal de publicación</p>
              <label className={styles.fieldLabel}>¿Dónde se va a publicar?</label>
              <select className={styles.select} value={channel} onChange={e => setChannel(e.target.value)}>
                <option value="">Selecciona canal</option>
                <option>Instagram — Reel</option>
                <option>Instagram — Post / Carrusel</option>
                <option>Instagram — Story</option>
                <option>YouTube</option>
                <option>Email</option>
                <option>WhatsApp</option>
              </select>
            </div>
            <button className={styles.btnPrimary} onClick={step1Next}>Continuar — Definir contexto →</button>
          </div>
        )}

        {step === 2 && (
          <div className={styles.screen}>
            <div className={styles.card}>
              <p className={styles.cardLabel}>Entrevista de contexto</p>
              <div className={styles.chatArea} ref={chatRef}>
                {messages.map((m, i) => (
                  <div key={i} className={`${styles.msg} ${m.role === 'user' ? styles.msgUser : styles.msgAI}`}>
                    <div className={styles.av}>{m.role === 'assistant' ? 'AI' : 'Y'}</div>
                    <div className={styles.bubble}>{m.text}</div>
                  </div>
                ))}
              </div>
              {qIdx < PREGUNTAS_CONTEXTO.length && (
                <div className={styles.quickOpts}>
                  {PREGUNTAS_CONTEXTO[qIdx]?.opciones.map(o => (
                    <button key={o} className={styles.qOpt} onClick={() => sendMsg(o)}>{o}</button>
                  ))}
                </div>
              )}
              <div className={styles.chatRow}>
                <textarea
                  className={styles.chatInput}
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg() } }}
                  placeholder="O escribe tu respuesta..."
                  rows={1}
                />
                <button className={styles.sendBtn} onClick={() => sendMsg()}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 19V5M5 12l7-7 7 7"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className={styles.twoBtn}>
              <button className={styles.btnSec} onClick={() => goToStep(1)}>← Volver</button>
              <button className={styles.btnPrimary} style={{ flex: 1 }} onClick={() => goToStep(3)}>Continuar — Competencia →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.screen}>
            <div className={styles.card}>
              <p className={styles.cardLabel}>Referencias de competencia <span className={styles.optional}>(opcional)</span></p>
              <p className={styles.helpText}>Agrega piezas que hayan funcionado bien. La app extrae ideas aplicables a RTH.</p>
              <div className={styles.tabRow}>
                <button className={`${styles.tab} ${compTab === 'yt' ? styles.tabActive : ''}`} onClick={() => setCompTab('yt')}>YouTube</button>
                <button className={`${styles.tab} ${compTab === 'ig' ? styles.tabActive : ''}`} onClick={() => setCompTab('ig')}>Instagram</button>
              </div>
              {compTab === 'yt' && (
                <div>
                  <label className={styles.fieldLabel}>URL del video</label>
                  <div className={styles.compRow}>
                    <input className={styles.input} type="url" value={ytUrl} onChange={e => setYtUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
                    <button className={styles.btnSec} onClick={addYT}>Agregar</button>
                  </div>
                  {ytRefs.map((u, i) => (
                    <div key={i} className={styles.compItem}>
                      <span>▶ {u}</span>
                      <button onClick={() => setYtRefs(prev => prev.filter((_, j) => j !== i))}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              {compTab === 'ig' && (
                <div>
                  <label className={styles.fieldLabel}>URL del post</label>
                  <input className={styles.input} style={{ marginBottom: '0.75rem' }} type="url" value={igUrl} onChange={e => setIgUrl(e.target.value)} placeholder="https://instagram.com/p/..." />
                  <label className={styles.fieldLabel}>Caption del post</label>
                  <textarea className={styles.textarea} style={{ minHeight: '70px', marginBottom: '0.75rem' }} value={igCap} onChange={e => setIgCap(e.target.value)} placeholder="Pega el caption aquí..." />
                  <label className={styles.fieldLabel}>Resultado observado (opcional)</label>
                  <input className={styles.input} style={{ marginBottom: '0.75rem' }} type="text" value={igRes} onChange={e => setIgRes(e.target.value)} placeholder="Ej: 45K alcance, 800 comentarios, CTA TALLER" />
                  <button className={styles.btnSec} onClick={addIG}>Agregar referencia</button>
                  {igRefs.map((r, i) => (
                    <div key={i} className={styles.compItem}>
                      <span>◆ {r.url || r.caption?.substring(0, 50) + '...'}</span>
                      <button onClick={() => setIgRefs(prev => prev.filter((_, j) => j !== i))}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={styles.twoBtn}>
              <button className={styles.btnSec} onClick={() => goToStep(2)}>← Volver</button>
              <button className={styles.btnPrimary} style={{ flex: 1 }} onClick={generateReport}>Generar reporte completo →</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className={styles.screen}>
            {loading && (
              <div className={styles.loadingCard}>
                <div className={styles.loadingIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 3v5h5M21 21v-5h-5M3.05 13A9 9 0 1021 12"/>
                  </svg>
                </div>
                <p className={styles.loadingTitle}>Analizando la pieza...</p>
                <p className={styles.loadingSub}>Cruzando con perfil RTH, mecánicas de plataforma y coherencia de funnel</p>
                <div className={styles.dots}><span /><span /><span /></div>
              </div>
            )}

            {error && (
              <div className={styles.card}>
                <div className={styles.errorBox}>{error}</div>
                <button className={styles.btnSec} style={{ marginTop: '1rem', width: '100%' }} onClick={generateReport}>Reintentar</button>
              </div>
            )}

            {report && !loading && (
              <>
                <div className={styles.card}>
                  <p className={styles.cardLabel}>Viabilidad general</p>
                  <div className={styles.scoreBox}>
                    <div className={styles.scoreNum}>{report.score}</div>
                    <div className={styles.scoreMeta}>
                      <div className={`${styles.verdict} ${verdictClass}`}>{report.verdict}</div>
                      <div className={styles.verdictSub}>{report.verdict_sub}</div>
                    </div>
                  </div>

                  {report.funnel_alignment && (
                    <>
                      <p className={styles.cardLabel} style={{ marginBottom: '0.75rem' }}>Coherencia de funnel</p>
                      <div className={`${styles.funnelBanner} ${report.funnel_alignment.aligned ? styles.funnelOk : styles.funnelBad}`}>
                        <div className={styles.funnelTitle}>
                          {report.funnel_alignment.aligned ? '✓ Coherencia de funnel correcta' : '⚠ Desalineación de funnel detectada'}
                        </div>
                        <div className={styles.funnelBody}>{report.funnel_alignment.explanation}</div>
                        {!report.funnel_alignment.aligned && report.funnel_alignment.impact && (
                          <div className={styles.funnelImpact}>{report.funnel_alignment.impact}</div>
                        )}
                      </div>
                      <div className={styles.journeyMap}>
                        {STAGES.map((s, i) => {
                          const isDeclared = report.funnel_alignment.declared?.toLowerCase().includes(s.toLowerCase().split(' ')[0])
                          const isActual = report.funnel_alignment.actual?.toLowerCase().includes(s.toLowerCase().split(' ')[0])
                          const isMatch = isDeclared && isActual
                          return (
                            <div key={s} className={styles.journeyWrap}>
                              <div className={`${styles.jStage} ${isMatch ? styles.jMatch : isDeclared ? styles.jDeclared : isActual && !report.funnel_alignment.aligned ? styles.jActual : ''}`}>
                                <span className={styles.jNum}>{i + 1}</span>
                              </div>
                              <div className={`${styles.jLabel} ${isMatch ? styles.jLabelMatch : isDeclared ? styles.jLabelDeclared : isActual && !report.funnel_alignment.aligned ? styles.jLabelActual : ''}`}>
                                {s}
                                {isMatch && <span className={styles.jSub}>declarado y real</span>}
                                {isDeclared && !isMatch && <span className={styles.jSub}>declarado</span>}
                                {isActual && !isMatch && !report.funnel_alignment.aligned && <span className={`${styles.jSub} ${styles.jSubActual}`}>real</span>}
                              </div>
                              {i < STAGES.length - 1 && <div className={styles.jArrow} />}
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}

                  <p className={styles.cardLabel} style={{ marginBottom: '0.75rem' }}>Diagnóstico por dimensión</p>
                  <div className={styles.dimGrid}>
                    {report.dimensions?.map(d => (
                      <div key={d.name} className={`${styles.dimCard} ${d.level === 'high' ? styles.dimHigh : d.level === 'low' ? styles.dimLow : styles.dimMed}`}>
                        <div className={styles.dimName}>{d.name}</div>
                        <div className={styles.dimScore}>{d.score}<span className={styles.dimOf}>/10</span></div>
                        <div className={styles.dimNote}>{d.note}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.card}>
                  <p className={styles.cardLabel}>Recomendaciones accionables</p>
                  <div className={styles.recList}>
                    {report.recommendations?.map((r, i) => (
                      <div key={i} className={styles.recItem}>
                        <span className={styles.recArrow}>→</span>
                        <span className={styles.recText}>{r.text}</span>
                        <span className={`${styles.priority} ${r.priority === 'critical' ? styles.pCritical : r.priority === 'moderate' ? styles.pModerate : styles.pLow}`}>
                          {priorityLabel[r.priority] || r.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {report.improved_piece && report.improved_piece !== 'NA' && (
                  <div className={styles.card}>
                    <p className={styles.cardLabel}>Pieza mejorada</p>
                    <div className={styles.improvedPiece}>{report.improved_piece}</div>
                  </div>
                )}

                {report.competitor_ideas && report.competitor_ideas !== 'NA' && (
                  <div className={styles.card}>
                    <p className={styles.cardLabel}>Ideas desde la competencia</p>
                    <p className={styles.compIdeas}>{report.competitor_ideas}</p>
                  </div>
                )}

                <div className={styles.actionRow}>
                  <button className={styles.btnSec} onClick={newEval}>+ Nueva evaluación</button>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
