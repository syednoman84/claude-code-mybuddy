import { useState, useEffect, useCallback } from 'react';
import { Chat, Project, Message, generateId, deriveChatTitle } from './types';

const STORAGE_KEY = 'litellm-chat-store';

interface StoredState {
  chats: Chat[];
  projects: Project[];
  activeChatId: string | null;
}

function load(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { chats: [], projects: [], activeChatId: null };
}

export function useChats() {
  const [chats, setChats] = useState<Chat[]>(() => load().chats);
  const [projects, setProjects] = useState<Project[]>(() => load().projects);
  const [activeChatId, setActiveChatIdState] = useState<string | null>(() => load().activeChatId);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ chats, projects, activeChatId }));
  }, [chats, projects, activeChatId]);

  const activeChat = chats.find((c) => c.id === activeChatId);

  const unassignedChats = chats
    .filter((c) => c.projectId === null)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const chatsInProject = useCallback(
    (projectId: string) =>
      chats
        .filter((c) => c.projectId === projectId)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [chats]
  );

  const createChat = useCallback((projectId: string | null = null): string => {
    const now = Date.now();
    const chat: Chat = {
      id: generateId(),
      title: '',
      projectId,
      messages: [],
      createdAt: now,
      updatedAt: now,
    };
    setChats((prev) => [chat, ...prev]);
    setActiveChatIdState(chat.id);
    return chat.id;
  }, []);

  const setActiveChat = useCallback((id: string) => {
    setActiveChatIdState(id);
  }, []);

  const updateChatMessages = useCallback((id: string, messages: Message[]) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              messages,
              updatedAt: Date.now(),
              title: c.title || deriveChatTitle(messages),
            }
          : c
      )
    );
  }, []);

  const deleteChat = useCallback(
    (id: string) => {
      setChats((prev) => {
        const remaining = prev.filter((c) => c.id !== id);
        if (activeChatId === id) {
          const next = remaining.sort((a, b) => b.updatedAt - a.updatedAt)[0] ?? null;
          setActiveChatIdState(next?.id ?? null);
        }
        return remaining;
      });
    },
    [activeChatId]
  );

  const renameChat = useCallback((id: string, title: string) => {
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
  }, []);

  const moveChatToProject = useCallback((chatId: string, projectId: string | null) => {
    setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, projectId } : c)));
  }, []);

  const createProject = useCallback((name: string): string => {
    const project: Project = { id: generateId(), name, createdAt: Date.now() };
    setProjects((prev) => [...prev, project]);
    return project.id;
  }, []);

  const renameProject = useCallback((id: string, name: string) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }, []);

  const deleteProject = useCallback(
    (id: string) => {
      const projectChatIds = chats.filter((c) => c.projectId === id).map((c) => c.id);
      setChats((prev) => {
        const remaining = prev.filter((c) => c.projectId !== id);
        if (activeChatId && projectChatIds.includes(activeChatId)) {
          const next = remaining.sort((a, b) => b.updatedAt - a.updatedAt)[0] ?? null;
          setActiveChatIdState(next?.id ?? null);
        }
        return remaining;
      });
      setProjects((prev) => prev.filter((p) => p.id !== id));
    },
    [chats, activeChatId]
  );

  return {
    chats,
    projects,
    activeChatId,
    activeChat,
    unassignedChats,
    chatsInProject,
    createChat,
    setActiveChat,
    updateChatMessages,
    deleteChat,
    renameChat,
    moveChatToProject,
    createProject,
    renameProject,
    deleteProject,
  };
}
