"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, MailOpen, Trash2, Calendar, User, MessageSquare, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Define TypeScript types
interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  replied: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ContactManagement() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // debug state removed
  
  // Fetch contact messages
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/contact');
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const msg = body && body.error ? body.error : 'Failed to fetch contact messages';
        throw new Error(msg);
      }

      const data = await response.json();
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contact messages",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load data on component mount
  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 10 seconds
    const interval = setInterval(() => {
      fetchMessages();
    }, 10000);

    return () => clearInterval(interval);
  }, []);
  
  // Mark message as read
  const markAsRead = async (id: string, read: boolean) => {
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ read })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update message');
      }
      
      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg._id === id ? { ...msg, read } : msg
        )
      );
      
      toast({
        title: "Success",
        description: `Message marked as ${read ? 'read' : 'unread'}`,
      });
    } catch (error) {
      console.error('Error updating message:', error);
      toast({
        title: "Error",
        description: "Failed to update message",
        variant: "destructive"
      });
    }
  };
  
  // Mark message as replied
  const markAsReplied = async (id: string, replied: boolean) => {
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ replied })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update message');
      }
      
      // Update local state
      setMessages(prev => 
        prev.map(msg => 
          msg._id === id ? { ...msg, replied } : msg
        )
      );
      
      toast({
        title: "Success",
        description: `Message marked as ${replied ? 'replied' : 'not replied'}`,
      });
    } catch (error) {
      console.error('Error updating message:', error);
      toast({
        title: "Error",
        description: "Failed to update message",
        variant: "destructive"
      });
    }
  };
  
  // Delete message
  const deleteMessage = async () => {
    if (!selectedMessage) return;
    
    try {
      const response = await fetch(`/api/contact/${selectedMessage._id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete message');
      }
      
      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
      
      // Close dialog and refresh list
      setIsDeleteDialogOpen(false);
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive"
      });
    }
  };
  
  // Open message details
  const openMessageDetails = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsDetailDialogOpen(true);
    
    // Mark as read when opened
    if (!message.read) {
      markAsRead(message._id, true);
    }
  };
  
  // Open delete dialog
  const openDeleteDialog = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsDeleteDialogOpen(true);
  };
  
  return (
    <div className="container mx-auto p-6">
      <motion.div
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
            Contact Messages
          </h1>
          <div className="flex items-center space-x-2">
            <Button
              onClick={fetchMessages}
              variant="outline"
              className="border-cyan-500/30 hover:bg-cyan-950/30"
            >
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="bg-black/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-4">
          <div className="flex items-center">
            <Mail size={20} className="text-cyan-400 mr-2" />
            <div>
              <p className="text-sm text-gray-400">Total Messages</p>
              <p className="text-xl font-bold text-white">{messages.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center">
            <MailOpen size={20} className="text-green-400 mr-2" />
            <div>
              <p className="text-sm text-gray-400">Read</p>
              <p className="text-xl font-bold text-white">{messages.filter(m => m.read).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm border border-orange-500/30 rounded-xl p-4">
          <div className="flex items-center">
            <Mail size={20} className="text-orange-400 mr-2" />
            <div>
              <p className="text-sm text-gray-400">Unread</p>
              <p className="text-xl font-bold text-white">{messages.filter(m => !m.read).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-black/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4">
          <div className="flex items-center">
            <Check size={20} className="text-purple-400 mr-2" />
            <div>
              <p className="text-sm text-gray-400">Replied</p>
              <p className="text-xl font-bold text-white">{messages.filter(m => m.replied).length}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Messages List */}
      <motion.div
        className="grid gap-4"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        initial="hidden"
        animate="show"
      >
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-cyan-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-400">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-700 rounded-xl">
            <Mail size={48} className="mx-auto text-gray-500 mb-4" />
            <p className="text-gray-400">No contact messages found.</p>
          </div>
        ) : (
          messages.map((message) => (
            <motion.div
              key={message._id}
              className={`border rounded-xl p-5 cursor-pointer transition-all ${
                message.read 
                  ? 'bg-black/30 backdrop-blur-sm border-gray-600/30' 
                  : 'bg-black/50 backdrop-blur-sm border-cyan-500/30'
              }`}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
              onClick={() => openMessageDetails(message)}
            >
              <div className="flex flex-col md:flex-row justify-between">
                <div className="flex-grow">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center mr-4">
                      {message.read ? (
                        <MailOpen size={16} className="text-gray-400 mr-2" />
                      ) : (
                        <Mail size={16} className="text-cyan-400 mr-2" />
                      )}
                      <h3 className="text-lg font-semibold text-white">{message.subject}</h3>
                    </div>
                    
                    <div className="flex gap-2">
                      {!message.read && (
                        <Badge className="bg-cyan-800/30 text-cyan-400 text-xs">New</Badge>
                      )}
                      {message.replied && (
                        <Badge className="bg-green-800/30 text-green-400 text-xs">Replied</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <User size={14} className="text-gray-400 mr-2" />
                    <span className="text-gray-300 mr-4">{message.name}</span>
                    <span className="text-gray-400 text-sm">{message.email}</span>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                    {message.message.substring(0, 150)}...
                  </p>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar size={12} className="mr-1" />
                    <span>{format(new Date(message.createdAt), 'MMM d, yyyy \'at\' h:mm a')}</span>
                  </div>
                </div>
                
                <div className="flex items-center mt-4 md:mt-0" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => markAsRead(message._id, !message.read)}
                    className="text-cyan-500 hover:text-cyan-400 hover:bg-cyan-950/30"
                    title={message.read ? "Mark as unread" : "Mark as read"}
                  >
                    {message.read ? <Mail size={18} /> : <MailOpen size={18} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => markAsReplied(message._id, !message.replied)}
                    className="text-green-500 hover:text-green-400 hover:bg-green-950/30"
                    title={message.replied ? "Mark as not replied" : "Mark as replied"}
                  >
                    {message.replied ? <X size={18} /> : <Check size={18} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteDialog(message)}
                    className="text-rose-500 hover:text-rose-400 hover:bg-rose-950/30"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

  {/* live polling will update messages; debug UI removed */}

      {/* Message Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-950 border-cyan-500/30">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center">
                  <MessageSquare size={24} className="mr-2 text-cyan-400" />
                  {selectedMessage.subject}
                </DialogTitle>
                <DialogDescription>
                  Message from {selectedMessage.name}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">From</p>
                    <p className="text-white">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-cyan-400">{selectedMessage.email}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400">Received</p>
                  <p className="text-white">{format(new Date(selectedMessage.createdAt), 'EEEE, MMMM d, yyyy \'at\' h:mm a')}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-2">Message</p>
                  <div className="bg-black/50 border border-gray-700 rounded-lg p-4">
                    <p className="text-gray-200 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!selectedMessage.replied && (
                    <Button
                      onClick={() => {
                        markAsReplied(selectedMessage._id, true);
                        setSelectedMessage(prev => prev ? { ...prev, replied: true } : null);
                      }}
                      className="bg-green-700 hover:bg-green-800"
                    >
                      <Check size={16} className="mr-2" />
                      Mark as Replied
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => window.open(`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`)}
                    className="border-cyan-500/30 hover:bg-cyan-950/30"
                  >
                    <Mail size={16} className="mr-2" />
                    Reply via Email
                  </Button>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-gray-950 border-red-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl">Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="py-4">
              <p className="font-semibold">{selectedMessage.subject}</p>
              <p className="text-gray-400 text-sm mt-2">From: {selectedMessage.name} ({selectedMessage.email})</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={deleteMessage}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
