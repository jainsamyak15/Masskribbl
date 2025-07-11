'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/lib/store'
import { socketManager } from '@/lib/socket'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Settings, Play } from 'lucide-react'

export default function CreateRoom() {
  const [maxPlayers, setMaxPlayers] = useState(8)
  const [maxRounds, setMaxRounds] = useState(3)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const { user } = useGameStore()

  const createRoom = async () => {
    if (!user) {
      console.log('No user found')
      return
    }

    console.log('Creating room with user:', user.id)
    setIsCreating(true)
    
    try {
      const socket = socketManager.connect()
      console.log('Socket connected:', socket.connected)
      
      // Set up event listeners first
      const roomCreatedHandler = (roomCode: string) => {
        console.log('Room created successfully:', roomCode)
        setIsCreating(false)
        router.push(`/game/${roomCode}`)
      }

      const errorHandler = (error: string) => {
        console.error('Failed to create room:', error)
        setIsCreating(false)
      }

      socket.on('room:created', roomCreatedHandler)
      socket.on('error', errorHandler)
      
      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.error('Room creation timeout')
        socket.off('room:created', roomCreatedHandler)
        socket.off('error', errorHandler)
        setIsCreating(false)
      }, 15000) // 15 second timeout
      
      socket.emit('room:create', {
        hostId: user.id,
        maxPlayers,
        maxRounds
      })
      console.log('Room create event emitted')

      // Clear timeout when room is created
      socket.once('room:created', () => {
        clearTimeout(timeout)
        socket.off('room:created', roomCreatedHandler)
        socket.off('error', errorHandler)
      })

      socket.once('error', () => {
        clearTimeout(timeout)
        socket.off('room:created', roomCreatedHandler)
        socket.off('error', errorHandler)
      })
    } catch (error) {
      console.error('Failed to create room:', error)
      setIsCreating(false)
    }
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="glass border-primary/40">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Create Private Room
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Max Players
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[4, 6, 8, 12].map((count) => (
                  <Button
                    key={count}
                    variant={maxPlayers === count ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMaxPlayers(count)}
                    className="text-sm"
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Rounds
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 5].map((count) => (
                  <Button
                    key={count}
                    variant={maxRounds === count ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMaxRounds(count)}
                    className="text-sm"
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={createRoom}
            disabled={isCreating}
            className="w-full h-12 text-lg font-medium animate-glow"
          >
            {isCreating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Room...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Create Room
              </div>
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm text-white/60">
              Share the room code with friends to play together
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}