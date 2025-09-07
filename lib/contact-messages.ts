import { ObjectId } from 'mongodb';
import { findMany, findOne, updateOne, insertOne, deleteOne } from '@/lib/mongodb-helpers';

// Define ContactMessage type
export interface ContactMessage {
  _id?: string | ObjectId;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  replied: boolean;
  createdAt: Date;
  updatedAt: Date;
  status: 'new' | 'read' | 'replied' | 'deleted' | 'archived';
  replyContent?: string;
  replyDate?: Date;
  replyBy?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
}

// Get all contact messages
export async function getAllContactMessages() {
  try {
    const messages = await findMany('contactMessages', {}, { sort: { createdAt: -1 } });
    return messages.map(message => ({
      ...message,
      _id: message._id.toString(),
    }));
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return [];
  }
}

// Get contact messages count by status
export async function getContactMessageCountByStatus() {
  try {
    const all = await findMany('contactMessages', {});
    
    const counts = {
      all: all.length,
      new: 0,
      read: 0,
      replied: 0,
      deleted: 0,
      archived: 0,
      unread: 0
    };
    
    // Count messages by status
    all.forEach((message) => {
      const status = message.status || 'new';
      counts[status]++;
      
      // Also count unread messages
      if (!message.read) {
        counts.unread++;
      }
    });
    
    return counts;
  } catch (error) {
    console.error('Error counting contact messages by status:', error);
    return {
      all: 0,
      new: 0,
      read: 0,
      replied: 0,
      deleted: 0,
      archived: 0,
      unread: 0
    };
  }
}

// Get a single contact message by ID
export async function getContactMessageById(id: string) {
  try {
    const message = await findOne('contactMessages', { _id: new ObjectId(id) });
    
    if (!message) return null;
    
    return {
      ...message,
      _id: message._id.toString(),
    };
  } catch (error) {
    console.error(`Error fetching contact message with id ${id}:`, error);
    return null;
  }
}

// Create a new contact message
export async function createContactMessage(data: Omit<ContactMessage, '_id' | 'createdAt' | 'updatedAt' | 'read' | 'replied' | 'status' | 'tags' | 'priority'>) {
  try {
    const now = new Date();
    
    const result = await insertOne('contactMessages', {
      ...data,
      read: false,
      replied: false,
      status: 'new',
      priority: 'medium',
      tags: [],
      createdAt: now,
      updatedAt: now
    });
    
    if (!result.insertedId) {
      throw new Error('Failed to create contact message');
    }
    
    return {
      _id: result.insertedId.toString(),
      ...data,
      read: false,
      replied: false,
      status: 'new',
      priority: 'medium',
      tags: [],
      createdAt: now,
      updatedAt: now
    };
  } catch (error) {
    console.error('Error creating contact message:', error);
    return null;
  }
}

// Mark a contact message as read
export async function markContactMessageAsRead(id: string, isRead: boolean = true) {
  try {
    const now = new Date();
    await updateOne(
      'contactMessages',
      { _id: new ObjectId(id) },
      {
        read: isRead,
        status: isRead ? 'read' : 'new',
        updatedAt: now
      }
    );
    
    // Track activity
    const message = await getContactMessageById(id);
    if (message && 'name' in message && 'subject' in message) {
      const { trackDetailedActivity } = await import('./activity-tracking');
      await trackDetailedActivity(
        'contact',
        `Contact from ${message.name}`,
        'mark_read',
        `Marked message "${message.subject}" as ${isRead ? 'read' : 'unread'}`,
        `/admin/contact`,
        'admin'
      );
    }
    
    return true;
  } catch (error) {
    console.error(`Error updating read status for message ${id}:`, error);
    return false;
  }
}

// Mark a contact message as replied
export async function markContactMessageAsReplied(id: string, isReplied: boolean = true) {
  try {
    await updateOne(
      'contactMessages',
      { _id: new ObjectId(id) },
      {
        replied: isReplied,
        updatedAt: new Date()
      }
    );
    
    return true;
  } catch (error) {
    console.error(`Error updating replied status for message ${id}:`, error);
    return false;
  }
}

// Delete a contact message
export async function deleteContactMessage(id: string) {
  try {
    await deleteOne('contactMessages', { _id: new ObjectId(id) });
    return true;
  } catch (error) {
    console.error(`Error deleting contact message ${id}:`, error);
    return false;
  }
}
