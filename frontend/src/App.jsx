import React, { useState, useEffect, useRef } from 'react'
import {
  Sparkles, ArrowUp, ImagePlus, Download, Loader2,
  Pencil, X, RefreshCw, Wand2,
} from 'lucide-react'
import {
  stylePresets, generateExamples,
  editQuickActions, editExamples,
} from './constants/presets'

// 우선순위: VITE_API_URL(있으면) > 개발이면 localhost > 배포면 기존 Railway 백엔드
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:8000'
    : 'https://pearl-image-production.up.railway.app')

function App() {
  const [mode, setMode] = useState('create') // 'create' | 'edit'
  const [prompt, setPrompt] = useState('')
  const [styleId, setStyleId] = useState('cartoon')
  const [transparentBg, setTransparentBg] = useState(false)
  const [editSource, setEditSource] = useState(null) // data URL of image to edit
  const [isBusy, setIsBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [phIndex, setPhIndex] = useState(0)
  const [dragOver, setDragOver] = useState(false)

  const fileRef = useRef(null)

  useEffect(() => {
    const examples = mode === 'create' ? generateExamples : editExamples
    const t = setInterval(() => setPhIndex((i) => (i + 1) % examples.length), 3500)
    return () => clearInterval(t)
  }, [mode])

  const examples = mode === 'create' ? generateExamples : editExamples
  const placeholder =
    mode === 'create'
      ? `만들고 싶은 것을 적어보세요  ·  예) ${examples[phIndex % examples.length]}`
      : `어떻게 바꿀까요?  ·  예) ${examples[phIndex % examples.length]}`

  const canSubmit =
    !isBusy && prompt.trim().length > 0 && (mode === 'create' || !!editSource)

  // ---------- 파일 업로드 ----------
  const readFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      setEditSource(e.target.result)
      setResult(null)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (mode !== 'edit') return
    const file = e.dataTransfer.files?.[0]
    if (file) readFile(file)
  }

  // ---------- API ----------
  const runGenerate = async () => {
    const style = stylePresets.find((s) => s.id === styleId)
    const finalPrompt = style && style.prompt ? `${prompt.trim()}, ${style.prompt}` : prompt.trim()
    setIsBusy(true); setError(null); setResult(null)
    try {
      const res = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt, aspect_ratio: '1:1', transparent_bg: transparentBg }),
      })
      const data = await res.json()
      if (res.ok && data.success) setResult({ image: data.image_data, prompt: finalPrompt })
      else setError(data.detail || '이미지 생성에 실패했습니다.')
    } catch (e) {
      console.error(e); setError('네트워크 오류가 발생했습니다. 서버 상태를 확인해주세요.')
    } finally { setIsBusy(false) }
  }

  const runEdit = async (instruction) => {
    if (!editSource) return
    const text = (instruction || prompt).trim()
    if (!text) return
    setIsBusy(true); setError(null); setResult(null)
    try {
      const res = await fetch(`${API_URL}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_data: editSource, prompt: text, transparent_bg: transparentBg }),
      })
      const data = await res.json()
      if (res.ok && data.success) setResult({ image: data.image_data, prompt: text })
      else setError(data.detail || '이미지 편집에 실패했습니다.')
    } catch (e) {
      console.error(e); setError('네트워크 오류가 발생했습니다. 서버 상태를 확인해주세요.')
    } finally { setIsBusy(false) }
  }

  const handleSubmit = () => {
    if (!canSubmit) return
    mode === 'create' ? runGenerate() : runEdit()
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  // 생성 결과를 편집 모드로 보내기
  const sendToEdit = () => {
    if (!result) return
    setEditSource(result.image)
    setResult(null)
    setPrompt('')
    setMode('edit')
  }

  const download = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result.image
    a.download = `pearl-${Date.now()}.png`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  const switchMode = (m) => {
    setMode(m)
    setError(null)
    setPhIndex(0)
  }

  // ---------- 렌더 ----------
  return (
    <div
      className="app"
      onDragOver={(e) => { if (mode === 'edit') { e.preventDefault(); setDragOver(true) } }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      {/* dreamy atmosphere */}
      <div className="atmosphere">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
        <div className="veil" />
      </div>
      <div className="stars" />
      <div className="noise" />

      {/* Top bar */}
      <header className="topbar">
        <div className="brand">
          <Sparkles size={18} className="brand-icon" />
          <span>DingADing Studio</span>
        </div>
        <div className="segmented">
          <button className={mode === 'create' ? 'seg on' : 'seg'} onClick={() => switchMode('create')}>
            <Wand2 size={15} /> 생성
          </button>
          <button className={mode === 'edit' ? 'seg on' : 'seg'} onClick={() => switchMode('edit')}>
            <Pencil size={15} /> 편집
          </button>
        </div>
        <div className="brand-spacer" />
      </header>

      {/* Feed */}
      <main className="feed">
        {isBusy ? (
          <div className="stage">
            <div className="stage-loading">
              <Loader2 size={34} className="spin" />
              <p>{mode === 'create' ? '이미지를 만드는 중...' : '이미지를 편집하는 중...'}</p>
            </div>
          </div>
        ) : result ? (
          <div className="stage">
            <img src={result.image} alt={result.prompt} className="stage-img" />
            <div className="stage-actions">
              <button className="pill-btn" onClick={download}><Download size={16} /> 다운로드</button>
              <button className="pill-btn" onClick={sendToEdit}><Pencil size={16} /> 이 이미지 편집</button>
              <button className="pill-btn" onClick={mode === 'create' ? runGenerate : () => runEdit(result.prompt)}>
                <RefreshCw size={16} /> 다시
              </button>
            </div>
          </div>
        ) : mode === 'edit' && editSource ? (
          <div className="stage">
            <div className="source-card">
              <img src={editSource} alt="편집할 이미지" className="stage-img" />
              <button className="source-remove" onClick={() => setEditSource(null)} title="이미지 제거"><X size={16} /></button>
            </div>
            <p className="stage-hint">아래에 바꾸고 싶은 내용을 적거나, 빠른 편집 버튼을 눌러보세요</p>
          </div>
        ) : (
          <div className={`hero ${dragOver ? 'drag' : ''}`}>
            <Sparkles size={30} className="hero-icon" />
            <h1>{mode === 'create' ? '무엇이든 만들어보세요' : '이미지를 올려 편집을 시작하세요'}</h1>
            <p>{mode === 'create'
              ? '게임에 쓸 캐릭터, 아이템, 배경을 한 줄로 만들어요'
              : '가지고 있는 에셋을 올리고 포즈·표정·색상을 자유롭게 바꿔보세요'}</p>
            {mode === 'create' ? (
              <div className="chips center">
                {generateExamples.slice(0, 4).map((ex) => (
                  <button key={ex} className="chip ghost" onClick={() => setPrompt(ex)}>{ex}</button>
                ))}
              </div>
            ) : (
              <button className="upload-cta" onClick={() => fileRef.current?.click()}>
                <ImagePlus size={18} /> 이미지 올리기
              </button>
            )}
            {error && <div className="error-banner">{error}</div>}
          </div>
        )}
        {error && (result || (mode === 'edit' && editSource)) && (
          <div className="error-banner floating">{error}</div>
        )}
      </main>

      {/* Composer */}
      <div className="composer-wrap">
        <div className="composer">
          {/* options */}
          {mode === 'create' ? (
            <div className="options">
              <div className="chips">
                {stylePresets.map((s) => (
                  <button key={s.id} className={`chip ${styleId === s.id ? 'on' : ''}`} onClick={() => setStyleId(s.id)}>
                    <span className="emoji">{s.emoji}</span>{s.label}
                  </button>
                ))}
                <button className={`chip toggle ${transparentBg ? 'on' : ''}`} onClick={() => setTransparentBg((v) => !v)}>
                  투명배경
                </button>
              </div>
            </div>
          ) : (
            <div className="options">
              <div className="chips">
                {editQuickActions.map((q) => (
                  <button
                    key={q.label}
                    className="chip"
                    disabled={!editSource || isBusy}
                    onClick={() => runEdit(q.prompt)}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* input bar */}
          <div className="bar">
            {mode === 'edit' && (
              <button className="attach" onClick={() => fileRef.current?.click()} title="이미지 올리기">
                {editSource ? <img src={editSource} alt="" className="attach-thumb" /> : <ImagePlus size={20} />}
              </button>
            )}
            <textarea
              className="input"
              rows={1}
              value={prompt}
              placeholder={placeholder}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button className="submit" onClick={handleSubmit} disabled={!canSubmit} title="생성 (Enter)">
              {isBusy ? <Loader2 size={18} className="spin" /> : <ArrowUp size={18} />}
            </button>
          </div>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => readFile(e.target.files?.[0])} />
    </div>
  )
}

export default App
