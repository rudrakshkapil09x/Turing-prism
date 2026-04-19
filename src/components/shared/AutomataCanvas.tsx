import React, { useState, useRef, useEffect, MouseEvent as ReactMouseEvent } from 'react'

export interface CanvasState {
  id: string
  x: number
  y: number
  isStart?: boolean
  isFinal?: boolean
}

export interface CanvasTransition {
  from: string
  to: string
  label: string
  originalIndex?: number
}

export interface AutomataCanvasProps {
  states: CanvasState[]
  transitions: CanvasTransition[]
  activeStates?: string[]
  onStateMoved?: (id: string, x: number, y: number) => void
  onStateAdded?: (x: number, y: number) => void
  onStateToggled?: (id: string, prop: 'isStart' | 'isFinal') => void
  onStateDeleted?: (id: string) => void
  onTransitionAdded?: (from: string, to: string) => void
  onTransitionEdited?: (idx: number, newLabel: string) => void
  onTransitionDeleted?: (idx: number) => void
  arrowColor?: string
  accentColor?: string
  height?: number
}

export default function AutomataCanvas({
  states,
  transitions,
  activeStates = [],
  onStateMoved,
  onStateAdded,
  onStateToggled,
  onStateDeleted,
  onTransitionAdded,
  onTransitionEdited,
  onTransitionDeleted,
  arrowColor = '#928ea1',
  accentColor = '#7b61ff',
  height = 500
}: AutomataCanvasProps) {
  const canvasRef = useRef<SVGSVGElement>(null)
  
  // Interaction states
  const [draggingState, setDraggingState] = useState<string | null>(null)
  const [drawingFromState, setDrawingFromState] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [editingTransition, setEditingTransition] = useState<number | null>(null)
  const [editLabelValue, setEditLabelValue] = useState('')

  // Viewport mapping (Zoom & Pan)
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setDraggingState(null)
      setDrawingFromState(null)
      setIsPanning(false)
    }
    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp)
  }, [])

  // Prevent default scroll when zooming over the canvas
  useEffect(() => {
    const svg = canvasRef.current
    if (!svg) return
    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault()
    }
    svg.addEventListener('wheel', handleNativeWheel, { passive: false })
    return () => svg.removeEventListener('wheel', handleNativeWheel)
  }, [])

  // Maps physical screen pixels to logical canvas coordinates
  const getPointerCoords = (e: ReactMouseEvent | globalThis.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 }
    const rect = canvasRef.current.getBoundingClientRect()
    const rawX = e.clientX - rect.left
    const rawY = e.clientY - rect.top
    return { x: (rawX - pan.x) / scale, y: (rawY - pan.y) / scale }
  }

  const handleMouseMove = (e: ReactMouseEvent) => {
    if (isPanning) {
      setPan(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }))
    } else {
      const { x, y } = getPointerCoords(e)
      if (draggingState && onStateMoved) onStateMoved(draggingState, x, y)
      if (drawingFromState) setMousePos({ x, y })
    }
  }

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    const zoomFactor = 0.1
    const delta = e.deltaY > 0 ? -1 : 1
    const newScale = Math.max(0.1, Math.min(scale + delta * zoomFactor, 3))
    
    // Zoom to pointer logic
    const rect = canvasRef.current!.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    const newPanX = mouseX - (mouseX - pan.x) * (newScale / scale)
    const newPanY = mouseY - (mouseY - pan.y) * (newScale / scale)
    
    setScale(newScale)
    setPan({ x: newPanX, y: newPanY })
  }

  const handleCanvasMouseDown = (e: ReactMouseEvent) => {
    if (e.target === canvasRef.current || (e.target as SVGElement).tagName === 'svg') {
      setIsPanning(true)
      setSelectedState(null)
      setEditingTransition(null)
    }
  }

  const handleCanvasDoubleClick = (e: ReactMouseEvent) => {
    if (e.target === canvasRef.current || (e.target as SVGElement).tagName === 'svg') {
      const { x, y } = getPointerCoords(e)
      if (onStateAdded) onStateAdded(x, y)
    }
  }

  const handleStateMouseDown = (e: ReactMouseEvent, id: string) => {
    e.stopPropagation()
    if (e.button === 2 || e.shiftKey) {
      e.preventDefault()
      setDrawingFromState(id)
      setMousePos(getPointerCoords(e))
    } else if (e.button === 0) {
      setDraggingState(id)
      setSelectedState(id)
      setEditingTransition(null)
    }
  }

  const handleStateMouseUp = (e: ReactMouseEvent, id: string) => {
    if (drawingFromState) {
      if (onTransitionAdded) onTransitionAdded(drawingFromState, id)
    }
    setDrawingFromState(null)
    setDraggingState(null)
  }

  const handleTransitionClick = (e: ReactMouseEvent, idx: number, label: string) => {
    e.stopPropagation()
    setEditingTransition(idx)
    setEditLabelValue(label)
    setSelectedState(null)
  }

  // Pre-calculate mapped coordinates for editing overlay, etc.
  const mapLogicalToScreen = (lx: number, ly: number) => {
    return { x: lx * scale + pan.x, y: ly * scale + pan.y }
  }

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: height }}>
      {/* Zoom Controls */}
      <div className="absolute top-3 left-3 z-20 flex gap-2">
        <button onClick={() => setScale(s => Math.max(0.1, s - 0.2))} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-cream flex items-center justify-center backdrop-blur shadow-lg transition-colors material-symbols-outlined text-sm cursor-pointer" title="Zoom Out">remove</button>
        <button onClick={() => { setScale(1); setPan({x:0, y:0}) }} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-cream flex items-center justify-center backdrop-blur shadow-lg transition-colors material-symbols-outlined text-sm cursor-pointer" title="Reset View">fit_screen</button>
        <button onClick={() => setScale(s => Math.min(3, s + 0.2))} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-cream flex items-center justify-center backdrop-blur shadow-lg transition-colors material-symbols-outlined text-sm cursor-pointer" title="Zoom In">add</button>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-3 right-3 z-20 pointer-events-none flex flex-col gap-0.5 items-end text-[9px] font-label text-on-surface-variant/30 uppercase tracking-widest bg-black/20 p-2 rounded-lg backdrop-blur">
        <span>Drag canvas → pan</span>
        <span>Scroll wheel → zoom</span>
        <div className="w-full h-[1px] bg-white/5 my-1"></div>
        <span>Dbl-click canvas → add state</span>
        <span>Shift+drag state → draw transition</span>
        <span>Click state → options</span>
      </div>

      <svg
        ref={canvasRef}
        className={`w-full h-full absolute inset-0 simulator-canvas ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ minHeight: height }}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        onMouseDown={handleCanvasMouseDown}
        onDoubleClick={handleCanvasDoubleClick}
        onContextMenu={e => e.preventDefault()}
      >
        <defs>
          <marker id="canvas-arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill={arrowColor} />
          </marker>
          <marker id="trans-drawing-arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#ffffff" opacity="0.5" />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
          {/* Existing Transitions */}
          {(() => {
            return transitions.map((t, idx) => {
              const from = states.find(s => s.id === t.from)
              const to = states.find(s => s.id === t.to)
              if (!from || !to) return null

              const tIdx = t.originalIndex ?? idx
              const isEditing = editingTransition === tIdx
              const isSelf = t.from === t.to

              // Find grouping indices for multi-edges and self-loops
              const dirIndex = transitions.filter((tr, i) => i < idx && tr.from === t.from && tr.to === t.to).length
              const totalDir = transitions.filter(tr => tr.from === t.from && tr.to === t.to).length
              const hasBack = transitions.some(tr => tr.from === t.to && tr.to === t.from)

              if (isSelf) {
                const textX = from.x
                const textY = from.y - 80 - (dirIndex * 30)
                const controlY = from.y - 85 - (dirIndex * 40)
                const controlXOffset = 40 + (dirIndex * 15)
                
                return (
                  <g key={idx} onClick={e => handleTransitionClick(e, tIdx, t.label)} className="cursor-pointer group">
                    <path
                      d={'M ' + from.x + ' ' + (from.y - 32) + ' C ' + (from.x - controlXOffset) + ' ' + controlY + ' ' + (from.x + controlXOffset) + ' ' + controlY + ' ' + from.x + ' ' + (from.y - 32)}
                      stroke={arrowColor} fill="none" markerEnd="url(#canvas-arrow)"
                      className="group-hover:stroke-gold transition-colors"
                      strokeWidth={isEditing ? 2 : 1}
                    />
                    <text x={textX} y={textY} textAnchor="middle"
                      fill={isEditing ? '#ffdb3c' : '#928ea1'}
                      fontSize="12" fontFamily="monospace">
                      {t.label || 'ε'}
                    </text>
                  </g>
                )
              }

              const dx = to.x - from.x
              const dy = to.y - from.y
              const len = Math.sqrt(dx * dx + dy * dy) || 1
              const nx = dx / len
              const ny = dy / len

              // Curvature logic:
              // If bidirectional, push outwards (at least 25) plus spread
              // If one-way, spread around the center
              let curveOffset = 0
              if (hasBack) {
                curveOffset = 25 + (dirIndex * 25)
              } else {
                curveOffset = (dirIndex - (totalDir - 1) / 2) * 35
              }

              const midX = (from.x + to.x) / 2
              const midY = (from.y + to.y) / 2
              const cx = midX - ny * curveOffset
              const cy = midY + nx * curveOffset

              const textX = cx - ny * 14
              const textY = cy + nx * 14 - 4

              const startX = from.x + nx * 32
              const startY = from.y + ny * 32
              const endX = to.x - nx * 32
              const endY = to.y - ny * 32

              return (
                <g key={idx} onClick={e => handleTransitionClick(e, tIdx, t.label)} className="cursor-pointer group">
                  <path
                    d={curveOffset === 0 
                      ? 'M ' + startX + ' ' + startY + ' L ' + endX + ' ' + endY 
                      : 'M ' + startX + ' ' + startY + ' Q ' + cx + ' ' + cy + ' ' + endX + ' ' + endY}
                    stroke={arrowColor} fill="none" markerEnd="url(#canvas-arrow)"
                    className="group-hover:stroke-gold transition-colors"
                    strokeWidth={isEditing ? 2 : 1}
                  />
                  <rect x={textX - 18} y={textY - 10} width="36" height="16" fill="rgba(8,8,8,0.7)" rx="4" className="pointer-events-none" />
                  <text x={textX} y={textY} textAnchor="middle"
                    fill={isEditing ? '#ffdb3c' : '#928ea1'}
                    fontSize="11" fontFamily="monospace">
                    {t.label || 'ε'}
                  </text>
                </g>
              )
            })
          })()}

          {/* Drawing line */}
          {drawingFromState && mousePos && (() => {
            const from = states.find(s => s.id === drawingFromState)
            if (!from) return null
            return (
              <line x1={from.x} y1={from.y} x2={mousePos.x} y2={mousePos.y}
                stroke="#ffffff" strokeOpacity="0.4" strokeDasharray="6 4"
                markerEnd="url(#trans-drawing-arrow)" className="pointer-events-none" />
            )
          })()}

          {/* States */}
          {states.map(state => {
            const isActive = activeStates.includes(state.id)
            const isSelected = selectedState === state.id
            const fillColor = isActive ? accentColor + '40' : 'rgba(19,19,19,0.95)'
            const strokeColor = isSelected ? '#ffffff' : isActive ? accentColor : '#484555'
            return (
              <g
                key={state.id}
                onMouseDown={e => handleStateMouseDown(e, state.id)}
                onMouseUp={e => handleStateMouseUp(e, state.id)}
                style={{ cursor: draggingState === state.id ? 'grabbing' : 'grab' }}
              >
                {state.isStart && (
                  <path
                    d={'M ' + (state.x - 55) + ' ' + state.y + ' L ' + (state.x - 35) + ' ' + state.y}
                    stroke={accentColor} strokeWidth="2" markerEnd="url(#canvas-arrow)"
                  />
                )}
                {state.isFinal && (
                  <circle cx={state.x} cy={state.y} r={36} fill="none"
                    stroke={isSelected ? '#ffdb3c' : 'rgba(255,219,60,0.3)'}
                    strokeWidth={isSelected ? 3 : 2}
                    strokeDasharray={isSelected ? '0' : '4 4'}
                  />
                )}
                <circle
                  cx={state.x} cy={state.y} r={30}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 2 : isActive ? 2.5 : 1.5}
                />
                {isActive && (
                  <circle cx={state.x} cy={state.y} r={30} fill="none" stroke={accentColor} strokeWidth="1" opacity="0.4">
                    <animate attributeName="r" from="30" to="46" dur="1s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.4" to="0" dur="1s" repeatCount="indefinite" />
                  </circle>
                )}
                <text x={state.x} y={state.y + 5} textAnchor="middle"
                  fill={isActive ? '#c4b5fd' : '#faf7f0'}
                  fontSize="14" fontFamily="Georgia, serif" fontStyle="italic"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}>
                  {state.id}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      {/* State context menu */}
      {selectedState && (() => {
        const s = states.find(st => st.id === selectedState)
        if (!s) return null
        const screenPos = mapLogicalToScreen(s.x, s.y)
        const menuLeft = Math.max(10, Math.min(screenPos.x + 40, (canvasRef.current?.clientWidth ?? 500) - 160))
        const menuTop = Math.max(10, Math.min(screenPos.y - 40, (canvasRef.current?.clientHeight ?? 400) - 110))
        return (
          <div className="absolute bg-[#181820]/95 backdrop-blur border border-white/10 rounded-xl p-2 shadow-2xl flex flex-col gap-0.5 z-30"
            style={{ left: menuLeft, top: menuTop }}>
            <div className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant/50 mb-1 px-2">State {s.id}</div>
            <button onClick={() => { onStateToggled?.(s.id, 'isStart'); setSelectedState(null) }}
              className="text-left px-3 py-1.5 text-xs text-cream hover:bg-white/10 rounded font-body cursor-pointer w-full">
              {s.isStart ? 'Remove Start' : 'Make Start'}
            </button>
            <button onClick={() => { onStateToggled?.(s.id, 'isFinal'); setSelectedState(null) }}
              className="text-left px-3 py-1.5 text-xs text-cream hover:bg-white/10 rounded font-body cursor-pointer w-full">
              {s.isFinal ? 'Remove Final' : 'Make Final'}
            </button>
            <button onClick={() => { onStateDeleted?.(s.id); setSelectedState(null) }}
              className="text-left px-3 py-1.5 text-xs text-red-400 hover:bg-red-400/10 rounded font-body cursor-pointer w-full">
              Delete
            </button>
          </div>
        )
      })()}

      {/* Edit transition overlay */}
      {editingTransition !== null && (() => {
        const t = transitions.find(tr => (tr.originalIndex ?? transitions.indexOf(tr)) === editingTransition)
        if (!t) return null
        const from = states.find(s => s.id === t.from)
        const to = states.find(s => s.id === t.to)
        if (!from || !to) return null
        const currentIndex = transitions.indexOf(t)
        const dirIndex = transitions.filter((tr, i) => i < currentIndex && tr.from === t.from && tr.to === t.to).length
        const totalDir = transitions.filter(tr => tr.from === t.from && tr.to === t.to).length
        const hasBack = transitions.some(tr => tr.from === t.to && tr.to === t.from)

        let tx, ty
        if (from.id === to.id) {
          tx = from.x
          ty = from.y - 110 - (dirIndex * 33)
        } else {
          const dx = to.x - from.x
          const dy = to.y - from.y
          const len = Math.sqrt(dx * dx + dy * dy) || 1
          const nx = dx / len
          const ny = dy / len

          let curveOffset = 0
          if (hasBack) {
            curveOffset = 25 + (dirIndex * 25)
          } else {
            curveOffset = (dirIndex - (totalDir - 1) / 2) * 35
          }

          const midX = (from.x + to.x) / 2
          const midY = (from.y + to.y) / 2
          const cx = midX - ny * curveOffset
          const cy = midY + nx * curveOffset
          
          tx = cx - ny * 14
          ty = cy + nx * 14 - 40
        }
        
        const screenPos = mapLogicalToScreen(tx, ty)
        
        return (
          <div className="absolute z-30 fade-up" style={{ left: Math.max(4, screenPos.x - 70), top: Math.max(4, screenPos.y) }}>
            <div className="bg-[#181820] border border-gold/40 rounded-lg p-1.5 flex gap-1 shadow-[0_0_20px_rgba(255,219,60,0.15)]">
              <input
                autoFocus
                value={editLabelValue}
                onChange={e => setEditLabelValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { onTransitionEdited?.(editingTransition, editLabelValue); setEditingTransition(null) }
                  if (e.key === 'Escape') setEditingTransition(null)
                }}
                className="w-24 bg-transparent text-cream px-2 py-1 text-xs font-label focus:outline-none border-b border-gold/30"
                placeholder="label"
              />
              <button onClick={() => { onTransitionEdited?.(editingTransition, editLabelValue); setEditingTransition(null) }}
                className="px-2 text-gold hover:bg-gold/10 rounded cursor-pointer material-symbols-outlined text-sm">check</button>
              <button onClick={() => { onTransitionDeleted?.(editingTransition); setEditingTransition(null) }}
                className="px-2 text-red-400 hover:bg-red-400/10 rounded cursor-pointer material-symbols-outlined text-sm">delete</button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

