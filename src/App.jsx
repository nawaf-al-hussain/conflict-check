import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Plus,
    Trash2,
    RotateCcw,
    Database,
    CheckCircle2,
    XCircle,
    ArrowRight,
    Settings2,
    Table as TableIcon,
    ChevronDown,
    Info,
    Maximize2
} from 'lucide-react';
import { findConflicts, buildGraph, detectCycle } from './utils/logic';
import confetti from 'canvas-confetti';

const PrecedenceGraph = ({ txns, graph, isSerializable }) => {
    const containerRef = useRef(null);
    const [nodes, setNodes] = useState([]);

    // Calculate node positions in a circle
    useEffect(() => {
        const radius = 90;
        const centerX = 150;
        const centerY = 150;

        const newNodes = txns.map((id, i) => {
            const angle = (i / txns.length) * 2 * Math.PI - Math.PI / 2;
            return {
                id,
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });
        setNodes(newNodes);
    }, [txns]);

    const getArrowPath = (fromNode, toNode) => {
        if (!fromNode || !toNode) return '';
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const angle = Math.atan2(dy, dx);

        // Offset start and end to touch the circle edge
        const r = 20;
        const sx = fromNode.x + r * Math.cos(angle);
        const sy = fromNode.y + r * Math.sin(angle);
        const ex = toNode.x - r * Math.cos(angle);
        const ey = toNode.y - r * Math.sin(angle);

        return `M ${sx} ${sy} L ${ex} ${ey}`;
    };

    return (
        <div className="w-full h-full flex items-center justify-center relative bg-[#0F172A]/50 rounded-2xl border border-white/5 overflow-hidden">
            <svg viewBox="0 0 300 300" className="w-full h-full max-w-[300px] drop-shadow-2xl">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                    </marker>
                </defs>

                {/* Edges */}
                {nodes.map(from => (
                    (graph[from.id] || []).map(toId => {
                        const to = nodes.find(n => n.id === toId);
                        const isBackEdge = graph[toId]?.includes(from.id);
                        return (
                            <path
                                key={`${from.id}-${toId}`}
                                d={getArrowPath(from, to)}
                                fill="none"
                                stroke={!isSerializable && isBackEdge ? "var(--danger)" : "var(--primary)"}
                                strokeWidth="2"
                                strokeOpacity="0.6"
                                markerEnd="url(#arrowhead)"
                                className={!isSerializable && isBackEdge ? "animate-pulse" : ""}
                                style={{ color: !isSerializable && isBackEdge ? "var(--danger)" : "var(--primary)" }}
                            />
                        );
                    })
                ))}

                {/* Nodes */}
                {nodes.map(node => (
                    <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                        <circle
                            r="20"
                            fill="var(--bg-accent)"
                            stroke="var(--glass-border)"
                            strokeWidth="1"
                            className="drop-shadow-lg"
                        />
                        <text
                            dy=".3em"
                            textAnchor="middle"
                            fill="white"
                            fontSize="12"
                            fontWeight="bold"
                            style={{ pointerEvents: 'none' }}
                        >
                            {node.id}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
};

const App = () => {
    const [txnsCount, setTxnsCount] = useState(3);
    const [variablesCount, setVariablesCount] = useState(3);
    const [steps, setSteps] = useState([]);
    const [result, setResult] = useState(null);

    const txns = useMemo(() => Array.from({ length: txnsCount }, (_, i) => `T${i + 1}`), [txnsCount]);
    const variables = useMemo(() => Array.from({ length: variablesCount }, (_, i) => String.fromCharCode(65 + i)), [variablesCount]);

    const addStep = () => {
        // Add a new row with first transaction, Read, first variable
        setSteps([...steps, { id: Date.now(), txnId: txns[0] || '', type: 'R', variable: variables[0] || 'A' }]);
    };

    const updateStep = (id, field, value) => {
        setSteps(steps.map(s => {
            if (s.id !== id) return s;
            if (field === 'txnId') {
                // When setting txnId to a new value, reset type and variable to defaults
                return { ...s, txnId: value, type: 'R', variable: variables[0] || 'A' };
            }
            return { ...s, [field]: value };
        }));
    };

    const removeStep = (id) => {
        setSteps(steps.filter(s => s.id !== id));
    };

    const reset = () => {
        setSteps([]);
        setResult(null);
    };

    // Auto-analyze on step change
    useEffect(() => {
        // Filter out empty steps (where txnId is empty)
        const validSteps = steps.filter(s => s.txnId && s.txnId !== '');

        if (validSteps.length > 0) {
            const conflicts = findConflicts(validSteps);
            const graph = buildGraph(conflicts, txns);
            const hasCycle = detectCycle(graph);
            setResult({ isSerializable: !hasCycle, conflicts, graph });
        } else {
            setResult(null);
        }
    }, [steps, txns]);

    const triggerConfetti = () => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#3B82F6', '#10B981', '#8B5CF6']
        });
    };

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col p-1 md:p-2 gap-2 max-w-[1600px] mx-auto">
            {/* Header / Setup Bar */}
            <header className="glass-card header-wrap flex flex-wrap items-center justify-between gap-3 py-2 px-4 md:px-5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-lg shadow-xl shadow-primary-glow/20">
                        <Database size={20} color="white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black bg-gradient-to-r from-white to-text-secondary bg-clip-text text-transparent">ConflictCheck</h1>
                        <p className="text-[10px] text-text-muted font-medium tracking-widest uppercase">DB Serializability</p>
                    </div>
                </div>

                <div className="header-controls flex items-center gap-3 md:gap-6 flex-1 justify-end max-w-xl flex-wrap md:flex-nowrap">
                    <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-xl border border-white/5">
                        <div className="flex flex-col px-3">
                            <span className="text-xs text-text-muted font-bold uppercase">Transactions</span>
                            <input
                                type="number" min="0" max="10"
                                value={txnsCount}
                                onChange={(e) => {
                                    let val = e.target.value;
                                    if (val === '') {
                                        setTxnsCount(0);
                                    } else {
                                        const num = parseInt(val) || 0;
                                        setTxnsCount(Math.min(Math.max(num, 0), 10));
                                    }
                                }}
                                className="bg-transparent text-lg font-bold w-14 focus:outline-none text-center"
                            />
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex flex-col px-3 text-right">
                            <span className="text-xs text-text-muted font-bold uppercase">Variables</span>
                            <input
                                type="number" min="0" max="26"
                                value={variablesCount}
                                onChange={(e) => {
                                    let val = e.target.value;
                                    if (val === '') {
                                        setVariablesCount(0);
                                    } else {
                                        const num = parseInt(val) || 0;
                                        setVariablesCount(Math.min(Math.max(num, 0), 26));
                                    }
                                }}
                                className="bg-transparent text-lg font-bold w-14 text-right focus:outline-none"
                            />
                        </div>
                    </div>
                    <button onClick={reset} className="btn-ghost group">
                        <RotateCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                        Reset
                    </button>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-2 flex-1 overflow-hidden">
                {/* Left: Schedule Builder - Table Format */}
                <section className="glass-card flex-1 flex flex-col gap-2 min-w-0 overflow-hidden lg:w-1/2">
                    <div className="flex items-center justify-between py-1">
                        <h3 className="text-lg flex items-center gap-2">
                            <TableIcon size={20} className="text-primary" />
                            Schedule
                            <span className="text-xs font-normal text-text-muted ml-2 bg-white/5 px-2 py-0.5 rounded-full">
                                {steps.length} Ops
                            </span>
                        </h3>
                        <button onClick={addStep} className="btn-primary px-4 py-2 shadow-lg shadow-primary-glow/20 text-sm">
                            <Plus size={16} /> Add Row
                        </button>
                    </div>

                    {/* Table-based schedule */}
                    <div className="flex-1 overflow-auto custom-scroll min-h-0">
                        <table className="w-full schedule-table">
                            <thead>
                                <tr>
                                    <th className="w-12">#</th>
                                    {txns.map(t => (
                                        <th key={t} className="text-center px-3 py-3 text-primary font-bold text-sm">{t}</th>
                                    ))}
                                    <th className="w-12"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {steps.length === 0 ? (
                                    <tr>
                                        <td colSpan={txns.length + 2} className="text-center py-12 text-text-muted opacity-40">
                                            <div className="flex flex-col items-center">
                                                <Database size={32} className="mb-2" />
                                                <p>Click "Add Row" to start building schedule</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    steps.map((row, rowIndex) => (
                                        <tr key={row.id} className="group">
                                            <td className="text-center text-text-muted text-sm font-mono py-3">
                                                {rowIndex + 1}
                                            </td>
                                            {txns.map(t => (
                                                <td key={t} className="text-center p-1">
                                                    {row.txnId === t ? (
                                                        <select
                                                            value={row.type && row.variable ? `${row.type}${row.variable}` : 'RA'}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                if (val === '') {
                                                                    updateStep(row.id, 'txnId', '');
                                                                } else {
                                                                    const type = val[0];
                                                                    const variable = val.substring(1);
                                                                    // Update both type and variable in a single call using functional update to avoid stale state
                                                                    setSteps(prevSteps => prevSteps.map(s => {
                                                                        if (s.id !== row.id) return s;
                                                                        return { ...s, type, variable };
                                                                    }));
                                                                }
                                                            }}
                                                            className={`w-full bg-transparent font-bold text-center cursor-pointer rounded px-1 py-1 ${row.type === 'R' ? 'text-success' : 'text-warning'
                                                                }`}
                                                        >
                                                            <option value="">-</option>
                                                            {['R', 'W'].map(type =>
                                                                variables.map(v => (
                                                                    <option key={`${type}${v}`} value={`${type}${v}`}>
                                                                        {type}({v})
                                                                    </option>
                                                                ))
                                                            )}
                                                        </select>
                                                    ) : (
                                                        <button
                                                            onClick={() => updateStep(row.id, 'txnId', t)}
                                                            className="text-text-muted opacity-60 hover:opacity-100 hover:text-primary w-full h-full min-h-[44px] flex items-center justify-center font-bold text-lg"
                                                            aria-label={`Add operation to ${t}`}
                                                        >
                                                            +
                                                        </button>
                                                    )}
                                                </td>
                                            ))}
                                            <td className="text-center">
                                                <button
                                                    onClick={() => removeStep(row.id)}
                                                    className="p-1 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Right: Results & Viz */}
                <section className="glass-card flex-1 flex flex-col gap-2 min-w-0 overflow-hidden lg:w-1/2">
                    {/* Graph Card - First */}
                    <div className="flex-1 flex flex-col gap-1 min-h-[120px] bg-white/5 rounded-xl p-2">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <ArrowRight size={16} className="text-primary" />
                                Precedence Graph
                            </h3>
                            <Maximize2 size={14} className="text-text-muted cursor-pointer hover:text-white" />
                        </div>

                        <div className="flex-1 min-h-[80px] flex items-center justify-center">
                            <PrecedenceGraph
                                txns={txns}
                                graph={result ? result.graph : {}}
                                isSerializable={result ? result.isSerializable : true}
                            />
                        </div>

                        <div className="hidden lg:flex items-center justify-center gap-2 py-0.5 border-t border-white/5 bg-white/[0.02] rounded-b-xl">
                            <div className="flex items-center gap-1 text-[10px] text-text-muted">
                                <span className="w-2 h-2 rounded-full bg-primary" /> Conflict Dependency
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-text-muted">
                                <span className="w-2 h-2 rounded-full bg-danger" /> Cycle Edge
                            </div>
                        </div>
                    </div>

                    {/* Result Card - Below Graph */}
                    <div className={`relative overflow-hidden transition-all duration-500 border-l-4 bg-white/5 rounded-xl p-2 ${!result ? 'border-primary/20' :
                        result.isSerializable ? 'border-success shadow-2xl shadow-success/10' : 'border-danger shadow-2xl shadow-danger/10'
                        }`}>
                        {!result ? (
                            <div className="flex items-center gap-3 py-1">
                                <Info size={24} className="text-primary/40" />
                                <div>
                                    <h4 className="text-sm">Waiting for Steps</h4>
                                    <p className="text-[10px] text-text-muted">Add operations to start analysis.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    {result.isSerializable ? (
                                        <div className="p-1.5 bg-success/20 rounded-full"><CheckCircle2 size={24} className="text-success" /></div>
                                    ) : (
                                        <div className="p-1.5 bg-danger/20 rounded-full animate-bounce"><XCircle size={24} className="text-danger" /></div>
                                    )}
                                    <div>
                                        <h4 className="text-sm leading-tight font-bold">
                                            {result.isSerializable ? 'Schedule is Valid' : 'Conflict Detected'}
                                        </h4>
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${result.isSerializable ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                                            {result.isSerializable ? 'Serializable' : 'Not Serializable'}
                                        </span>
                                    </div>
                                    {result.isSerializable && (
                                        <button onClick={triggerConfetti} className="ml-auto p-2 hover:bg-white/5 rounded-lg text-success">
                                            🎉
                                        </button>
                                    )}
                                </div>

                                {!result.isSerializable && (
                                    <div className="bg-danger/10 p-2 rounded-xl border border-danger/20 flex flex-col gap-2">
                                        <p className="text-xs text-danger font-medium">A dependency cycle exists between transactions. This schedule could lead to inconsistency.</p>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {result.conflicts.slice(0, 3).map((c, i) => (
                                                <span key={i} className="text-[9px] bg-danger/20 px-2 py-0.5 rounded text-danger-foreground border border-danger/30">
                                                    {c.from} → {c.to} ({c.variable})
                                                </span>
                                            ))}
                                            {result.conflicts.length > 3 && <span className="text-[9px] text-text-muted">+{result.conflicts.length - 3} more</span>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </div>

            {/* Footer Info - Hidden for more space */}
            {/* <footer className="text-center opacity-30 group hover:opacity-100 transition-opacity">
                <p className="text-[10px] tracking-[.3em] uppercase flex items-center justify-center gap-2">
                    Crafted with <span className="text-danger group-hover:animate-ping">❤️</span> for Database Excellence
                </p>
            </footer> */}
        </div>
    );
};

export default App;
