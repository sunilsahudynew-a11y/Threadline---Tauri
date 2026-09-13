import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Star,
  ChevronDown,
  Sparkles,
  X,
  Filter,
  Check
} from 'lucide-react';
import { SidebarTodoItem, SidebarTodoCategory } from '../types';

interface SidebarTodoListProps {
  projectId: string;
  projectTitle?: string;
  isScreenplay?: boolean;
}

const DEFAULT_NOVEL_TODOS: Omit<SidebarTodoItem, 'id' | 'createdAt'>[] = [
  { text: 'Hook reader in first chapter opening', category: 'writing', priority: 'high', completed: true },
  { text: 'Verify protagonist flaw and arc in Act 1', category: 'character', priority: 'high', completed: false },
  { text: 'Audit timeline continuity in Diagnostics', category: 'revision', priority: 'normal', completed: false },
  { text: 'Flesh out Worldbuilding / Story Bible entries', category: 'worldbuilding', priority: 'normal', completed: false },
  { text: 'Polish sensory details & reduce filter words', category: 'revision', priority: 'normal', completed: false }
];

const DEFAULT_SCREENPLAY_TODOS: Omit<SidebarTodoItem, 'id' | 'createdAt'>[] = [
  { text: 'Check sluglines for INT./EXT. standard prefixes', category: 'revision', priority: 'high', completed: true },
  { text: 'Tighten action paragraphs to under 5 lines', category: 'writing', priority: 'normal', completed: false },
  { text: 'Audit monologue lengths in Diagnostics', category: 'revision', priority: 'high', completed: false },
  { text: 'Review dialogue distribution across main cast', category: 'character', priority: 'normal', completed: false },
  { text: 'Refine Act II midpoint plot reversal beat', category: 'writing', priority: 'normal', completed: false }
];

