import React, { useState, useEffect, useMemo } from 'react';
import { Dumbbell, Plus, Trash2, Calendar, Target, TrendingUp, Save, ChevronLeft, X, Check, Flame, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WorkoutNote() {
  const [view, setView] = useState('home'); // home, record, history, goal, graph
  const [workouts, setWorkouts] = useState([]);
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [graphTab, setGraphTab] = useState('body'); // body, exercise

  // フォーム用
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [muscle, setMuscle] = useState('');
  const [mood, setMood] = useState('');
  const [memo, setMemo] = useState('');
  const [exercises, setExercises] = useState([
    { name: '', sets: [{ reps: '', weight: '' }] }
  ]);
  const [editingId, setEditingId] = useState(null);

  // 初回読み込み (localStorageから)
  useEffect(() => {
    try {
      const w = localStorage.getItem('workouts');
      if (w) setWorkouts(JSON.parse(w));
    } catch (e) {}
    try {
      const g = localStorage.getItem('goal');
      if (g) setGoal(g);
    } catch (e) {}
    setLoading(false);
  }, []);

  // 保存 (localStorageへ)
  const saveWorkouts = (newList) => {
    setWorkouts(newList);
    try {
      localStorage.setItem('workouts', JSON.stringify(newList));
    } catch (e) {
      console.error(e);
    }
  };

  const saveGoal = (newGoal) => {
    setGoal(newGoal);
    try {
      localStorage.setItem('goal', newGoal);
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setWeight('');
    setBodyFat('');
    setMuscle('');
    setMood('');
    setMemo('');
    setExercises([{ name: '', sets: [{ reps: '', weight: '' }] }]);
    setEditingId(null);
  };

  const startEdit = (workout) => {
    setDate(workout.date);
    setWeight(workout.weight || '');
    setBodyFat(workout.bodyFat || '');
    setMuscle(workout.muscle || '');
    setMood(workout.mood || '');
    setMemo(workout.memo || '');
    setExercises(workout.exercises.length ? workout.exercises : [{ name: '', sets: [{ reps: '', weight: '' }] }]);
    setEditingId(workout.id);
    setView('record');
  };

  const handleSave = async () => {
    const cleanExercises = exercises
      .filter(e => e.name.trim())
      .map(e => ({
        name: e.name,
        sets: e.sets.filter(s => s.reps || s.weight)
      }))
      .filter(e => e.sets.length > 0);

    if (!cleanExercises.length && !weight && !bodyFat && !muscle && !mood && !memo) {
      alert('何か入力してから保存してね');
      return;
    }

    const record = {
      id: editingId || Date.now().toString(),
      date,
      weight,
      bodyFat,
      muscle,
      mood,
      memo,
      exercises: cleanExercises,
    };

    let newList;
    if (editingId) {
      newList = workouts.map(w => w.id === editingId ? record : w);
    } else {
      newList = [record, ...workouts];
    }
    newList.sort((a, b) => b.date.localeCompare(a.date));
    await saveWorkouts(newList);
    resetForm();
    setView('history');
  };

  const handleDelete = async (id) => {
    if (!confirm('この記録を削除する？')) return;
    const newList = workouts.filter(w => w.id !== id);
    await saveWorkouts(newList);
  };

  const addExercise = () => {
    setExercises([...exercises, { name: '', sets: [{ reps: '', weight: '' }] }]);
  };

  const removeExercise = (i) => {
    setExercises(exercises.filter((_, idx) => idx !== i));
  };

  const updateExerciseName = (i, name) => {
    const copy = [...exercises];
    copy[i].name = name;
    setExercises(copy);
  };

  const addSet = (i) => {
    const copy = [...exercises];
    copy[i].sets.push({ reps: '', weight: '' });
    setExercises(copy);
  };

  const removeSet = (i, j) => {
    const copy = [...exercises];
    copy[i].sets = copy[i].sets.filter((_, idx) => idx !== j);
    if (copy[i].sets.length === 0) copy[i].sets.push({ reps: '', weight: '' });
    setExercises(copy);
  };

  const updateSet = (i, j, field, value) => {
    const copy = [...exercises];
    copy[i].sets[j][field] = value;
    setExercises(copy);
  };

  // 統計
  const totalDays = workouts.length;
  const thisMonth = workouts.filter(w => {
    const d = new Date(w.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const latestWeight = workouts.find(w => w.weight)?.weight;

  const moods = [
    { emoji: '💪', label: '絶好調' },
    { emoji: '🔥', label: '気合い十分' },
    { emoji: '😊', label: 'まあまあ' },
    { emoji: '😓', label: 'きつい' },
    { emoji: '😵', label: 'バテた' },
  ];

  // スタイル
  const colors = {
    bg: '#0a0a0a',
    card: '#161616',
    cardLight: '#1f1f1f',
    accent: '#d4ff3a',
    accentDark: '#a8d028',
    text: '#f5f5f5',
    textDim: '#888',
    border: '#2a2a2a',
    danger: '#ff4d4d',
  };

  // グラフ用：種目一覧（よく記録されている順）
  const exerciseList = useMemo(() => {
    const map = {};
    workouts.forEach(w => {
      w.exercises.forEach(e => {
        if (!e.name) return;
        map[e.name] = (map[e.name] || 0) + 1;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
  }, [workouts]);

  // グラフ用：体組成データ
  const bodyChartData = useMemo(() => {
    return [...workouts].reverse()
      .filter(w => w.weight || w.bodyFat || w.muscle)
      .map(w => ({
        date: formatDateShort(w.date),
        体重: w.weight ? parseFloat(w.weight) : null,
        体脂肪率: w.bodyFat ? parseFloat(w.bodyFat) : null,
        筋肉量: w.muscle ? parseFloat(w.muscle) : null,
      }));
  }, [workouts]);

  // グラフ用：選択中の種目の推移データ
  const chartData = useMemo(() => {
    if (!selectedExercise) return [];
    const data = [];
    [...workouts].reverse().forEach(w => {
      const ex = w.exercises.find(e => e.name === selectedExercise);
      if (!ex || !ex.sets.length) return;
      const weights = ex.sets.map(s => parseFloat(s.weight)).filter(n => !isNaN(n));
      const reps = ex.sets.map(s => parseInt(s.reps)).filter(n => !isNaN(n));
      const maxWeight = weights.length ? Math.max(...weights) : 0;
      const totalReps = reps.reduce((a, b) => a + b, 0);
      // ボリューム = 合計 (重さ×回数)
      let volume = 0;
      ex.sets.forEach(s => {
        const w = parseFloat(s.weight) || 0;
        const r = parseInt(s.reps) || 0;
        volume += w * r;
      });
      data.push({
        date: formatDateShort(w.date),
        最大重量: maxWeight,
        ボリューム: volume,
        合計回数: totalReps,
      });
    });
    return data;
  }, [selectedExercise, workouts]);


  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
        読み込み中...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      color: colors.text,
      fontFamily: '"Helvetica Neue", "Hiragino Sans", "Yu Gothic", sans-serif',
      maxWidth: '480px',
      margin: '0 auto',
      paddingBottom: '100px',
      position: 'relative',
    }}>
      {/* ヘッダー */}
      <div style={{
        padding: '24px 20px 16px',
        borderBottom: `1px solid ${colors.border}`,
        position: 'sticky',
        top: 0,
        background: colors.bg,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {view !== 'home' ? (
          <button
            onClick={() => { setView('home'); resetForm(); }}
            style={{
              background: colors.card,
              border: 'none',
              color: colors.text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0',
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              WebkitTapHighlightColor: 'transparent',
              transition: 'background 0.1s, transform 0.1s',
            }}
            onTouchStart={(e) => { e.currentTarget.style.background = colors.cardLight; e.currentTarget.style.transform = 'scale(0.92)'; }}
            onTouchEnd={(e) => { e.currentTarget.style.background = colors.card; e.currentTarget.style.transform = 'scale(1)'; }}
            onMouseDown={(e) => { e.currentTarget.style.background = colors.cardLight; }}
            onMouseUp={(e) => { e.currentTarget.style.background = colors.card; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = colors.card; }}
            aria-label="戻る"
          >
            <ChevronLeft size={24} />
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: colors.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Dumbbell size={22} color="#000" />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: colors.textDim, letterSpacing: '2px', fontWeight: '600' }}>WORKOUT</div>
              <div style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>トレーニングノート</div>
            </div>
          </div>
        )}
        {view !== 'home' && (
          <div style={{ fontSize: '16px', fontWeight: '700' }}>
            {view === 'record' && (editingId ? '記録を編集' : '今日の記録')}
            {view === 'history' && '履歴'}
            {view === 'goal' && '目標'}
            {view === 'graph' && 'グラフ'}
          </div>
        )}
        {view !== 'home' && <div style={{ width: '32px' }} />}
      </div>

      {/* ホーム画面 */}
      {view === 'home' && (
        <div style={{ padding: '20px' }}>
          {/* 目標カード */}
          <div onClick={() => setView('goal')} style={{
            background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
            borderRadius: '20px',
            padding: '20px',
            marginBottom: '16px',
            color: '#000',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Target size={18} />
              <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '1px' }}>MY GOAL</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', lineHeight: '1.4', minHeight: '50px' }}>
              {goal || 'タップして目標を設定 →'}
            </div>
          </div>

          {/* 統計 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '24px' }}>
            <StatCard label="累計" value={totalDays} unit="回" colors={colors} />
            <StatCard label="今月" value={thisMonth} unit="回" colors={colors} />
            <StatCard label="体重" value={latestWeight || '—'} unit={latestWeight ? 'kg' : ''} colors={colors} />
          </div>

          {/* メインボタン */}
          <button onClick={() => { resetForm(); setView('record'); }} style={{
            width: '100%',
            background: colors.accent,
            color: '#000',
            border: 'none',
            borderRadius: '18px',
            padding: '22px',
            fontSize: '18px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '12px',
            boxShadow: `0 8px 24px ${colors.accent}40`,
          }}>
            <Plus size={24} strokeWidth={3} />
            今日のトレーニングを記録
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button onClick={() => setView('history')} style={{
              background: colors.card,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '18px',
              padding: '18px 12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}>
              <Calendar size={18} />
              履歴 ({workouts.length})
            </button>

            <button onClick={() => { setSelectedExercise(exerciseList[0]?.name || null); setView('graph'); }} style={{
              background: colors.card,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '18px',
              padding: '18px 12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}>
              <BarChart3 size={18} />
              グラフ
            </button>
          </div>

          {/* 最近の記録プレビュー */}
          {workouts.length > 0 && (
            <div style={{ marginTop: '28px' }}>
              <div style={{ fontSize: '12px', color: colors.textDim, letterSpacing: '2px', fontWeight: '700', marginBottom: '12px' }}>
                RECENT
              </div>
              {workouts.slice(0, 3).map(w => (
                <div key={w.id} onClick={() => startEdit(w)} style={{
                  background: colors.card,
                  borderRadius: '14px',
                  padding: '14px 16px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  borderLeft: `3px solid ${colors.accent}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700' }}>{formatDate(w.date)}</div>
                    {w.mood && <div style={{ fontSize: '18px' }}>{w.mood}</div>}
                  </div>
                  <div style={{ fontSize: '12px', color: colors.textDim }}>
                    {w.exercises.length > 0
                      ? w.exercises.map(e => e.name).join(' / ')
                      : (w.memo || '記録あり')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 記録画面 */}
      {view === 'record' && (
        <div style={{ padding: '20px' }}>
          {/* 日付 */}
          <Section label="日付" colors={colors}>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={inputStyle(colors)} />
          </Section>

          {/* 体組成 */}
          <Section label="体組成" colors={colors}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '10px', color: colors.textDim, marginBottom: '4px', fontWeight: '600' }}>体重 (kg)</div>
                <input type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)}
                  placeholder="65.5" style={inputStyle(colors)} />
              </div>
              <div>
                <div style={{ fontSize: '10px', color: colors.textDim, marginBottom: '4px', fontWeight: '600' }}>体脂肪 (%)</div>
                <input type="number" step="0.1" value={bodyFat} onChange={e => setBodyFat(e.target.value)}
                  placeholder="18.0" style={inputStyle(colors)} />
              </div>
              <div>
                <div style={{ fontSize: '10px', color: colors.textDim, marginBottom: '4px', fontWeight: '600' }}>筋肉量 (kg)</div>
                <input type="number" step="0.1" value={muscle} onChange={e => setMuscle(e.target.value)}
                  placeholder="50.0" style={inputStyle(colors)} />
              </div>
            </div>
          </Section>

          {/* 気分 */}
          <Section label="今日の気分・体調" colors={colors}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {moods.map(m => (
                <button key={m.emoji} onClick={() => setMood(mood === m.emoji ? '' : m.emoji)} style={{
                  flex: '1 1 auto',
                  background: mood === m.emoji ? colors.accent : colors.card,
                  color: mood === m.emoji ? '#000' : colors.text,
                  border: `1px solid ${mood === m.emoji ? colors.accent : colors.border}`,
                  borderRadius: '12px',
                  padding: '10px 8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  minWidth: '60px',
                }}>
                  <span style={{ fontSize: '20px' }}>{m.emoji}</span>
                  <span style={{ fontSize: '10px' }}>{m.label}</span>
                </button>
              ))}
            </div>
          </Section>

          {/* 種目 */}
          <Section label="種目・セット" colors={colors}>
            {exercises.map((ex, i) => (
              <div key={i} style={{
                background: colors.card,
                borderRadius: '14px',
                padding: '14px',
                marginBottom: '10px',
              }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={ex.name}
                    onChange={e => updateExerciseName(i, e.target.value)}
                    placeholder={`種目名 (例: ベンチプレス)`}
                    style={{ ...inputStyle(colors), flex: 1, marginBottom: 0 }}
                  />
                  {exercises.length > 1 && (
                    <button onClick={() => removeExercise(i)} style={{
                      background: 'transparent',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '10px',
                      padding: '0 12px',
                      color: colors.danger,
                      cursor: 'pointer',
                    }}>
                      <X size={16} />
                    </button>
                  )}
                </div>
                {ex.sets.map((s, j) => (
                  <div key={j} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{
                      background: colors.cardLight,
                      width: '32px', height: '38px',
                      borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: '700', color: colors.accent,
                      flexShrink: 0,
                    }}>
                      {j + 1}
                    </div>
                    <input
                      type="number"
                      value={s.weight}
                      onChange={e => updateSet(i, j, 'weight', e.target.value)}
                      placeholder="重さ"
                      style={{ ...smallInputStyle(colors) }}
                    />
                    <span style={{ color: colors.textDim, fontSize: '12px' }}>kg ×</span>
                    <input
                      type="number"
                      value={s.reps}
                      onChange={e => updateSet(i, j, 'reps', e.target.value)}
                      placeholder="回数"
                      style={{ ...smallInputStyle(colors) }}
                    />
                    <span style={{ color: colors.textDim, fontSize: '12px' }}>回</span>
                    {ex.sets.length > 1 && (
                      <button onClick={() => removeSet(i, j)} style={{
                        background: 'transparent', border: 'none', color: colors.textDim,
                        cursor: 'pointer', padding: '4px',
                      }}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => addSet(i)} style={{
                  background: 'transparent',
                  border: `1px dashed ${colors.border}`,
                  borderRadius: '10px',
                  padding: '8px',
                  width: '100%',
                  color: colors.textDim,
                  fontSize: '12px',
                  cursor: 'pointer',
                  marginTop: '4px',
                  fontWeight: '600',
                }}>
                  + セット追加
                </button>
              </div>
            ))}
            <button onClick={addExercise} style={{
              background: colors.cardLight,
              border: `1px solid ${colors.border}`,
              borderRadius: '14px',
              padding: '12px',
              width: '100%',
              color: colors.accent,
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}>
              <Plus size={16} /> 種目を追加
            </button>
          </Section>

          {/* メモ */}
          <Section label="メモ (フリー記入)" colors={colors}>
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="疲れ具合、振り返り、明日への一言など"
              rows={3}
              style={{ ...inputStyle(colors), resize: 'vertical', fontFamily: 'inherit' }}
            />
          </Section>

          {/* 保存ボタン */}
          <button onClick={handleSave} style={{
            width: '100%',
            background: colors.accent,
            color: '#000',
            border: 'none',
            borderRadius: '16px',
            padding: '18px',
            fontSize: '17px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '20px',
            boxShadow: `0 8px 24px ${colors.accent}40`,
          }}>
            <Save size={20} strokeWidth={3} />
            {editingId ? '更新する' : '保存する'}
          </button>
        </div>
      )}

      {/* 履歴画面 */}
      {view === 'history' && (
        <div style={{ padding: '20px' }}>
          {workouts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.textDim }}>
              <Dumbbell size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
              <div style={{ fontSize: '14px' }}>まだ記録がありません</div>
            </div>
          ) : (
            workouts.map(w => (
              <div key={w.id} style={{
                background: colors.card,
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '12px',
                borderLeft: `3px solid ${colors.accent}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '800' }}>{formatDate(w.date)}</div>
                    <div style={{ fontSize: '11px', color: colors.textDim }}>
                      {w.weight && `体重 ${w.weight}kg`}
                      {w.bodyFat && ` · 体脂肪 ${w.bodyFat}%`}
                      {w.muscle && ` · 筋肉 ${w.muscle}kg`}
                      {(w.weight || w.bodyFat || w.muscle) && w.mood && ' · '}
                      {w.mood && <span style={{ fontSize: '14px' }}>{w.mood}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => startEdit(w)} style={{
                      background: colors.cardLight, border: 'none',
                      borderRadius: '8px', padding: '6px 10px',
                      color: colors.accent, cursor: 'pointer', fontSize: '11px', fontWeight: '700',
                    }}>編集</button>
                    <button onClick={() => handleDelete(w.id)} style={{
                      background: 'transparent', border: 'none',
                      color: colors.danger, cursor: 'pointer', padding: '6px',
                    }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {w.exercises.map((ex, i) => (
                  <div key={i} style={{
                    background: colors.cardLight,
                    borderRadius: '10px',
                    padding: '10px 12px',
                    marginBottom: '6px',
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>{ex.name}</div>
                    <div style={{ fontSize: '12px', color: colors.textDim, lineHeight: '1.6' }}>
                      {ex.sets.map((s, j) => (
                        <span key={j} style={{ marginRight: '10px' }}>
                          <span style={{ color: colors.accent, fontWeight: '700' }}>{j + 1}.</span> {s.weight || '—'}kg × {s.reps || '—'}回
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {w.memo && (
                  <div style={{
                    fontSize: '12px',
                    color: colors.textDim,
                    fontStyle: 'italic',
                    marginTop: '8px',
                    padding: '8px 10px',
                    background: colors.cardLight,
                    borderRadius: '8px',
                  }}>
                    💬 {w.memo}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* グラフ画面 */}
      {view === 'graph' && (
        <div style={{ padding: '20px' }}>
          {/* メインタブ (体組成 / 種目) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px',
            background: colors.card,
            padding: '5px',
            borderRadius: '14px',
            marginBottom: '20px',
          }}>
            <button onClick={() => setGraphTab('body')} style={{
              background: graphTab === 'body' ? colors.accent : 'transparent',
              color: graphTab === 'body' ? '#000' : colors.text,
              border: 'none',
              borderRadius: '10px',
              padding: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
            }}>体組成</button>
            <button onClick={() => setGraphTab('exercise')} style={{
              background: graphTab === 'exercise' ? colors.accent : 'transparent',
              color: graphTab === 'exercise' ? '#000' : colors.text,
              border: 'none',
              borderRadius: '10px',
              padding: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
            }}>種目別</button>
          </div>

          {/* 体組成タブ */}
          {graphTab === 'body' && (
            bodyChartData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.textDim }}>
                <BarChart3 size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <div style={{ fontSize: '14px' }}>まだ体組成の記録がありません</div>
                <div style={{ fontSize: '12px', marginTop: '6px' }}>体重・体脂肪・筋肉量を記録するとここに表示されます</div>
              </div>
            ) : (
              <>
                {/* 体組成サマリー */}
                {(() => {
                  const latest = bodyChartData[bodyChartData.length - 1];
                  const first = bodyChartData[0];
                  const diff = (curr, init) => {
                    if (curr == null || init == null) return null;
                    const d = curr - init;
                    return (d > 0 ? '+' : '') + d.toFixed(1);
                  };
                  return (
                    <div style={{
                      background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
                      borderRadius: '20px',
                      padding: '20px',
                      marginBottom: '20px',
                      color: '#000',
                    }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '2px', marginBottom: '12px' }}>
                        BODY COMPOSITION
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                        <BodyStat label="体重" value={latest.体重} unit="kg" diff={diff(latest.体重, first.体重)} />
                        <BodyStat label="体脂肪" value={latest.体脂肪率} unit="%" diff={diff(latest.体脂肪率, first.体脂肪率)} />
                        <BodyStat label="筋肉量" value={latest.筋肉量} unit="kg" diff={diff(latest.筋肉量, first.筋肉量)} />
                      </div>
                    </div>
                  );
                })()}

                {/* 体重 */}
                <ChartCard title="体重の推移" unit="kg" colors={colors}>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={bodyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                      <XAxis dataKey="date" stroke={colors.textDim} fontSize={10} />
                      <YAxis stroke={colors.textDim} fontSize={10} domain={['dataMin - 1', 'dataMax + 1']} />
                      <Tooltip
                        contentStyle={{ background: colors.cardLight, border: `1px solid ${colors.border}`, borderRadius: '10px', fontSize: '12px' }}
                        labelStyle={{ color: colors.text }}
                      />
                      <Line type="monotone" dataKey="体重" stroke={colors.accent} strokeWidth={3}
                        dot={{ fill: colors.accent, r: 4 }} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* 体脂肪率 */}
                <ChartCard title="体脂肪率の推移" unit="%" colors={colors}>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={bodyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                      <XAxis dataKey="date" stroke={colors.textDim} fontSize={10} />
                      <YAxis stroke={colors.textDim} fontSize={10} domain={['dataMin - 1', 'dataMax + 1']} />
                      <Tooltip
                        contentStyle={{ background: colors.cardLight, border: `1px solid ${colors.border}`, borderRadius: '10px', fontSize: '12px' }}
                        labelStyle={{ color: colors.text }}
                      />
                      <Line type="monotone" dataKey="体脂肪率" stroke="#ff9a3c" strokeWidth={3}
                        dot={{ fill: '#ff9a3c', r: 4 }} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* 筋肉量 */}
                <ChartCard title="筋肉量の推移" unit="kg" colors={colors}>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={bodyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                      <XAxis dataKey="date" stroke={colors.textDim} fontSize={10} />
                      <YAxis stroke={colors.textDim} fontSize={10} domain={['dataMin - 1', 'dataMax + 1']} />
                      <Tooltip
                        contentStyle={{ background: colors.cardLight, border: `1px solid ${colors.border}`, borderRadius: '10px', fontSize: '12px' }}
                        labelStyle={{ color: colors.text }}
                      />
                      <Line type="monotone" dataKey="筋肉量" stroke="#7dd3fc" strokeWidth={3}
                        dot={{ fill: '#7dd3fc', r: 4 }} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>

                <div style={{
                  background: colors.card,
                  borderRadius: '14px',
                  padding: '14px 16px',
                  fontSize: '12px',
                  color: colors.textDim,
                  lineHeight: '1.6',
                  marginTop: '8px',
                }}>
                  💡 サマリーの+/-は、一番古い記録からの変化量です。
                </div>
              </>
            )
          )}

          {/* 種目別タブ */}
          {graphTab === 'exercise' && (
          exerciseList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.textDim }}>
              <BarChart3 size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
              <div style={{ fontSize: '14px' }}>まだ種目の記録がありません</div>
              <div style={{ fontSize: '12px', marginTop: '6px' }}>記録するとここにグラフが表示されます</div>
            </div>
          ) : (
            <>
              {/* 種目選択タブ */}
              <div style={{
                fontSize: '11px',
                color: colors.textDim,
                letterSpacing: '2px',
                fontWeight: '700',
                marginBottom: '10px',
              }}>種目を選ぶ</div>
              <div style={{
                display: 'flex',
                gap: '6px',
                overflowX: 'auto',
                paddingBottom: '8px',
                marginBottom: '20px',
                scrollbarWidth: 'none',
              }}>
                {exerciseList.map(ex => (
                  <button
                    key={ex.name}
                    onClick={() => setSelectedExercise(ex.name)}
                    style={{
                      background: selectedExercise === ex.name ? colors.accent : colors.card,
                      color: selectedExercise === ex.name ? '#000' : colors.text,
                      border: `1px solid ${selectedExercise === ex.name ? colors.accent : colors.border}`,
                      borderRadius: '12px',
                      padding: '10px 16px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {ex.name}
                    <span style={{
                      marginLeft: '6px',
                      fontSize: '10px',
                      opacity: 0.6,
                    }}>×{ex.count}</span>
                  </button>
                ))}
              </div>

              {selectedExercise && chartData.length > 0 && (
                <>
                  {/* サマリー */}
                  <div style={{
                    background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
                    borderRadius: '20px',
                    padding: '20px',
                    marginBottom: '20px',
                    color: '#000',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '2px', marginBottom: '4px' }}>
                      {selectedExercise.toUpperCase()}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '12px' }}>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: '700', opacity: 0.7 }}>過去最高</div>
                        <div style={{ fontSize: '22px', fontWeight: '800' }}>
                          {Math.max(...chartData.map(d => d.最大重量))}
                          <span style={{ fontSize: '12px', marginLeft: '2px' }}>kg</span>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: '700', opacity: 0.7 }}>記録回数</div>
                        <div style={{ fontSize: '22px', fontWeight: '800' }}>
                          {chartData.length}
                          <span style={{ fontSize: '12px', marginLeft: '2px' }}>回</span>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: '700', opacity: 0.7 }}>直近</div>
                        <div style={{ fontSize: '22px', fontWeight: '800' }}>
                          {chartData[chartData.length - 1].最大重量}
                          <span style={{ fontSize: '12px', marginLeft: '2px' }}>kg</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 最大重量の推移 */}
                  <ChartCard title="最大重量の推移" unit="kg" colors={colors}>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                        <XAxis dataKey="date" stroke={colors.textDim} fontSize={10} />
                        <YAxis stroke={colors.textDim} fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            background: colors.cardLight,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '10px',
                            fontSize: '12px',
                          }}
                          labelStyle={{ color: colors.text }}
                        />
                        <Line
                          type="monotone"
                          dataKey="最大重量"
                          stroke={colors.accent}
                          strokeWidth={3}
                          dot={{ fill: colors.accent, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  {/* ボリューム(総挙上量) */}
                  <ChartCard title="ボリューム (重さ×回数の合計)" unit="kg" colors={colors}>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                        <XAxis dataKey="date" stroke={colors.textDim} fontSize={10} />
                        <YAxis stroke={colors.textDim} fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            background: colors.cardLight,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '10px',
                            fontSize: '12px',
                          }}
                          labelStyle={{ color: colors.text }}
                        />
                        <Line
                          type="monotone"
                          dataKey="ボリューム"
                          stroke="#7dd3fc"
                          strokeWidth={3}
                          dot={{ fill: '#7dd3fc', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  {/* 合計回数 */}
                  <ChartCard title="合計回数の推移" unit="回" colors={colors}>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                        <XAxis dataKey="date" stroke={colors.textDim} fontSize={10} />
                        <YAxis stroke={colors.textDim} fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            background: colors.cardLight,
                            border: `1px solid ${colors.border}`,
                            borderRadius: '10px',
                            fontSize: '12px',
                          }}
                          labelStyle={{ color: colors.text }}
                        />
                        <Line
                          type="monotone"
                          dataKey="合計回数"
                          stroke="#fbbf24"
                          strokeWidth={3}
                          dot={{ fill: '#fbbf24', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartCard>

                  <div style={{
                    background: colors.card,
                    borderRadius: '14px',
                    padding: '14px 16px',
                    fontSize: '12px',
                    color: colors.textDim,
                    lineHeight: '1.6',
                    marginTop: '8px',
                  }}>
                    💡 <strong style={{ color: colors.text }}>ボリューム</strong>は、そのトレーニング全体の運動量。<br/>
                    重さ × 回数を全セット合計したもので、筋肥大の目安になります。
                  </div>
                </>
              )}

              {selectedExercise && chartData.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: colors.textDim, fontSize: '13px' }}>
                  この種目はまだ重さや回数が入力されていません
                </div>
              )}
            </>
          )
          )}
        </div>
      )}

      {/* 目標画面 */}
      {view === 'goal' && (
        <div style={{ padding: '20px' }}>
          <div style={{
            background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '20px',
            color: '#000',
          }}>
            <Flame size={28} style={{ marginBottom: '10px' }} />
            <div style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '1px', marginBottom: '4px' }}>YOUR MISSION</div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>目標を書いておくと、いつでも振り返れます</div>
          </div>

          <Section label="あなたの目標" colors={colors}>
            <textarea
              value={goal}
              onChange={e => saveGoal(e.target.value)}
              placeholder="例: 3ヶ月でベンチプレス80kg、体重65kgキープ"
              rows={6}
              style={{ ...inputStyle(colors), resize: 'vertical', fontFamily: 'inherit', fontSize: '15px' }}
            />
          </Section>

          <div style={{
            background: colors.card,
            borderRadius: '14px',
            padding: '14px 16px',
            fontSize: '12px',
            color: colors.textDim,
            lineHeight: '1.6',
          }}>
            💡 入力した内容は自動で保存されます。
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, unit, colors }) {
  return (
    <div style={{
      background: colors.card,
      borderRadius: '14px',
      padding: '12px 10px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '10px', color: colors.textDim, letterSpacing: '1px', fontWeight: '700', marginBottom: '4px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '2px' }}>
        <div style={{ fontSize: '22px', fontWeight: '800', color: colors.accent }}>{value}</div>
        <div style={{ fontSize: '11px', color: colors.textDim }}>{unit}</div>
      </div>
    </div>
  );
}

function Section({ label, children, colors }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{
        fontSize: '11px',
        color: colors.textDim,
        letterSpacing: '2px',
        fontWeight: '700',
        marginBottom: '8px',
      }}>{label}</div>
      {children}
    </div>
  );
}

function inputStyle(colors) {
  return {
    width: '100%',
    background: colors.card,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '12px 14px',
    fontSize: '15px',
    color: colors.text,
    outline: 'none',
    boxSizing: 'border-box',
  };
}

function smallInputStyle(colors) {
  return {
    flex: 1,
    background: colors.cardLight,
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    padding: '8px 10px',
    fontSize: '14px',
    color: colors.text,
    outline: 'none',
    minWidth: 0,
    width: '60px',
  };
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getMonth() + 1}/${d.getDate()} (${days[d.getDay()]})`;
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function ChartCard({ title, unit, children, colors }) {
  return (
    <div style={{
      background: colors.card,
      borderRadius: '16px',
      padding: '16px 12px 12px',
      marginBottom: '12px',
    }}>
      <div style={{
        fontSize: '12px',
        fontWeight: '700',
        color: colors.text,
        marginBottom: '8px',
        paddingLeft: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <TrendingUp size={14} color={colors.accent} />
        {title}
        <span style={{ fontSize: '10px', color: colors.textDim, fontWeight: '500' }}>({unit})</span>
      </div>
      {children}
    </div>
  );
}

function BodyStat({ label, value, unit, diff }) {
  return (
    <div>
      <div style={{ fontSize: '10px', fontWeight: '700', opacity: 0.7 }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: '800', lineHeight: '1.1', marginTop: '2px' }}>
        {value != null ? value : '—'}
        {value != null && <span style={{ fontSize: '11px', marginLeft: '2px' }}>{unit}</span>}
      </div>
      {diff != null && (
        <div style={{
          fontSize: '10px',
          fontWeight: '700',
          marginTop: '2px',
          opacity: 0.75,
        }}>
          {diff}{unit}
        </div>
      )}
    </div>
  );
}
