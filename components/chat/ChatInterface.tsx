"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

interface Message {
  id: string
  content: string
  sender_id: string
  application_id: string
  created_at: string
  sender_email?: string
}

interface ChatInterfaceProps {
  applicationId: string
  currentUserId: string
  listingTitle: string
  initialMessage?: string
}

export function ChatInterface({ applicationId, currentUserId, listingTitle, initialMessage }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const isInitialLoad = useRef(true)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    if (isInitialLoad.current) {
      scrollToBottom()
      isInitialLoad.current = false
    } else if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages, scrollToBottom]) // Added scrollToBottom to dependencies

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .eq("application_id", applicationId)
          .order("created_at", { ascending: true })

        if (messagesError) throw messagesError

        const uniqueSenderIds = [...new Set(messagesData?.map((msg) => msg.sender_id) || [])]
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, email")
          .in("id", uniqueSenderIds)

        if (userError) throw userError

        const userEmailMap = (userData || []).reduce(
          (acc, user) => {
            acc[user.id] = user.email
            return acc
          },
          {} as Record<string, string>,
        )

        const messagesWithUserData = (messagesData || []).map((message) => ({
          ...message,
          sender_email: userEmailMap[message.sender_id] || "Unknown User",
        }))

        setMessages(messagesWithUserData)
      } catch (error) {
        console.error("Error in fetchMessages:", error)
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    const channel = supabase
      .channel(`messages:${applicationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `application_id=eq.${applicationId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("email")
            .eq("id", newMessage.sender_id)
            .single()

          if (userError) {
            console.error("Error fetching user data:", userError)
            return
          }

          const messageWithUserData = {
            ...newMessage,
            sender_email: userData?.email || "Unknown User",
          }

          setMessages((current) => [...current, messageWithUserData])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [applicationId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            content: newMessage,
            sender_id: currentUserId,
            application_id: applicationId,
          },
        ])
        .select()
        .single()

      if (error) throw error
      if (!data) {
        throw new Error("No data returned after inserting message")
      }

      // Immediately add the new message to the state
      const newMessageWithEmail = {
        ...data,
        sender_email: messages.find((m) => m.sender_id === currentUserId)?.sender_email || "You",
      }
      setMessages((current) => [...current, newMessageWithEmail])
      setNewMessage("")
    } catch (error) {
      console.error("Error in handleSendMessage:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <div>Loading chat...</div>
  }

  return (
    <Card className="h-[400px] flex flex-col">
      <CardHeader className="border-b shrink-0 py-2">
        <CardTitle className="text-base">{listingTitle}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="flex flex-col justify-end p-3">
            {initialMessage && messages.length === 0 && (
              <div className="flex flex-col space-y-1 items-start mb-3">
                <div className="bg-gray-100 rounded-lg p-2 max-w-[80%]">
                  <p className="text-sm">{initialMessage}</p>
                  <p className="text-xs text-muted-foreground">Initial application message</p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col space-y-1 ${
                    message.sender_id === currentUserId ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`rounded-lg p-2 max-w-[80%] ${
                      message.sender_id === currentUserId ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                    <p className={`text-xs ${message.sender_id === currentUserId ? "text-blue-100" : "text-gray-500"}`}>
                      {message.sender_email} • {format(new Date(message.created_at), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="border-t p-2 flex items-center space-x-2 shrink-0 bg-white">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isSubmitting}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

