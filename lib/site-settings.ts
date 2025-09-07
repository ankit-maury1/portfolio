import { findMany, findOne, updateOne, insertOne, deleteOne } from '@/lib/mongodb-helpers';
import { ObjectId } from 'mongodb';

export interface SiteSetting {
  _id?: string | ObjectId;
  key: string;
  value: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function getAllSettings(): Promise<SiteSetting[]> {
  try {
    const settings = await findMany('siteSettings', {}, { sort: { key: 1 } });
    return settings.map(setting => ({
      ...setting,
      _id: setting._id.toString()
    }));
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return [];
  }
}

export async function getSettingByKey(key: string): Promise<SiteSetting | null> {
  try {
    const setting = await findOne('siteSettings', { key });
    
    if (setting) {
      return {
        ...setting,
        _id: setting._id.toString()
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching setting with key ${key}:`, error);
    return null;
  }
}

export async function updateSetting(key: string, value: string): Promise<SiteSetting | null> {
  try {
    // Try to find the setting first
    const existingSetting = await findOne('siteSettings', { key });
    
    if (existingSetting) {
      // Update existing setting
      await updateOne(
        'siteSettings',
        { key },
        { 
          value, 
          updatedAt: new Date() 
        }
      );
    } else {
      // Create new setting
      await insertOne('siteSettings', {
        key,
        value,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Get the updated/created document
    const updatedSetting = await findOne('siteSettings', { key });
    
    if (updatedSetting) {
      return {
        ...updatedSetting,
        _id: updatedSetting._id.toString()
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error updating setting with key ${key}:`, error);
    return null;
  }
}

export async function getDefaultSettingValue(key: string, defaultValue: string = ''): Promise<string> {
  const setting = await getSettingByKey(key);
  return setting?.value || defaultValue;
}

export async function initializeDefaultSettings(defaults: Record<string, string>): Promise<void> {
  try {
    // Get all existing keys
    const existingSettings = await findMany('siteSettings', {}, { projection: { key: 1 } });
    
    const existingKeys = new Set(existingSettings.map((setting: { key: string }) => setting.key));
    
    // Insert settings that don't exist
    for (const [key, value] of Object.entries(defaults)) {
      if (!existingKeys.has(key)) {
        await insertOne('siteSettings', {
          key,
          value,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
    
    console.log(`Initialized default settings`);
  } catch (error) {
    console.error('Error initializing default settings:', error);
  }
}

/**
 * Delete a site setting by key
 * @param key The key of the setting to delete
 * @returns True if setting was deleted, false otherwise
 */
export async function deleteSetting(key: string): Promise<boolean> {
  try {
    const result = await deleteOne('siteSettings', { key });
    return result.deletedCount > 0;
  } catch (error) {
    console.error(`Error deleting setting with key ${key}:`, error);
    return false;
  }
}
