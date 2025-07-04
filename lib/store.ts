import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Player, GameState, ChatMessage, DrawingStroke } from './socket'

interface User {
  id: string
  username: string
  email: string
  avatar: string
}

interface GameStore {
  // User state
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
  
  // Game state
  gameState: GameState | null
  setGameState: (state: GameState | null) => void
  
  // Drawing state
  strokes: DrawingStroke[]
  addStroke: (stroke: DrawingStroke) => void
  clearStrokes: () => void
  
  // Chat state
  messages: ChatMessage[]
  addMessage: (message: ChatMessage) => void
  clearMessages: () => void
  
  // UI state
  isConnected: boolean
  setIsConnected: (connected: boolean) => void
  
  currentTool: 'brush' | 'eraser' | 'line' | 'rectangle' | 'square' | 'circle' | 'dotted'
  setCurrentTool: (tool: 'brush' | 'eraser' | 'line' | 'rectangle' | 'square' | 'circle' | 'dotted') => void
  
  brushSize: number
  setBrushSize: (size: number) => void
  
  brushColor: string
  setBrushColor: (color: string) => void
  
  showChat: boolean
  setShowChat: (show: boolean) => void
  
  // Sound settings
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // User state
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ 
        user: null, 
        gameState: null, 
        strokes: [], 
        messages: [],
        isConnected: false 
      }),
      
      // Game state
      gameState: null,
      setGameState: (gameState) => set({ gameState }),
      
      // Drawing state
      strokes: [],
      addStroke: (stroke) => set((state) => ({ strokes: [...state.strokes, stroke] })),
      clearStrokes: () => set({ strokes: [] }),
      
      // Chat state
      messages: [],
      addMessage: (message) => set((state) => {
        // Check if message already exists
        const messageExists = state.messages.some(m => m.id === message.id)
        if (messageExists) {
          return state // Don't add duplicate
        }
        
        return { 
          messages: [...state.messages, message].slice(-100) // Keep last 100 messages
        }
      }),
      clearMessages: () => set({ messages: [] }),
      
      // UI state
      isConnected: false,
      setIsConnected: (isConnected) => set({ isConnected }),
      
      currentTool: 'brush',
      setCurrentTool: (currentTool) => set({ currentTool }),
      
      brushSize: 5,
      setBrushSize: (brushSize) => set({ brushSize }),
      
      brushColor: '#ff0080',
      setBrushColor: (brushColor) => set({ brushColor }),
      
      showChat: true,
      setShowChat: (showChat) => set({ showChat }),
      
      // Sound settings
      soundEnabled: true,
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
    }),
    {
      name: 'masskribbl-storage',
      partialize: (state) => ({ 
        user: state.user,
        soundEnabled: state.soundEnabled,
        currentTool: state.currentTool,
        brushSize: state.brushSize,
        brushColor: state.brushColor
      }),
    }
  )
)