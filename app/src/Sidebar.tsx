import React, { useState, useEffect, useRef } from 'react';
import {
  PanelLeft, Plus, ChevronRight, ChevronDown,
  Trash2, Pencil, FolderPlus, MessageSquare, Folder,
} from 'lucide-react';
import { Chat, Project } from './types';

interface ContextMenuState {
  type: 'chat' | 'project';
  targetId: string;
  x: number;
  y: number;
}

interface SidebarProps {
  chats: Chat[];
  projects: Project[];
  activeChatId: string | null;
  collapsed: boolean;
  unassignedChats: Chat[];
  chatsInProject: (id: string) => Chat[];
  onNewChat: () => void;
  onNewChatInProject: (projectId: string) => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, title: string) => void;
  onMoveChatToProject: (chatId: string, projectId: string | null) => void;
  onCreateProject: (name: string) => void;
  onRenameProject: (id: string, name: string) => void;
  onDeleteProject: (id: string) => void;
  onToggleCollapse: () => void;
}

// ── ContextMenu ────────────────────────────────────────────────
interface ContextMenuProps {
  menu: ContextMenuState;
  projects: Project[];
  chat?: Chat;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
  onMoveToProject?: (projectId: string | null) => void;
}

function ContextMenu({ menu, projects, chat, onClose, onRename, onDelete, onMoveToProject }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="context-menu"
      style={{ top: menu.y, left: menu.x }}
    >
      <button className="context-menu-item" onClick={() => { onRename(); onClose(); }}>
        <Pencil size={13} style={{ marginRight: 8 }} />Rename
      </button>
      {menu.type === 'chat' && onMoveToProject && (
        <>
          <div className="context-menu-separator" />
          {chat?.projectId !== null && (
            <button className="context-menu-item" onClick={() => { onMoveToProject(null); onClose(); }}>
              <FolderPlus size={13} style={{ marginRight: 8 }} />Remove from project
            </button>
          )}
          {projects.map((p) => (
            p.id !== chat?.projectId && (
              <button key={p.id} className="context-menu-item" onClick={() => { onMoveToProject(p.id); onClose(); }}>
                <Folder size={13} style={{ marginRight: 8 }} />Move to "{p.name}"
              </button>
            )
          ))}
        </>
      )}
      <div className="context-menu-separator" />
      <button className="context-menu-item danger" onClick={() => { onDelete(); onClose(); }}>
        <Trash2 size={13} style={{ marginRight: 8 }} />Delete
      </button>
    </div>
  );
}

// ── ChatItem ───────────────────────────────────────────────────
interface ChatItemProps {
  chat: Chat;
  active: boolean;
  editing: boolean;
  indent?: boolean;
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onCommitRename: (title: string) => void;
  onCancelRename: () => void;
  onDelete: () => void;
}

