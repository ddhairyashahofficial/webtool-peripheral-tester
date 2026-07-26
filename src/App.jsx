import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const CustomStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
    /* Prevent elastic overscroll on mobile for precise touch testing */
    body { 
        overscroll-behavior-y: none; 
        touch-action: pan-x pan-y; 
        background-color: #f8fafc;
    }
    
    /* Liquid Glass Shimmer Keyframes */
    @keyframes shimmer {
        0% { transform: translateX(-150%) skewX(-15deg); }
        100% { transform: translateX(250%) skewX(-15deg); }
    }
    
    .glass-shimmer {
        position: relative;
        overflow: hidden;
    }
    
    .glass-shimmer::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 50%;
        height: 100%;
        background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
        transform: translateX(-150%) skewX(-15deg);
        animation: shimmer 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        pointer-events: none;
        z-index: 10;
    }

    /* Spring Animation */
    @keyframes spring {
        0% { transform: scale(0.95); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }
    .animate-spring {
        animation: spring 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }

    /* Custom Glass Scrollbar */
    .glass-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
    .glass-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.02); border-radius: 10px; }
    .glass-scrollbar::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.3); border-radius: 10px; }
    .glass-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.5); }
  `}} />
);

// Liquid Glass Styling Constants
const GLASS_PANEL = "bg-white/60 backdrop-blur-xl border border-white/90 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)] hover:-translate-y-1 relative";
const GLASS_INNER = "bg-white/50 backdrop-blur-md border border-white/60 shadow-sm rounded-2xl relative overflow-hidden";
const GLASS_DARK = "bg-slate-900/85 backdrop-blur-2xl border border-slate-700/50 shadow-[0_16px_48px_rgba(0,0,0,0.2)] rounded-3xl relative overflow-hidden";

const iconPaths = {
    Activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>,
    MousePointer2: <path d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"></path>,
    Keyboard: <><path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M7 16h10"/><path d="M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/></>,
    Gamepad2: <><line x1="6" x2="10" y1="12" y2="12"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="15" x2="15.01" y1="13" y2="13"/><line x1="18" x2="18.01" y1="11" y2="11"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></>,
    Hand: <><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/><path d="M6 14v1"/></>,
    RotateCcw: <><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></>,
    Zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>,
    PenTool: <><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></>,
    Smartphone: <><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></>,
    Vibrate: <><path d="m2 8 2 2-2 2 2 2-2 2"/><path d="m22 8-2 2 2 2-2 2 2 2"/><rect width="8" height="14" x="8" y="5" rx="1"/></>,
    Info: <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>,
    Trophy: <><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></>
};

const Icon = ({ name, size = 24, className = "", strokeWidth = 2 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
        {iconPaths[name]}
    </svg>
);

// Safe local storage hook to prevent quota or privacy mode errors
function useSafeLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = value => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    render() {
        if (this.state.hasError) {
            return (
                <div className={`${GLASS_PANEL} p-6 flex flex-col items-center justify-center text-center !bg-red-50/50 !border-red-200`}>
                    <Icon name="Info" size={32} className="text-red-500 mb-2" />
                    <h2 className="text-lg font-bold text-slate-800">Visualizer Crashed</h2>
                    <p className="text-sm text-slate-500">This module encountered an error, but the rest of the application remains functional.</p>
                </div>
            );
        }
        return this.props.children;
    }
}

const usePointer = () => {
    const [pointerData, setPointerData] = useState({
        type: 'mouse', x: 0, y: 0, pressure: 0, tiltX: 0, tiltY: 0,
        buttons: { left: false, right: false, middle: false }
    });
    const [scrollData, setScrollData] = useState({ x: 0, y: 0, z: 0 });
    const [pollingRate, setPollingRate] = useState(0);
    const mouseMoveCount = useRef(0);
    const scrollTimeout = useRef(null);

    const handlePointer = useCallback((e, isDown) => {
        if (e.pointerType === 'touch') return; 
        const map = { 0: 'left', 1: 'middle', 2: 'right', 5: 'pen_eraser' };
        
        setPointerData(prev => {
            const newButtons = { ...prev.buttons };
            if (e.type === 'pointerdown' || e.type === 'pointerup') {
                newButtons[map[e.button]] = isDown;
            }
            return {
                type: e.pointerType || 'mouse',
                x: e.clientX, y: e.clientY,
                pressure: e.buttons > 0 ? (e.pressure || 0.5) : 0,
                tiltX: e.tiltX || 0, tiltY: e.tiltY || 0,
                buttons: newButtons
            };
        });
        if (e.type === 'pointermove') mouseMoveCount.current += 1;
    }, []);

    const handleWheel = useCallback((e) => {
        setScrollData({ x: e.deltaX, y: e.deltaY, z: e.deltaZ });
        if(scrollTimeout.current) clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => setScrollData({x:0, y:0, z:0}), 150);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setPollingRate(mouseMoveCount.current);
            mouseMoveCount.current = 0;
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return { pointerData, scrollData, pollingRate, handlePointer, handleWheel };
};

const useKeyboard = (recordMaxNkro) => {
    const [activeKeys, setActiveKeys] = useState({});
    const [keyHistory, setKeyHistory] = useState([]);
    const [maxNkro, setMaxNkro] = useState(0);

    const handleKeyDown = useCallback((e) => {
        if(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
        if(e.repeat) return; 
        
        setActiveKeys(p => {
            const next = { ...p, [e.code]: { key: e.key, start: performance.now() } };
            const currentActive = Object.keys(next).length;
            setMaxNkro(max => {
                const newMax = Math.max(max, currentActive);
                if (newMax > max) recordMaxNkro(newMax); // Notify parent to save to local storage
                return newMax;
            });
            return next;
        });
    }, [recordMaxNkro]);

    const handleKeyUp = useCallback((e) => {
        setActiveKeys(p => {
            const item = p[e.code];
            if(item) {
                setKeyHistory(h => [{ key: item.key, code: e.code, duration: performance.now() - item.start, id: Date.now() }, ...h].slice(0, 6));
            }
            const n = {...p}; delete n[e.code]; return n;
        });
    }, []);

    const resetKeyboard = useCallback(() => {
        setKeyHistory([]);
        setMaxNkro(0);
    }, []);

    return { activeKeys, keyHistory, maxNkro, handleKeyDown, handleKeyUp, resetKeyboard };
};

const useGamepad = () => {
    const [gamepad, setGamepad] = useState(null);
    const [gamepadIndex, setGamepadIndex] = useState(null);
    const reqRef = useRef(null);

    useEffect(() => {
        const scan = () => {
            const gps = navigator.getGamepads ? navigator.getGamepads() : [];
            const gpIndex = gps.findIndex(g => g !== null);
            const gp = gps[gpIndex];
            
            if (gp) {
                setGamepad({ axes: [...gp.axes], buttons: gp.buttons.map(b => ({ pressed: b.pressed, value: b.value })), id: gp.id });
                setGamepadIndex(gpIndex);
            } else {
                setGamepad(null);
                setGamepadIndex(null);
            }
            reqRef.current = requestAnimationFrame(scan);
        };

        window.addEventListener("gamepadconnected", scan);
        window.addEventListener("gamepaddisconnected", scan);
        reqRef.current = requestAnimationFrame(scan);

        return () => {
            window.removeEventListener("gamepadconnected", scan);
            window.removeEventListener("gamepaddisconnected", scan);
            cancelAnimationFrame(reqRef.current);
        }
    }, []);

    return { gamepad, gamepadIndex };
};

const Toast = ({ data }) => {
    if (!data) return null;
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-spring">
            <div className={`backdrop-blur-xl border px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl ${data.isError ? 'bg-red-50/90 border-red-200 text-red-700' : 'bg-slate-900/90 border-slate-700 text-white'}`}>
                <Icon name={data.isError ? 'Info' : 'Activity'} size={18} className={data.isError ? 'text-red-500' : 'text-green-400'} />
                <span className="font-semibold text-sm">{data.msg}</span>
            </div>
        </div>
    );
};

const LiveInputsBanner = ({ activeKeys, pointerData, gamepad }) => {
    const inputs = useMemo(() => {
        const arr = [];
        if (pointerData.buttons.left) arr.push({ type: pointerData.type, label: 'Primary Click', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' });
        if (pointerData.buttons.middle) arr.push({ type: pointerData.type, label: 'Middle Click', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' });
        if (pointerData.buttons.right) arr.push({ type: pointerData.type, label: 'Secondary Click', color: 'bg-red-500/20 text-red-300 border-red-500/30' });

        Object.values(activeKeys).forEach(k => {
            arr.push({ type: 'Key', label: k.key === ' ' ? 'Space' : k.key, color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' });
        });

        if (gamepad) {
            const btnNames = ['A', 'B', 'X', 'Y', 'L1', 'R1', 'L2', 'R2', 'Select', 'Start', 'L3', 'R3', 'D-Up', 'D-Down', 'D-Left', 'D-Right', 'Home'];
            gamepad.buttons.forEach((btn, idx) => {
                if (btn.pressed) arr.push({ type: 'Gamepad', label: btnNames[idx] || `Btn ${idx}`, color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' });
            });
        }
        return arr;
    }, [activeKeys, pointerData, gamepad]);

    return (
        <div className={`${GLASS_DARK} text-white p-5 flex gap-4 items-center min-h-[76px] glass-scrollbar overflow-x-auto mb-6 glass-shimmer`}>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest shrink-0 flex items-center gap-2">
                <Icon name="Activity" size={16} className="animate-pulse text-green-400" />
                Live Activity
            </span>
            <div className="w-px h-6 bg-slate-700 mx-2 shrink-0"></div>
            
            {inputs.length === 0 ? (
                <span className="text-slate-500 italic text-sm">Awaiting input from any peripheral...</span>
            ) : (
                <div className="flex gap-3 flex-nowrap">
                    {inputs.map((inp, i) => (
                        <div key={i} className={`px-4 py-2 rounded-xl text-sm font-bold flex gap-2 items-center whitespace-nowrap animate-in zoom-in duration-200 border backdrop-blur-md ${inp.color}`}>
                            <span className="opacity-70 text-[10px] uppercase bg-black/20 px-1.5 py-0.5 rounded">{inp.type}</span>
                            {inp.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const PointerVisualizer = ({ pointerData, scrollData, pollingRate }) => {
    const isPen = pointerData.type === 'pen';

    return (
        <div className={`${GLASS_PANEL} p-6 h-full flex flex-col relative`}>
            <div className="w-full flex justify-between items-center mb-6 relative z-10">
                <h2 className="font-bold flex items-center gap-2 text-slate-800 text-lg tracking-tight">
                    <div className="p-2 bg-blue-100/50 rounded-xl text-blue-600 border border-blue-200/50 shadow-inner">
                        {isPen ? <Icon name="PenTool" size={20} /> : <Icon name="MousePointer2" size={20} />} 
                    </div>
                    {isPen ? 'Stylus / Pen' : 'Pointer / Mouse'}
                </h2>
                <div className="text-right">
                    <div className="text-sm font-mono font-bold text-blue-600">{pollingRate} Hz</div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Polling Rate</div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-6 z-10">
                <div className="flex flex-col items-center justify-center">
                    <div className="relative w-28 h-40 bg-white/80 backdrop-blur-md rounded-[3rem] border-[3px] border-white shadow-[0_8px_16px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden mb-4 transition-transform duration-300 hover:scale-105">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-slate-200/50" />
                        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-0.5 bg-slate-200/50" />
                        
                        <div className="h-1/2 flex w-full">
                            <div className={`w-1/2 h-full border-b border-r border-slate-200/50 transition-colors duration-150 ${pointerData.buttons.left ? 'bg-blue-500' : 'bg-transparent'}`} />
                            <div className={`w-1/2 h-full border-b border-l border-slate-200/50 transition-colors duration-150 ${pointerData.buttons.right ? 'bg-red-500' : 'bg-transparent'}`} />
                        </div>
                        
                        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-10 bg-slate-100 rounded-full border-2 border-white shadow-inner flex items-center justify-center">
                            <div className={`w-2.5 h-5 rounded-full transition-colors duration-150 ${pointerData.buttons.middle ? 'bg-blue-600' : 'bg-slate-300'} ${(scrollData.y !== 0) ? 'animate-pulse bg-blue-400' : ''}`}></div>
                        </div>
                    </div>
                    <div className="text-xs font-mono text-slate-500 font-medium bg-white/50 px-3 py-1 rounded-full border border-white">
                        Type: <strong className="text-slate-800 uppercase">{pointerData.type}</strong>
                    </div>
                </div>

                <div className="flex flex-col justify-center gap-3">
                    <div className={`${GLASS_INNER} p-3`}>
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Coordinates</div>
                        <div className="text-sm font-mono font-semibold text-slate-800">X: {pointerData.x.toFixed(0)}</div>
                        <div className="text-sm font-mono font-semibold text-slate-800">Y: {pointerData.y.toFixed(0)}</div>
                    </div>
                    
                    <div className={`${GLASS_INNER} p-3`}>
                        <div className="text-[10px] text-slate-500 uppercase font-bold mb-2 tracking-wider flex justify-between">
                            <span>Pressure</span>
                            <span className="text-green-600">{(pointerData.pressure * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
                            <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-75" style={{ width: `${pointerData.pressure * 100}%` }} />
                        </div>
                    </div>

                    {isPen && (
                        <div className={`${GLASS_INNER} p-3 !bg-blue-50/50 !border-blue-200/50`}>
                            <div className="text-[10px] text-blue-500 uppercase font-bold mb-1 tracking-wider">Stylus Tilt</div>
                            <div className="text-sm font-mono font-semibold text-blue-800">X: {pointerData.tiltX}° | Y: {pointerData.tiltY}°</div>
                        </div>
                    )}

                    {!isPen && (
                        <div className={`${GLASS_INNER} p-3`}>
                            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-wider">Scroll Delta</div>
                            <div className="text-sm font-mono font-semibold text-slate-800">dY: {scrollData.y.toFixed(1)}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const KeyboardVisualizer = ({ activeKeys, history, maxNkro, historicMaxNkro }) => {
    const activeCount = Object.keys(activeKeys).length;
    
    return (
        <div className={`${GLASS_PANEL} p-6 h-full flex flex-col`}>
            <div className="w-full flex justify-between items-center mb-6">
                <h2 className="font-bold flex items-center gap-2 text-slate-800 text-lg tracking-tight">
                    <div className="p-2 bg-purple-100/50 rounded-xl text-purple-600 border border-purple-200/50 shadow-inner">
                        <Icon name="Keyboard" size={20} /> 
                    </div>
                    Keyboard
                </h2>
                <div className="text-right flex items-center gap-4">
                    <div className="text-right">
                        <div className="flex items-center justify-end gap-1 text-purple-600">
                            {historicMaxNkro > maxNkro && <Icon name="Trophy" size={12} className="text-amber-500" title={`All-time record: ${historicMaxNkro}`} />}
                            <span className="text-sm font-mono font-bold">{Math.max(maxNkro, historicMaxNkro)} Keys</span>
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Max NKRO</div>
                    </div>
                    <div className={`w-3.5 h-3.5 rounded-full shadow-inner ${activeCount ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-slate-200 border border-slate-300'}`}></div>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-4">
                <div className={`${GLASS_INNER} h-28 p-3 flex flex-wrap gap-2 content-start overflow-hidden relative shadow-inner !bg-slate-50/40`}>
                    {activeCount === 0 && <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-slate-400 italic">Press any keys...</span>}
                    {Object.entries(activeKeys).map(([code, data]) => (
                        <div key={code} className="px-4 py-2 bg-white/80 border border-purple-200 rounded-xl text-purple-700 flex items-center gap-2 animate-in zoom-in duration-200 shadow-sm font-bold shadow-purple-500/10">
                            <span className="text-sm">{data.key === ' ' ? 'Space' : data.key}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-auto pt-2 space-y-2">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3 border-b border-slate-200/50 pb-2">Duration History</div>
                    {history.length === 0 && <div className="text-xs text-slate-400 italic">No key history recorded.</div>}
                    {history.slice(0, 3).map((h) => (
                        <div key={h.id} className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700 bg-white/80 border border-slate-200 shadow-sm px-2.5 py-1 rounded-lg min-w-[50px] text-center">{h.key === ' ' ? 'Space' : h.key}</span>
                            <div className="flex items-center gap-2 flex-1 mx-4">
                                <div className="h-1.5 bg-slate-200/50 w-full rounded-full overflow-hidden shadow-inner">
                                    <div className={`h-full ${h.duration < 50 ? 'bg-red-400' : 'bg-gradient-to-r from-purple-400 to-indigo-500'}`} style={{ width: `${Math.min((h.duration/500)*100, 100)}%` }} />
                                </div>
                            </div>
                            <span className="font-mono font-semibold text-slate-600 w-12 text-right">{h.duration.toFixed(0)}ms</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const TouchVisualizer = ({ touches, showToast }) => {
    const canvasRef = useRef(null);

    const testMobileHaptics = () => {
        if (navigator.vibrate) {
            const success = navigator.vibrate([200, 100, 200]);
            if (success) {
                showToast("Vibration sequence triggered.", false);
            } else {
                showToast("Vibration blocked by user settings or device state.", true);
            }
        } else {
            showToast("Haptics/Vibration API is not supported on this device.", true);
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if(!canvas) return;
        
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        
        ctx.clearRect(0, 0, rect.width, rect.height);

        if (touches.length === 0) {
            ctx.fillStyle = "#94a3b8";
            ctx.font = "bold 14px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("Multitouch Trackpad Area", rect.width/2, rect.height/2);
        }

        touches.forEach(t => {
            const x = t.clientX - rect.left;
            const y = t.clientY - rect.top;
            
            const gradient = ctx.createRadialGradient(x, y, 5, x, y, 50);
            gradient.addColorStop(0, "rgba(245, 158, 11, 0.4)");
            gradient.addColorStop(1, "rgba(245, 158, 11, 0)");
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, 50, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#f59e0b";
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();

            ctx.fillStyle = "#475569";
            ctx.font = "bold 11px monospace";
            ctx.fillText(`ID:${t.identifier}`, x + 20, y - 10);
        });

    }, [touches]);

    return (
        <div className={`${GLASS_PANEL} p-6 h-[320px] flex flex-col relative`}>
            <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
                <h2 className="font-bold flex items-center gap-2 text-slate-800 text-lg tracking-tight">
                    <div className="p-2 bg-amber-100/50 rounded-xl text-amber-600 border border-amber-200/50 shadow-inner">
                        <Icon name="Hand" size={20} /> 
                    </div>
                    Touch & Haptics
                </h2>
                {touches.length > 0 && (
                    <div className="bg-amber-500/90 backdrop-blur text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-amber-500/30">
                    {touches.length} Finger{touches.length > 1 ? 's' : ''}
                    </div>
                )}
            </div>
            
            <div className="absolute inset-x-6 top-20 bottom-16 rounded-2xl shadow-inner bg-slate-50/30 border border-white/50 overflow-hidden">
                <canvas 
                    ref={canvasRef} 
                    className="w-full h-full touch-none cursor-crosshair"
                />
            </div>
            
            <div className="absolute bottom-4 left-0 w-full flex justify-center z-20">
                <button 
                    onClick={testMobileHaptics}
                    className="bg-white/80 backdrop-blur-md border border-white shadow-md text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-white hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 transition-all active:scale-95"
                >
                    <Icon name="Smartphone" size={16} className="text-slate-500" /> Test Device Vibrate
                </button>
            </div>
        </div>
    );
};

const GamepadVisualizer = ({ gamepad, gamepadIndex, showToast }) => {
    const testRumble = () => {
        try {
            const gp = navigator.getGamepads()[gamepadIndex];
            if (gp && gp.vibrationActuator) {
                gp.vibrationActuator.playEffect("dual-rumble", {
                    startDelay: 0,
                    duration: 400,
                    weakMagnitude: 1.0,
                    strongMagnitude: 1.0
                }).then(() => showToast("Rumble executed successfully.", false))
                  .catch(() => showToast("Rumble API call failed or blocked.", true));
            } else {
                showToast("Rumble API not supported by this browser/controller combo.", true);
            }
        } catch(e) {
            console.warn(e);
            showToast("An error occurred executing Rumble.", true);
        }
    };

    const Button = ({ idx, label, className }) => {
        const pressed = gamepad?.buttons[idx]?.pressed;
        return (
            <div className={`
            flex items-center justify-center border font-bold transition-all duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]
            ${pressed ? 'bg-pink-500 border-pink-400 text-white shadow-[0_0_20px_rgba(236,72,153,0.5)] z-10 scale-110' : 'bg-white/60 backdrop-blur-sm border-white shadow-sm text-slate-500'}
            ${className}
            `}>
            {label}
            </div>
        );
    };
    
    const Analog = ({ x = 0, y = 0 }) => (
        <div className="w-16 h-16 bg-white/50 backdrop-blur-md rounded-full relative border-2 border-white shadow-inner">
            <div 
            className="w-8 h-8 bg-slate-700 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg transition-transform duration-75"
            style={{ transform: `translate(calc(-50% + ${x * 20}px), calc(-50% + ${y * 20}px))` }}
            >
            {(Math.abs(x) > 0.1 || Math.abs(y) > 0.1) && <div className="absolute inset-0 bg-pink-500 rounded-full opacity-60 animate-ping"></div>}
            </div>
        </div>
    );

    return (
        <div className={`${GLASS_PANEL} p-6 h-[320px] flex flex-col relative`}>
            <div className="w-full flex justify-between items-center mb-4 z-10">
                <h2 className="font-bold flex items-center gap-2 text-slate-800 text-lg tracking-tight">
                    <div className="p-2 bg-pink-100/50 rounded-xl text-pink-600 border border-pink-200/50 shadow-inner">
                        <Icon name="Gamepad2" size={20} /> 
                    </div>
                    Controller
                </h2>
                <div className="flex items-center gap-3">
                    {gamepad && (
                        <button onClick={testRumble} className="bg-white/80 hover:bg-white backdrop-blur-sm border border-white shadow-sm text-slate-600 p-2 rounded-xl transition-all active:scale-95" title="Test Rumble">
                            <Icon name="Vibrate" size={16} />
                        </button>
                    )}
                    <div className={`px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider border shadow-sm backdrop-blur-md ${gamepad ? 'bg-green-100/80 text-green-700 border-green-200/50' : 'bg-slate-100/80 text-slate-500 border-slate-200/50'}`}>
                        {gamepad ? 'CONNECTED' : 'DISCONNECTED'}
                    </div>
                </div>
            </div>

            {!gamepad ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 opacity-70">
                    <div className="p-4 bg-white/40 rounded-full border border-white shadow-inner">
                        <Icon name="Gamepad2" size={48} strokeWidth={1} />
                    </div>
                    <p className="text-sm font-semibold tracking-wide">Press any button to connect</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 relative">
                    <div className="absolute -top-3 text-[10px] text-slate-400 font-mono font-medium truncate w-full text-center px-4 opacity-70">{gamepad.id}</div>
                    
                    <div className="flex gap-8 items-center mt-4">
                        <div className="flex flex-col gap-2 items-center">
                            <div className="flex gap-1 mb-1">
                                <Button idx={4} label="LB" className="w-10 h-5 rounded-t-lg text-[9px]" />
                                <Button idx={6} label="LT" className="w-10 h-5 rounded-t-lg text-[9px]" />
                            </div>
                            <Analog x={gamepad.axes[0]} y={gamepad.axes[1]} />
                            <div className="grid grid-cols-3 gap-1 mt-2">
                                <div />
                                <Button idx={12} label="↑" className="w-6 h-6 rounded-lg text-[10px]" />
                                <div />
                                <Button idx={14} label="←" className="w-6 h-6 rounded-lg text-[10px]" />
                                <Button idx={13} label="↓" className="w-6 h-6 rounded-lg text-[10px]" />
                                <Button idx={15} label="→" className="w-6 h-6 rounded-lg text-[10px]" />
                            </div>
                        </div>

                        <div className="flex gap-3 self-start mt-6">
                            <Button idx={8} label="SEL" className="w-9 h-3.5 rounded-full text-[7px]" />
                            <Button idx={9} label="STA" className="w-9 h-3.5 rounded-full text-[7px]" />
                        </div>

                        <div className="flex flex-col gap-2 items-center">
                            <div className="flex gap-1 mb-1">
                                <Button idx={7} label="RT" className="w-10 h-5 rounded-t-lg text-[9px]" />
                                <Button idx={5} label="RB" className="w-10 h-5 rounded-t-lg text-[9px]" />
                            </div>
                            <div className="grid grid-cols-3 gap-1 mb-2 relative h-16 w-16">
                                <Button idx={3} label="Y" className="w-7 h-7 rounded-full text-[11px] absolute top-[-5px] left-1/2 -translate-x-1/2" />
                                <Button idx={2} label="X" className="w-7 h-7 rounded-full text-[11px] absolute top-1/2 left-[-5px] -translate-y-1/2" />
                                <Button idx={1} label="B" className="w-7 h-7 rounded-full text-[11px] absolute top-1/2 right-[-5px] -translate-y-1/2" />
                                <Button idx={0} label="A" className="w-7 h-7 rounded-full text-[11px] absolute bottom-[-5px] left-1/2 -translate-x-1/2" />
                            </div>
                            <Analog x={gamepad.axes[2]} y={gamepad.axes[3]} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function App() {
    // Toast state
    const [toast, setToast] = useState(null);
    const showToast = useCallback((msg, isError = false) => {
        setToast({ msg, isError, id: Date.now() });
        setTimeout(() => setToast(null), 3500);
    }, []);

    // Safe Local Storage for max NKRO tracking
    const [historicMaxNkro, setHistoricMaxNkro] = useSafeLocalStorage("peripheral-tester-nkro", 0);
    const updateHistoricMaxNkro = useCallback((newMax) => {
        if (newMax > historicMaxNkro) setHistoricMaxNkro(newMax);
    }, [historicMaxNkro, setHistoricMaxNkro]);

    // Input States
    const { pointerData, scrollData, pollingRate, handlePointer, handleWheel } = usePointer();
    const { activeKeys, keyHistory, maxNkro, handleKeyDown, handleKeyUp, resetKeyboard } = useKeyboard(updateHistoricMaxNkro);
    const { gamepad, gamepadIndex } = useGamepad();
    const [touches, setTouches] = useState([]);
    
    // Global Event Listeners
    const handlePointerDown = useCallback((e) => handlePointer(e, true), [handlePointer]);
    const handlePointerUp = useCallback((e) => handlePointer(e, false), [handlePointer]);
    const handlePointerMove = useCallback((e) => handlePointer(e, false), [handlePointer]);
    const handleTouch = useCallback((e) => setTouches(Array.from(e.touches)), []);

    useEffect(() => {
        window.addEventListener('pointerdown', handlePointerDown);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        const preventContext = (e) => e.preventDefault();
        window.addEventListener('contextmenu', preventContext);

        return () => {
            window.removeEventListener('pointerdown', handlePointerDown);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('contextmenu', preventContext);
        };
    }, [handlePointerDown, handlePointerUp, handlePointerMove, handleWheel, handleKeyDown, handleKeyUp]);

    // Reset All Diagnostic Data
    const handleReset = () => {
        resetKeyboard();
        showToast("Diagnostic tracking has been reset.");
    };

    return (
        <div className="min-h-screen p-4 md:p-8 relative z-10 font-sans text-slate-800" 
             onTouchStart={handleTouch} onTouchMove={handleTouch} onTouchEnd={handleTouch} onTouchCancel={handleTouch}>
            
            <CustomStyles />
            <Toast data={toast} />

            {/* Ambient Animated Background (Liquid Glass Backdrop) */}
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-slate-50">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-300/30 blur-[120px] mix-blend-multiply"></div>
                <div class="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-300/30 blur-[120px] mix-blend-multiply"></div>
                <div class="absolute top-[30%] left-[50%] w-[40vw] h-[40vw] rounded-full bg-cyan-300/20 blur-[100px] mix-blend-multiply"></div>
            </div>
            
            <header className="sticky top-6 z-50 bg-white/70 backdrop-blur-2xl border border-white/90 shadow-[0_8px_32px_rgba(0,0,0,0.05)] px-6 py-4 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-4 mx-auto max-w-6xl mb-8 transition-all duration-500 glass-shimmer">
                <div>
                    <h1 className="text-2xl font-black flex items-center gap-3 text-slate-800 tracking-tight">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-2 rounded-2xl text-white shadow-lg shadow-slate-900/20">
                            <Icon name="Zap" size={20} /> 
                        </div>
                        Peripheral Tester Pro
                    </h1>
                    <p className="text-slate-500 font-medium text-xs mt-1 ml-1 opacity-80">Test keyboards, mice, styluses, gamepads, touch, and haptics.</p>
                </div>
                <button 
                    onClick={handleReset}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-2 bg-white/80 hover:bg-white backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white shadow-sm hover:shadow-md transition-all active:scale-95 duration-200">
                    <Icon name="RotateCcw" size={14} /> RESET DIAGNOSTICS
                </button>
            </header>

            <main className="max-w-6xl mx-auto space-y-6">
                <ErrorBoundary>
                    <LiveInputsBanner activeKeys={activeKeys} pointerData={pointerData} gamepad={gamepad} />
                </ErrorBoundary>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ErrorBoundary>
                        <PointerVisualizer pointerData={pointerData} scrollData={scrollData} pollingRate={pollingRate} />
                    </ErrorBoundary>
                    <ErrorBoundary>
                        <KeyboardVisualizer activeKeys={activeKeys} history={keyHistory} maxNkro={maxNkro} historicMaxNkro={historicMaxNkro} />
                    </ErrorBoundary>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ErrorBoundary>
                        <TouchVisualizer touches={touches} showToast={showToast} />
                    </ErrorBoundary>
                    <ErrorBoundary>
                        <GamepadVisualizer gamepad={gamepad} gamepadIndex={gamepadIndex} showToast={showToast} />
                    </ErrorBoundary>
                </div>
            </main>

            <div className="max-w-6xl mx-auto mt-12 text-center text-xs font-medium text-slate-400 pb-10 tracking-wide">
                Built with a Liquid Glass Architecture • Data persists safely on device • API support varies by browser
            </div>
        </div>
    );
}