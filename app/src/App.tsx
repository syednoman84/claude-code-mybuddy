import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Settings, Send, Square, Trash2, ChevronDown } from 'lucide-react';
import { Message, DEFAULT_MODELS } from './types';
import { useConfig } from './useConfig';
import { useChats } from './useChats';
import { streamChat } from './api';
import { SettingsModal } from './SettingsModal';
import { MessageBubble } from './MessageBubble';
import { Sidebar } from './Sidebar';
import './App.css';

export default function App() {
  const { config, setConfig } = useConfig();
  const {
    chats, projects, activeChatId, unassignedChats, chatsInProject,
    createChat, setActiveChat, updateChatMessages, deleteChat,
    renameChat, moveChatToProject, createProject, renameProject, deleteProject,
  } = useChats();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('litellm-sidebar-collapsed') === 'true'
  );

  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<Message[]>(messages);
  // Prevents the activeChatId sync effect from wiping messages during an active send
  const skipSyncRef = useRef(false);
  // Tracks which project a pending new chat should be created in (null = unassigned)
  const pendingProjectIdRef = useRef<string | null>(null);

  // Sync local messages from the active chat (skipped during streaming to avoid clobbering in-flight messages)
  useEffect(() => {
    if (skipSyncRef.current) return;
    const chat = chats.find((c) => c.id === activeChatId);
    const loaded = chat?.messages ?? [];
    setMessages(loaded);
    messagesRef.current = loaded;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatId]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('litellm-sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const adjustTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 240) + 'px';
  };

  const handleStop = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  const [pendingNewChat, setPendingNewChat] = useState(false);

  const onNewChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setInput('');
    setPendingNewChat(true);
    pendingProjectIdRef.current = null;
    setActiveChat('');
  }, [setActiveChat]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    setError(null);

    // Determine which chat to write to
    let chatId = activeChatId;
    if (!chatId || pendingNewChat) {
      // Block the sync effect before createChat changes activeChatId,
      // so it doesn't reset messagesRef to [] mid-send
      skipSyncRef.current = true;
      chatId = createChat(pendingProjectIdRef.current);
      pendingProjectIdRef.current = null;
      setPendingNewChat(false);
    }

    const userMsg: Message = {
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    const assistantId = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    const nextMessages = [...messagesRef.current, userMsg, assistantMsg];
    setMessages(nextMessages);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const history = [...messagesRef.current, userMsg];

    try {
      for await (const chunk of streamChat(history, config, controller.signal)) {
        setMessages((prev) => {
          const updated = prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m
          );
          messagesRef.current = updated;
          return updated;
        });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Unknown error');
        setMessages((prev) => {
          const updated = prev.filter((m) => m.id !== assistantId);
          messagesRef.current = updated;
          return updated;
        });
      }
    } finally {
      setStreaming(false);
      skipSyncRef.current = false;
      // Persist to store only once, after stream ends
      if (chatId) updateChatMessages(chatId, messagesRef.current);
    }
  }, [input, streaming, activeChatId, pendingNewChat, config, createChat, updateChatMessages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const modelLabel = DEFAULT_MODELS.find((m) => m.id === config.model)?.label ?? config.model;
  const hasMessages = messages.length > 0;
  const currentChatId = pendingNewChat ? null : activeChatId;

  return (
    <div className="app">
      <Sidebar
        chats={chats}
        projects={projects}
        activeChatId={currentChatId}
        collapsed={sidebarCollapsed}
        unassignedChats={unassignedChats}
        chatsInProject={chatsInProject}
        onNewChat={onNewChat}
        onNewChatInProject={(projectId) => {
          setMessages([]);
          setError(null);
          setInput('');
          setPendingNewChat(true);
          pendingProjectIdRef.current = projectId;
          setActiveChat('');
        }}
        onSelectChat={(id) => { setActiveChat(id); setPendingNewChat(false); setError(null); }}
        onDeleteChat={deleteChat}
        onRenameChat={renameChat}
        onMoveChatToProject={moveChatToProject}
        onCreateProject={createProject}
        onRenameProject={renameProject}
        onDeleteProject={deleteProject}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />

      <div className="chat-main">
        <header className="header">
          <div className="header-left">
            <div className="model-picker">
              <button className="model-btn" onClick={() => setShowModelMenu((v) => !v)}>
                {modelLabel}
                <ChevronDown size={14} />
              </button>
              {showModelMenu && (
                <div className="model-menu">
                  {DEFAULT_MODELS.map((m) => (
                    <button
                      key={m.id}
                      className={`model-option ${config.model === m.id ? 'active' : ''}`}
                      onClick={() => { setConfig({ ...config, model: m.id }); setShowModelMenu(false); }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="header-right">
            {hasMessages && currentChatId && (
              <button className="icon-btn" title="Delete chat" onClick={() => { deleteChat(currentChatId); onNewChat(); }}>
                <Trash2 size={18} />
              </button>
            )}
            <button className="icon-btn" title="Settings" onClick={() => setShowSettings(true)}>
              <Settings size={18} />
            </button>
          </div>
        </header>

        <main className="messages">
          {messages.length === 0 && (
            <div className="empty-state">
              <div className="empty-logo">M</div>
              <h2>How can I help you?</h2>
              <p>Connected to <strong>{config.baseUrl || 'not configured'}</strong></p>
              <p className="empty-model">Model: <strong>{modelLabel}</strong></p>
            </div>
          )}
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {error && (
            <div className="error-banner">
              <strong>Error:</strong> {error}
            </div>
          )}
          <div ref={bottomRef} />
        </main>

        <div className="input-area">
          <div className="input-box">
            <textarea
              ref={textareaRef}
              className="input-textarea"
              placeholder="Message MyBuddy… (Enter to send, Shift+Enter for newline)"
              value={input}
              onChange={(e) => { setInput(e.target.value); adjustTextarea(); }}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={streaming}
            />
            <button
              className={`send-btn ${streaming ? 'stop' : ''}`}
              onClick={streaming ? handleStop : sendMessage}
              disabled={!streaming && !input.trim()}
              title={streaming ? 'Stop' : 'Send'}
            >
              {streaming ? <Square size={18} fill="currentColor" /> : <Send size={18} />}
            </button>
          </div>
          <p className="input-hint">Model: {config.model}</p>
        </div>
      </div>

      {showSettings && (
        <SettingsModal config={config} onSave={setConfig} onClose={() => setShowSettings(false)} />
      )}
      {showModelMenu && (
        <div className="backdrop" onClick={() => setShowModelMenu(false)} />
      )}
    </div>
  );
}