export const SidebarTodoList: React.FC<SidebarTodoListProps> = ({
  projectId,
  projectTitle = 'Manuscript',
  isScreenplay = false
}) => {
  const storageKey = `threadline_todos_${projectId || 'default'}`;

  // Collapsed state: default expanded
  const [isOpen, setIsOpen] = useState(true);
  const [todos, setTodos] = useState<SidebarTodoItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    const defaults = isScreenplay ? DEFAULT_SCREENPLAY_TODOS : DEFAULT_NOVEL_TODOS;
    return defaults.map((item, index) => ({
      ...item,
      id: `default-${index}-${Date.now()}`,
      projectId,
      createdAt: Date.now() - index * 1000
    }));
  });

  // Track project changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setTodos(JSON.parse(saved));
      } else {
        const defaults = isScreenplay ? DEFAULT_SCREENPLAY_TODOS : DEFAULT_NOVEL_TODOS;
        const initial = defaults.map((item, index) => ({
          ...item,
          id: `default-${index}-${Date.now()}`,
          projectId,
          createdAt: Date.now() - index * 1000
        }));
        setTodos(initial);
        localStorage.setItem(storageKey, JSON.stringify(initial));
      }
    } catch {
      // ignore
    }
  }, [storageKey, projectId, isScreenplay]);

  // Save changes to localStorage
  const saveTodos = (newTodos: SidebarTodoItem[]) => {
    setTodos(newTodos);
    try {
      localStorage.setItem(storageKey, JSON.stringify(newTodos));
    } catch {
      // ignore
    }
  };

  // UI Filters: 'all' | 'active' | 'completed'
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'completed'>('all');
  const [filterCategory, setFilterCategory] = useState<SidebarTodoCategory | 'all'>('all');

  // Input states
  const [inputText, setInputText] = useState('');
  const [inputCategory, setInputCategory] = useState<SidebarTodoCategory>('writing');
  const [inputPriority, setInputPriority] = useState<'normal' | 'high'>('normal');
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Statistics
  const totalCount = todos.length;
  const completedCount = useMemo(() => todos.filter((t) => t.completed).length, [todos]);
  const activeCount = totalCount - completedCount;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered todos
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      if (filterMode === 'active' && todo.completed) return false;
      if (filterMode === 'completed' && !todo.completed) return false;
      if (filterCategory !== 'all' && todo.category !== filterCategory) return false;
      return true;
    });
  }, [todos, filterMode, filterCategory]);

  const handleToggleTodo = (id: string) => {
    const updated = todos.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTodos(updated);
  };

  const handleTogglePriority = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = todos.map((t) =>
      t.id === id
        ? { ...t, priority: (t.priority === 'high' ? 'normal' : 'high') as 'normal' | 'high' }
        : t
    );
    saveTodos(updated);
  };

  const handleDeleteTodo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = todos.filter((t) => t.id !== id);
    saveTodos(updated);
  };

  const handleClearCompleted = () => {
    const updated = todos.filter((t) => !t.completed);
    saveTodos(updated);
  };

  const handleAddTodo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const newTodo: SidebarTodoItem = {
      id: `todo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      projectId,
      text: trimmed,
      completed: false,
      category: inputCategory,
      priority: inputPriority,
      createdAt: Date.now()
    };

    saveTodos([newTodo, ...todos]);
    setInputText('');
    setInputPriority('normal');
  };

  const handleLoadDefaults = () => {
    const defaults = isScreenplay ? DEFAULT_SCREENPLAY_TODOS : DEFAULT_NOVEL_TODOS;
    const generated = defaults.map((item, index) => ({
      ...item,
      id: `task-${Date.now()}-${index}`,
      projectId,
      createdAt: Date.now() - index * 1000
    }));
    saveTodos([...todos, ...generated]);
  };

  const getCategoryBadgeClass = (category?: SidebarTodoCategory) => {
    switch (category) {
      case 'writing':
        return 'text-[#35505F] bg-[#35505F]/10 border-[#35505F]/20';
      case 'revision':
        return 'text-[#B54B32] bg-[#B54B32]/10 border-[#B54B32]/20';
      case 'character':
        return 'text-[#7D4F28] bg-[#7D4F28]/10 border-[#7D4F28]/20';
      case 'worldbuilding':
        return 'text-[#4A5D3F] bg-[#4A5D3F]/10 border-[#4A5D3F]/20';
      default:
        return 'text-[#7A705F] bg-[#EDE6D7] border-[rgba(34,30,24,0.08)]';
    }
  };

  return (
    <div className="border-t border-[rgba(34,30,24,0.08)] pt-2.5">
      {/* SECTION HEADER */}
      <div className="px-2 pb-1.5 flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#9E9484] hover:text-[#221E18] transition-colors cursor-pointer group text-left"
          title={isOpen ? 'Collapse To-Do List' : 'Expand To-Do List'}
        >
          <ChevronDown
            size={12}
            className={`transition-transform duration-150 text-[#7A705F] group-hover:text-[#221E18] ${
              isOpen ? '' : '-rotate-90'
            }`}
          />
          <span className="flex items-center gap-1.5">
            <CheckSquare size={11} className="text-[#B54B32]" />
            <span>To-Do List</span>
          </span>
        </button>

        <div className="flex items-center gap-1">
          {totalCount > 0 && (
            <span
              className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                completedCount === totalCount
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-[rgba(34,30,24,0.06)] text-[#7A705F]'
              }`}
              title={`${completedCount} of ${totalCount} completed (${progressPct}%)`}
            >
              {completedCount}/{totalCount}
            </span>
          )}

          <button
            onClick={() => {
              if (!isOpen) setIsOpen(true);
              setIsAdding((prev) => !prev);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className="p-1 rounded hover:bg-[#ECE5D6] text-[#7A705F] hover:text-[#221E18] transition-colors cursor-pointer"
            title="Add task"
            aria-label="Add task"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* EXPANDABLE BODY */}
      {isOpen && (
        <div className="space-y-2 px-1">
          {/* Progress Bar (if items exist) */}
          {totalCount > 0 && (
            <div className="px-1.5">
              <div className="h-1 w-full bg-[rgba(34,30,24,0.08)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#B54B32] rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Inline Add Task Form */}
          {isAdding && (
            <form
              onSubmit={handleAddTodo}
              className="p-2 rounded-[6px] bg-[#FAF6EE] border border-[#B54B32]/40 shadow-warm-xs space-y-1.5 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center gap-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="New task... (Enter to save)"
                  className="flex-1 bg-transparent text-xs text-[#221E18] placeholder-[#9E9484] focus:outline-none py-0.5"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() =>
                    setInputPriority((prev) => (prev === 'high' ? 'normal' : 'high'))
                  }
                  className={`p-1 rounded transition-colors cursor-pointer ${
                    inputPriority === 'high'
                      ? 'text-amber-600 bg-amber-50'
                      : 'text-[#9E9484] hover:text-[#7A705F]'
                  }`}
                  title={inputPriority === 'high' ? 'High Priority' : 'Normal Priority'}
                >
                  <Star size={12} className={inputPriority === 'high' ? 'fill-amber-500' : ''} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="p-1 text-[#9E9484] hover:text-[#221E18] cursor-pointer"
                  title="Cancel"
                >
                  <X size={12} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[rgba(34,30,24,0.06)] text-[10px]">
                <div className="flex items-center gap-1">
                  {(['writing', 'revision', 'character', 'general'] as SidebarTodoCategory[]).map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setInputCategory(cat)}
                        className={`px-1.5 py-0.5 rounded capitalize transition-colors cursor-pointer ${
                          inputCategory === cat
                            ? 'bg-[#221E18] text-white font-medium'
                            : 'bg-[#EDE6D7] text-[#7A705F] hover:text-[#221E18]'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="px-2 py-0.5 rounded bg-[#B54B32] text-white font-semibold disabled:opacity-40 hover:bg-[#A14028] transition-colors cursor-pointer shrink-0"
                >
                  Add
                </button>
              </div>
            </form>
          )}

          {/* Filters Bar (When tasks exist) */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between px-1 text-[10px] text-[#7A705F]">
              <div className="flex items-center gap-1">
                {(['all', 'active', 'completed'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setFilterMode(mode)}
                    className={`px-1.5 py-0.5 rounded capitalize transition-colors cursor-pointer ${
                      filterMode === mode
                        ? 'bg-[#EAE2D1] text-[#221E18] font-semibold'
                        : 'text-[#7A705F] hover:text-[#221E18]'
                    }`}
                  >
                    {mode === 'all'
                      ? `All (${totalCount})`
                      : mode === 'active'
                        ? `Open (${activeCount})`
                        : `Done (${completedCount})`}
                  </button>
                ))}
              </div>

              {completedCount > 0 && (
                <button
                  onClick={handleClearCompleted}
                  className="text-[9px] text-[#7A705F] hover:text-[#B54B32] transition-colors cursor-pointer"
                  title="Clear all completed items"
                >
                  Clear Done
                </button>
              )}
            </div>
          )}

          {/* Tasks List */}
          <div className="space-y-1 max-h-56 overflow-y-auto no-scrollbar pr-0.5">
            {filteredTodos.length === 0 ? (
              <div className="py-4 px-2 text-center text-xs text-[#9E9484] rounded border border-dashed border-[rgba(34,30,24,0.12)]">
                {totalCount === 0 ? (
                  <div className="space-y-2">
                    <p className="text-[11px] text-[#7A705F]">No tasks on your writing checklist</p>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => {
                          setIsAdding(true);
                          setTimeout(() => inputRef.current?.focus(), 50);
                        }}
                        className="w-full py-1 px-2 rounded bg-[#FAF6EE] hover:bg-[#F2ECE0] text-[#221E18] text-[11px] font-semibold border border-[rgba(34,30,24,0.12)] flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} className="text-[#B54B32]" />
                        <span>Add First Task</span>
                      </button>
                      <button
                        onClick={handleLoadDefaults}
                        className="text-[10px] text-[#B54B32] hover:underline flex items-center justify-center gap-1 cursor-pointer py-0.5"
                      >
                        <Sparkles size={11} />
                        <span>Load Writing Checklist</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px]">No {filterMode} tasks</p>
                )}
              </div>
            ) : (
              filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  onClick={() => handleToggleTodo(todo.id)}
                  className={`group px-2 py-1.5 rounded-[5px] text-xs flex items-start justify-between gap-1.5 transition-colors cursor-pointer ${
                    todo.completed
                      ? 'bg-[rgba(34,30,24,0.03)] text-[#9E9484]'
                      : 'bg-[#FAF6EE]/80 hover:bg-[#F1EAD9] text-[#221E18] border border-[rgba(34,30,24,0.06)]'
                  }`}
                >
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleTodo(todo.id);
                      }}
                      className="mt-0.5 text-[#7A705F] hover:text-[#B54B32] transition-colors cursor-pointer shrink-0"
                      aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {todo.completed ? (
                        <CheckSquare size={13} className="text-[#B54B32]" />
                      ) : (
                        <Square size={13} className="text-[#9E9484] group-hover:text-[#221E18]" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1 leading-snug">
                      <span
                        className={`text-[11px] break-words ${
                          todo.completed ? 'line-through text-[#9E9484]' : 'text-[#221E18]'
                        }`}
                      >
                        {todo.text}
                      </span>

                      <div className="flex items-center gap-1 mt-0.5">
                        {todo.category && (
                          <span
                            className={`text-[8px] font-mono px-1 py-0.2 rounded border uppercase ${getCategoryBadgeClass(
                              todo.category
                            )}`}
                          >
                            {todo.category}
                          </span>
                        )}
                        {todo.priority === 'high' && (
                          <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                            High
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions on hover */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleTogglePriority(todo.id, e)}
                      className={`p-1 rounded hover:bg-[rgba(34,30,24,0.08)] cursor-pointer ${
                        todo.priority === 'high' ? 'text-amber-600' : 'text-[#9E9484]'
                      }`}
                      title={todo.priority === 'high' ? 'High Priority' : 'Normal Priority'}
                    >
                      <Star
                        size={11}
                        className={todo.priority === 'high' ? 'fill-amber-500' : ''}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteTodo(todo.id, e)}
                      className="p-1 rounded hover:bg-rose-100 text-[#9E9484] hover:text-rose-700 transition-colors cursor-pointer"
                      title="Delete task"
                      aria-label="Delete task"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Quick Add Trigger when not currently in add mode */}
          {!isAdding && totalCount > 0 && (
            <button
              onClick={() => {
                setIsAdding(true);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              className="w-full py-1 px-2 rounded text-[11px] text-[#7A705F] hover:text-[#221E18] hover:bg-[#ECE5D6] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={12} className="text-[#B54B32]" />
              <span>Add task...</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
