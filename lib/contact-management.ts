import { trackDetailedActivity } from '@/lib/activity-tracking';
import { findMany, updateOne } from '@/lib/mongodb-helpers';
import { getContactMessageById } from '@/lib/contact-messages';
import { ObjectId } from 'mongodb';

// Get contact messages by status
export async function getContactMessagesByStatus(status: 'new' | 'read' | 'replied' | 'deleted' | 'archived') {
  try {
    const messages = await findMany('contactMessages', { status }, { sort: { createdAt: -1 } });
    return messages.map((message: any) => ({
      ...message,
      _id: message._id.toString(),
    }));
  } catch (error) {
    console.error(`Error fetching ${status} contact messages:`, error);
    return [];
  }
}

// Reply to a contact message
export async function replyToContactMessage(
  id: string, 
  replyContent: string, 
  replyBy: string
) {
  try {
    const now = new Date();
    await updateOne(
      'contactMessages',
      { _id: new ObjectId(id) },
      {
        replied: true,
        status: 'replied',
        replyContent,
        replyDate: now,
        replyBy,
        updatedAt: now
      }
    );
    
    // Track activity
    const message = await getContactMessageById(id);
    if (message && 'name' in message && 'subject' in message) {
      await trackDetailedActivity(
        'contact',
        `Reply to ${message.name}`,
        'reply',
        `Replied to message "${message.subject}"`,
        `/admin/contact`,
        replyBy
      );
    }
    
    return true;
  } catch (error) {
    console.error(`Error replying to message ${id}:`, error);
    return false;
  }
}

// Archive a contact message
export async function archiveContactMessage(id: string) {
  try {
    const now = new Date();
    await updateOne(
      'contactMessages',
      { _id: new ObjectId(id) },
      {
        status: 'archived',
        updatedAt: now
      }
    );
    
    // Track activity
    const message = await getContactMessageById(id);
    if (message && 'name' in message && 'subject' in message) {
      await trackDetailedActivity(
        'contact',
        `Archived message from ${message.name}`,
        'archive',
        `Archived message "${message.subject}"`,
        `/admin/contact`,
        'admin'
      );
    }
    
    return true;
  } catch (error) {
    console.error(`Error archiving message ${id}:`, error);
    return false;
  }
}

// Delete a contact message (soft delete)
export async function deleteContactMessage(id: string) {
  try {
    const now = new Date();
    await updateOne(
      'contactMessages',
      { _id: new ObjectId(id) },
      {
        status: 'deleted',
        updatedAt: now
      }
    );
    
    // Track activity
    const message = await getContactMessageById(id);
    if (message && 'name' in message && 'subject' in message) {
      await trackDetailedActivity(
        'contact',
        `Deleted message from ${message.name}`,
        'delete',
        `Deleted message "${message.subject}"`,
        `/admin/contact`,
        'admin'
      );
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting message ${id}:`, error);
    return false;
  }
}

// Add tags to a contact message
export async function addTagToContactMessage(id: string, tag: string) {
  try {
    await updateOne(
      'contactMessages',
      { _id: new ObjectId(id) },
      {
        $addToSet: { tags: tag },
        updatedAt: new Date()
      }
    );
    return true;
  } catch (error) {
    console.error(`Error adding tag to message ${id}:`, error);
    return false;
  }
}

// Set priority for a contact message
export async function setContactMessagePriority(
  id: string, 
  priority: 'low' | 'medium' | 'high'
) {
  try {
    await updateOne(
      'contactMessages',
      { _id: new ObjectId(id) },
      {
        priority,
        updatedAt: new Date()
      }
    );
    return true;
  } catch (error) {
    console.error(`Error setting priority for message ${id}:`, error);
    return false;
  }
}