function ChatItem({ chat, active, editing, indent, onSelect, onContextMenu, onCommitRename, onCancelRename, onDelete }: ChatItemProps) {
  const [draft, setDraft] = useState(chat.title || 'New Chat');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(chat.title || 'New Chat');
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [editing, chat.title]);

  return (
    <div
      className={`sidebar-chat-item${active ? ' active' : ''}${indent ? ' indented' : ''}`}
      onClick={editing ? undefined : onSelect}
      onContextMenu={(e) => { e.preventDefault(); onContextMenu(e); }}
      onDoubleClick={() => { if (!editing) onContextMenu({ preventDefault: () => {}, clientX: 0, clientY: 0 } as any); }}
    >
      <MessageSquare size={13} style={{ flexShrink: 0, opacity: 0.6 }} />
      {editing ? (
        <input
          ref={inputRef}
          className="sidebar-rename-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCommitRename(draft.trim() || 'New Chat');
            if (e.key === 'Escape') onCancelRename();
          }}
          onBlur={() => onCommitRename(draft.trim() || 'New Chat')}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="sidebar-chat-title">{chat.title || 'New Chat'}</span>
      )}
      {!editing && (
        <div className="item-actions">
          <button
            className="item-action-btn"
            title="Delete"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── ProjectGroup ───────────────────────────────────────────────
interface ProjectGroupProps {
  project: Project;
  chats: Chat[];
  activeChatId: string | null;
  expanded: boolean;
  editingProjectId: string | null;
  editingChatId: string | null;
  allProjects: Project[];
  onToggleExpand: () => void;
  onNewChatInProject: () => void;
  onSelectChat: (id: string) => void;
  onContextMenuProject: (e: React.MouseEvent) => void;
  onContextMenuChat: (chatId: string, e: React.MouseEvent) => void;
  onCommitRenameProject: (name: string) => void;
  onCancelRenameProject: () => void;
  onCommitRenameChat: (chatId: string, title: string) => void;
  onCancelRenameChat: () => void;
  onDeleteChat: (id: string) => void;
}

function ProjectGroup({
  project, chats, activeChatId, expanded,
  editingProjectId, editingChatId, allProjects,
  onToggleExpand, onNewChatInProject, onSelectChat, onContextMenuProject, onContextMenuChat,
  onCommitRenameProject, onCancelRenameProject,
  onCommitRenameChat, onCancelRenameChat, onDeleteChat,
}: ProjectGroupProps) {
  const [draft, setDraft] = useState(project.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const isEditingProject = editingProjectId === project.id;

  useEffect(() => {
    if (isEditingProject) {
      setDraft(project.name);
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [isEditingProject, project.name]);

  return (
    <div className="sidebar-project-group">
      <div
        className="sidebar-project-header"
        onClick={isEditingProject ? undefined : onToggleExpand}
        onContextMenu={(e) => { e.preventDefault(); onContextMenuProject(e); }}
      >
        <Folder size={13} style={{ flexShrink: 0, opacity: 0.7 }} />
        {isEditingProject ? (
          <input
            ref={inputRef}
            className="sidebar-rename-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onCommitRenameProject(draft.trim() || project.name);
              if (e.key === 'Escape') onCancelRenameProject();
            }}
            onBlur={() => onCommitRenameProject(draft.trim() || project.name)}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="sidebar-project-name">{project.name}</span>
        )}
        {!isEditingProject && (
          <>
            {expanded
              ? <ChevronDown size={13} style={{ marginLeft: 'auto', flexShrink: 0 }} />
              : <ChevronRight size={13} style={{ marginLeft: 'auto', flexShrink: 0 }} />
            }
            <button
              className="project-new-chat-btn"
              title="New chat in project"
              onClick={(e) => { e.stopPropagation(); onNewChatInProject(); }}
            >
              <Plus size={13} />
            </button>
          </>
        )}
      </div>
      {expanded && (
        <div className="sidebar-project-chats">
          {chats.length === 0 && (
            <div className="sidebar-empty-project">No chats yet</div>
          )}
          {chats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              active={chat.id === activeChatId}
              editing={editingChatId === chat.id}
              indent
              onSelect={() => onSelectChat(chat.id)}
              onContextMenu={(e) => onContextMenuChat(chat.id, e)}
              onCommitRename={(title) => onCommitRenameChat(chat.id, title)}
              onCancelRename={onCancelRenameChat}
              onDelete={() => onDeleteChat(chat.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────
export function Sidebar({
  chats, projects, activeChatId, collapsed,
  unassignedChats, chatsInProject,
  onNewChat, onNewChatInProject, onSelectChat, onDeleteChat, onRenameChat,
  onMoveChatToProject, onCreateProject, onRenameProject, onDeleteProject,
  onToggleCollapse,
}: SidebarProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(
    () => new Set(projects.map((p) => p.id))
  );
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const newProjectInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showNewProjectInput) setTimeout(() => newProjectInputRef.current?.focus(), 0);
  }, [showNewProjectInput]);

  const openContextMenu = (type: 'chat' | 'project', targetId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ type, targetId, x: e.clientX, y: e.clientY });
  };

  const toggleProject = (id: string) => {
    setExpandedProjectIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const commitNewProject = () => {
    const name = newProjectName.trim();
    if (name) {
      const id = onCreateProject(name) as any;
      setExpandedProjectIds((prev) => new Set(Array.from(prev).concat(id)));
    }
    setNewProjectName('');
    setShowNewProjectInput(false);
  };

  const contextChat = contextMenu?.type === 'chat'
    ? chats.find((c) => c.id === contextMenu.targetId)
    : undefined;

  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="icon-btn" title="Toggle sidebar" onClick={onToggleCollapse}>
          <PanelLeft size={18} />
        </button>
        {!collapsed && (
          <>
            <span className="sidebar-title">MyBuddy</span>
            <button className="sidebar-new-btn" onClick={onNewChat} title="New chat">
              <Plus size={14} />
            </button>
          </>
        )}
      </div>

      {!collapsed && (
        <nav className="sidebar-nav">
          {/* Projects */}
          {projects.length > 0 && (
            <div className="sidebar-section-label">Projects</div>
          )}
          {projects.map((project) => (
            <ProjectGroup
              key={project.id}
              project={project}
              chats={chatsInProject(project.id)}
              activeChatId={activeChatId}
              expanded={expandedProjectIds.has(project.id)}
              editingProjectId={editingProjectId}
              editingChatId={editingChatId}
              allProjects={projects}
              onToggleExpand={() => toggleProject(project.id)}
              onNewChatInProject={() => onNewChatInProject(project.id)}
              onSelectChat={onSelectChat}
              onContextMenuProject={(e) => openContextMenu('project', project.id, e)}
              onContextMenuChat={(chatId, e) => openContextMenu('chat', chatId, e)}
              onCommitRenameProject={(name) => { onRenameProject(project.id, name); setEditingProjectId(null); }}
              onCancelRenameProject={() => setEditingProjectId(null)}
              onCommitRenameChat={(chatId, title) => { onRenameChat(chatId, title); setEditingChatId(null); }}
              onCancelRenameChat={() => setEditingChatId(null)}
              onDeleteChat={onDeleteChat}
            />
          ))}

          {/* New project input / button */}
          <div className="sidebar-new-project-row">
            {showNewProjectInput ? (
              <input
                ref={newProjectInputRef}
                className="sidebar-new-project-input"
                placeholder="Project name…"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitNewProject();
                  if (e.key === 'Escape') { setShowNewProjectInput(false); setNewProjectName(''); }
                }}
                onBlur={commitNewProject}
              />
            ) : (
              <button className="sidebar-add-project-btn" onClick={() => setShowNewProjectInput(true)}>
                <FolderPlus size={13} />
                <span>New Project</span>
              </button>
            )}
          </div>

          {/* Unassigned chats */}
          {unassignedChats.length > 0 && (
            <div className="sidebar-section-label">Chats</div>
          )}
          {unassignedChats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              active={chat.id === activeChatId}
              editing={editingChatId === chat.id}
              onSelect={() => onSelectChat(chat.id)}
              onContextMenu={(e) => openContextMenu('chat', chat.id, e)}
              onCommitRename={(title) => { onRenameChat(chat.id, title); setEditingChatId(null); }}
              onCancelRename={() => setEditingChatId(null)}
              onDelete={() => onDeleteChat(chat.id)}
            />
          ))}

          {chats.length === 0 && (
            <div className="sidebar-empty-hint">No chats yet.<br />Click + to start.</div>
          )}
        </nav>
      )}

      {contextMenu && (
        <ContextMenu
          menu={contextMenu}
          projects={projects}
          chat={contextChat}
          onClose={() => setContextMenu(null)}
          onRename={() => {
            if (contextMenu.type === 'chat') setEditingChatId(contextMenu.targetId);
            else setEditingProjectId(contextMenu.targetId);
          }}
          onDelete={() => {
            if (contextMenu.type === 'chat') {
              onDeleteChat(contextMenu.targetId);
            } else {
              if (window.confirm('Delete this project and all its chats? This cannot be undone.')) {
                onDeleteProject(contextMenu.targetId);
              }
            }
          }}
          onMoveToProject={
            contextMenu.type === 'chat'
              ? (projectId) => onMoveChatToProject(contextMenu.targetId, projectId)
              : undefined
          }
        />
      )}
    </aside>
  );
}
