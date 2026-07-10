import React, { useState, useEffect } from 'react'
import { Sparkles, Download, ImageIcon, Loader2, AlertCircle, Wand2 } from 'lucide-react'
import { stylePresets, aspectRatios, placeholderExamples } from './constants/presets'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function App() {
  const [prompt, setPrompt] = useState('')
  const [styleId, setStyleId] = useState('none')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [transparentBg, setTransparentBg] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [phIndex, setPhIndex] = useState(0)

  // placeholder 회전
  useEffect(() => {
    const t = setInterval(() => {
      setPhIndex((i) => (i + 1) % placeholderExamples.length)
    }, 3500)
    return () => clearInterval(t)
  }, [])

  const canGenerate = prompt.trim().length > 0 && !isGenerating

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setIsGenerating(true)
    setError(null)
    setResult(null)

    const style = stylePresets.find((s) => s.id === styleId)
    const finalPrompt = style && style.prompt ? `${prompt.trim()}, ${style.prompt}` : prompt.trim()

    try {
      const res = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          aspect_ratio: aspectRatio,
          transparent_bg: transparentBg,
        }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setResult({ image: data.image_data, prompt: finalPrompt })
      } else {
        setError(data.detail || data.error || '이미지 생성에 실패했습니다.')
      }
    } catch (e) {
      console.error(e)
      setError('네트워크 오류가 발생했습니다. 서버 상태를 확인해주세요.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result.image
    a.download = `pearl-image-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canGenerate) {
      handleGenerate()
    }
  }

  return (
    <div className="app-shell">
      {/* 배경 오브 */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      <div className="container">
        <header className="header">
          <div className="logo">
            <Sparkles size={22} className="logo-icon" />
            <span>Pearl Image</span>
          </div>
          <span className="badge">Imagen 4 Fast</span>
        </header>

        <div className="grid">
          {/* 컨트롤 패널 */}
          <section className="card control">
            <label className="field-label">
              <Wand2 size={15} /> 무엇을 만들까요?
            </label>
            <textarea
              className="prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={`예) ${placeholderExamples[phIndex]}`}
              rows={4}
            />

            <label className="field-label">스타일</label>
            <div className="chips">
              {stylePresets.map((s) => (
                <button
                  key={s.id}
                  className={`chip ${styleId === s.id ? 'chip-active' : ''}`}
                  onClick={() => setStyleId(s.id)}
                  type="button"
                >
                  <span className="chip-emoji">{s.emoji}</span>
                  {s.label}
                </button>
              ))}
            </div>

            <label className="field-label">비율</label>
            <div className="chips">
              {aspectRatios.map((r) => (
                <button
                  key={r.id}
                  className={`chip ${aspectRatio === r.id ? 'chip-active' : ''}`}
                  onClick={() => setAspectRatio(r.id)}
                  type="button"
                >
                  {r.label}
                  <span className="chip-hint">{r.hint}</span>
                </button>
              ))}
            </div>

            <label className="toggle">
              <input
                type="checkbox"
                checked={transparentBg}
                onChange={(e) => setTransparentBg(e.target.checked)}
              />
              <span className="toggle-track"><span className="toggle-thumb" /></span>
              <span>투명 배경 <span className="muted">(AI 배경 제거)</span></span>
            </label>

            <button className="generate-btn" onClick={handleGenerate} disabled={!canGenerate} type="button">
              {isGenerating ? (
                <><Loader2 size={18} className="spin" /> 생성 중...</>
              ) : (
                <><Sparkles size={18} /> 이미지 생성</>
              )}
            </button>
            <p className="hint-text">⌘/Ctrl + Enter 로도 생성돼요</p>
          </section>

          {/* 결과 패널 */}
          <section className="card result">
            {isGenerating ? (
              <div className="result-state">
                <Loader2 size={40} className="spin accent" />
                <p>이미지를 그리는 중...</p>
                <span className="muted">보통 몇 초면 완성돼요</span>
              </div>
            ) : error ? (
              <div className="result-state error">
                <AlertCircle size={40} />
                <p>{error}</p>
              </div>
            ) : result ? (
              <div className="result-image-wrap">
                <img src={result.image} alt={result.prompt} className="result-image" />
                <button className="download-btn" onClick={handleDownload} type="button">
                  <Download size={16} /> 다운로드
                </button>
              </div>
            ) : (
              <div className="result-state">
                <ImageIcon size={40} className="muted" />
                <p className="muted">생성된 이미지가 여기에 표시됩니다</p>
              </div>
            )}
          </section>
        </div>

        <footer className="footer">Powered by Google Imagen 4 Fast</footer>
      </div>
    </div>
  )
}

export default App
