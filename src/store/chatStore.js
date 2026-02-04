import { create } from "zustand";

export const useChatStore = create((set) => ({
  // Team chat
  messages: [],
  loading: false,
  
  // Private chat
  privateMessages: [],
  selectedUser: null, // { id, name } - the user we're chatting with
  chatType: 'team', // 'team' or 'private'
  
  // Team chat methods
  setMessages: (messages) => set({ messages }),
  setLoading: (loading) => set({ loading }),
  
  // Private chat methods
  setPrivateMessages: (messages) => set({ privateMessages: messages }),
  setSelectedUser: (user) => set({ selectedUser: user }),
  setChatType: (type) => set({ chatType: type }), // 'team' or 'private'
  
  // Clear
  clearMessages: () => set({ messages: [] }),
  clearPrivateMessages: () => set({ privateMessages: [] }),
}));