"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Calendar, Tag, Star, Archive, DraftingCompass, FileCheck, FileX, Bold, Italic, Underline, List, ListOrdered, Link, Image, Table, Undo, Redo, Maximize, Minimize, Save, Eye, EyeOff, Type, Hash, Quote, Code, Strikethrough } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import dynamic from 'next/dynamic';
import { useHotkeys } from 'react-hotkeys-hook';
import { generateSlug } from "@/lib/utils";

// Create an enhanced rich text editor with MS Word-like features
// that's compatible with React 19
const EnhancedEditor = ({ 
  value, 
  onChange, 
  placeholder,
  isFullScreen = false,
  onToggleFullScreen = () => {},
  wordCount = 0,
  charCount = 0,
  readingTime = 0
}: { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder?: string;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
  wordCount?: number;
  charCount?: number;
  readingTime?: number;
}) => {
  const [selectedText, setSelectedText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Track selected text
  const handleSelect = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      setSelectedText(value.substring(start, end));
    }
  };

  // Insert formatting at cursor position or around selected text
  const insertFormatting = (before: string, after: string = '') => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    if (start === end) {
      // No selection, just insert at cursor
      const newValue = value.substring(0, start) + before + after + value.substring(end);
      onChange(newValue);
      
      // Set cursor position between tags
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start + before.length, start + before.length);
        }
      }, 0);
    } else {
      // Wrap selected text
      const selected = value.substring(start, end);
      const newValue = value.substring(0, start) + before + selected + after + value.substring(end);
      onChange(newValue);
      
      // Set selection to include the formatted text
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(start, end + before.length + after.length);
        }
      }, 0);
    }
  };

  return (
    <div className={`rich-editor-container ${isFullScreen ? 'editor-fullscreen' : ''}`}>
      {/* Top toolbar with formatting options */}
      <div className="p-2 bg-gray-900 border-b border-gray-800 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-300 font-semibold px-2">
            Word Processor
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-400">
              {wordCount} words • {charCount} chars • {readingTime} min read
            </div>
            <button
              type="button"
              onClick={onToggleFullScreen}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800"
            >
              {isFullScreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          </div>
        </div>

        {/* Main toolbar */}
        <div className="flex flex-wrap gap-1">
          <div className="flex p-1 bg-gray-800 rounded-lg mr-2">
            <button 
              type="button" 
              className="editor-btn"
              title="Bold (Ctrl+B)"
              onClick={() => insertFormatting('**', '**')}
            >
              <Bold size={16} />
            </button>
            <button 
              type="button" 
              className="editor-btn"
              title="Italic (Ctrl+I)"
              onClick={() => insertFormatting('_', '_')}
            >
              <Italic size={16} />
            </button>
            <button 
              type="button" 
              className="editor-btn"
              title="Underline (Ctrl+U)"
              onClick={() => insertFormatting('__', '__')}
            >
              <Underline size={16} />
            </button>
            <button 
              type="button" 
              className="editor-btn"
              title="Strikethrough"
              onClick={() => insertFormatting('~~', '~~')}
            >
              <Strikethrough size={16} />
            </button>
          </div>
          
          <div className="flex p-1 bg-gray-800 rounded-lg mr-2">
            <button 
              type="button" 
              className="editor-btn"
              title="Heading 1"
              onClick={() => insertFormatting('# ', '\n')}
            >
              H1
            </button>
            <button 
              type="button" 
              className="editor-btn"
              title="Heading 2"
              onClick={() => insertFormatting('## ', '\n')}
            >
              H2
            </button>
            <button 
              type="button" 
              className="editor-btn"
              title="Heading 3"
              onClick={() => insertFormatting('### ', '\n')}
            >
              H3
            </button>
          </div>
          
          <div className="flex p-1 bg-gray-800 rounded-lg mr-2">
            <button 
              type="button" 
              className="editor-btn"
              title="Bulleted List"
              onClick={() => insertFormatting('- ', '\n')}
            >
              <List size={16} />
            </button>
            <button 
              type="button" 
              className="editor-btn"
              title="Numbered List"
              onClick={() => insertFormatting('1. ', '\n')}
            >
              <ListOrdered size={16} />
            </button>
            <button 
              type="button" 
              className="editor-btn"
              title="Blockquote"
              onClick={() => insertFormatting('> ', '\n')}
            >
              <Quote size={16} />
            </button>
            <button 
              type="button" 
              className="editor-btn"
              title="Code Block"
              onClick={() => insertFormatting('```\n', '\n```')}
            >
              <Code size={16} />
            </button>
          </div>
          
          <div className="flex p-1 bg-gray-800 rounded-lg mr-2">
            <button 
              type="button" 
              className="editor-btn"
              title="Insert Link (Ctrl+K)"
              onClick={() => {
                const url = window.prompt('Enter URL', 'https://');
                if (url) {
                  if (selectedText) {
                    insertFormatting('[', `](${url})`);
                  } else {
                    insertFormatting(`[Link text](${url})`);
                  }
                }
              }}
            >
              <Link size={16} />
            </button>
            <button 
              type="button" 
              className="editor-btn"
              title="Insert Image"
              onClick={() => {
                const url = window.prompt('Enter image URL', 'https://');
                const alt = window.prompt('Enter image description', 'Image');
                if (url) {
                  insertFormatting(`![${alt || 'Image'}](${url})`);
                }
              }}
            >
              <Image size={16} />
            </button>
            <button 
              type="button" 
              className="editor-btn"
              title="Insert Table"
              onClick={() => {
                const rows = parseInt(window.prompt('Number of rows', '3') || '3');
                const cols = parseInt(window.prompt('Number of columns', '3') || '3');
                if (rows > 0 && cols > 0) {
                  let tableMarkdown = '\n';
                  
                  // Header row
                  tableMarkdown += '| ';
                  for (let c = 0; c < cols; c++) {
                    tableMarkdown += 'Header ' + (c+1) + ' | ';
                  }
                  tableMarkdown += '\n';
                  
                  // Separator row
                  tableMarkdown += '| ';
                  for (let c = 0; c < cols; c++) {
                    tableMarkdown += '--- | ';
                  }
                  tableMarkdown += '\n';
                  
                  // Data rows
                  for (let r = 0; r < rows; r++) {
                    tableMarkdown += '| ';
                    for (let c = 0; c < cols; c++) {
                      tableMarkdown += 'Cell ' + (r+1) + '-' + (c+1) + ' | ';
                    }
                    tableMarkdown += '\n';
                  }
                  
                  insertFormatting(tableMarkdown);
                }
              }}
            >
              <Table size={16} />
            </button>
          </div>
          
          <div className="flex p-1 bg-gray-800 rounded-lg mr-2">
            <button 
              type="button" 
              className="editor-btn"
              title="Horizontal Rule"
              onClick={() => insertFormatting('\n---\n')}
            >
              <span style={{ fontWeight: 'bold' }}>HR</span>
            </button>
            <button 
              type="button" 
              className="editor-btn"
              title="Task List"
              onClick={() => insertFormatting('- [ ] ', '\n')}
            >
              <span style={{ fontWeight: 'bold' }}>☐</span>
            </button>
            <button 
              type="button" 
              className="editor-btn" 
              title="Completed Task"
              onClick={() => insertFormatting('- [x] ', '\n')}
            >
              <span style={{ fontWeight: 'bold' }}>☑</span>
            </button>
          </div>
          
          <div className="flex p-1 bg-gray-800 rounded-lg">
            <button 
              type="button" 
              className="editor-btn"
              title="Undo (Ctrl+Z)"
              onClick={() => document.execCommand('undo')}
            >
              <Undo size={16} />
            </button>
            <button 
              type="button" 
              className="editor-btn"
              title="Redo (Ctrl+Y)"
              onClick={() => document.execCommand('redo')}
            >
              <Redo size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Editor area */}
      <textarea
        ref={textareaRef}
        className="w-full bg-black text-gray-100 p-4 border-none outline-none font-sans"
        style={{ 
          height: isFullScreen ? 'calc(100vh - 150px)' : '400px',
          resize: 'vertical'
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onSelect={handleSelect}
        placeholder={placeholder || "Start writing your content..."}
        spellCheck={true}
      />
      
      {/* Bottom status bar */}
      <div className="p-2 bg-gray-900 border-t border-gray-800 flex justify-between items-center text-xs text-gray-400">
        <span>Use Markdown syntax for formatting or the buttons above</span>
        <span>Press F11 or click the maximize button for full-screen mode</span>
      </div>
    </div>
  );
};

// No need for ReactQuill dynamic import anymore
import 'react-quill/dist/quill.snow.css';

// Add custom styles for the rich text editor
const customEditorStyles = `
  .rich-editor-container {
    border: 1px solid #374151;
    border-radius: 0.375rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .rich-editor-container textarea {
    min-height: 300px;
    font-size: 16px;
    line-height: 1.6;
    flex-grow: 1;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }
  
  .editor-btn {
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #d1d5db;
    margin: 0 1px;
    min-width: 32px;
    transition: all 0.15s ease;
  }
  
  .editor-btn:hover {
    background-color: #1f2937;
    color: white;
  }
  
  .editor-btn:active {
    background-color: #0891b2;
    color: white;
  }
  
  .editor-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    border-radius: 0;
    background-color: #000000;
  }
  
  .rich-editor-container textarea:focus {
    box-shadow: none;
    border-color: transparent;
    outline: none;
  }
`; 

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = customEditorStyles;
  document.head.appendChild(style);
}

// Define TypeScript types
enum BlogStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  UNLISTED = "UNLISTED",
  ARCHIVED = "ARCHIVED",
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  coverImage?: string;
  status: BlogStatus;
  publishedAt?: string; // ISO date string
  featured: boolean;
  userId: string;
  user?: {
    name?: string;
    image?: string;
  };
  tags: BlogTag[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

const StatusBadge = ({ status }: { status: BlogStatus }) => {
  const statusConfig = {
    [BlogStatus.PUBLISHED]: {
      label: "Published",
      icon: <FileCheck size={12} className="mr-1" />,
      className: "bg-green-800/30 text-green-400",
    },
    [BlogStatus.DRAFT]: {
      label: "Draft",
      icon: <DraftingCompass size={12} className="mr-1" />,
      className: "bg-gray-800/30 text-gray-400",
    },
    [BlogStatus.UNLISTED]: {
      label: "Unlisted",
      icon: <FileX size={12} className="mr-1" />,
      className: "bg-yellow-800/30 text-yellow-400",
    },
    [BlogStatus.ARCHIVED]: {
      label: "Archived",
      icon: <Archive size={12} className="mr-1" />,
      className: "bg-red-800/30 text-red-400",
    },
  };

  const config = statusConfig[status] || statusConfig[BlogStatus.DRAFT];

  return (
    <span className={`ml-2 text-xs px-2 py-1 rounded-full flex items-center ${config.className}`}>
      {config.icon} {config.label}
    </span>
  );
};

export default function BlogManagement() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bulkAction, setBulkAction] = useState<{ type: string; status: string } | null>(null);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState<Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'user'> & { slug?: string }>({
    title: "",
    slug: "",
    summary: "",
    content: "",
    coverImage: "",
    status: BlogStatus.DRAFT,
    featured: false,
    tags: []
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  // Editor state for add/edit dialogs
  const [newEditorTab, setNewEditorTab] = useState<'write' | 'preview'>('write');
  const [editEditorTab, setEditEditorTab] = useState<'write' | 'preview'>('write');
  
  // New state for enhanced features
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [editorMode, setEditorMode] = useState<'rich' | 'markdown'>('rich');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Filtered blog posts based on status filter
  const filteredBlogPosts = useMemo(() => {
    if (statusFilter === 'all') {
      return blogPosts;
    }
    return blogPosts.filter(post => post.status === statusFilter);
  }, [blogPosts, statusFilter]);
  
  // Fetch blog posts
  const fetchBlogPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/blog-admin');
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }
      
      const data = await response.json();
      setBlogPosts(data);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch blog posts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch tags
  const fetchTags = async () => {
    try {
      const response = await fetch('/api/blog-tags');
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      
      const data = await response.json();
      setTags(data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };
  
  // Utility functions for enhanced features
  const calculateStats = (content: string) => {
    // Count words and characters
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    const chars = content.length;
    
    // Calculate reading time with a more sophisticated algorithm:
    // - Average reading speed is 200-250 words per minute for adults
    // - Add time for complex content (code blocks, tables, etc.)
    // - Account for images (each image adds ~5-10 seconds)
    
    // Count code blocks, tables, and images for complexity calculation
    const codeBlockMatches = content.match(/```[\s\S]*?```/g) || [];
    const tableMatches = content.match(/\|[\s\S]*?\|/g) || [];
    const imageMatches = content.match(/!\[.*?\]\(.*?\)/g) || [];
    
    // Basic reading time (words ÷ reading speed)
    const baseReadingTimeMin = words.length / 225;
    
    // Add time for complex elements
    const codeReadingTime = codeBlockMatches.length * 0.5; // 30 seconds per code block
    const tableReadingTime = tableMatches.length * 0.33; // 20 seconds per table
    const imageViewingTime = imageMatches.length * 0.17; // 10 seconds per image
    
    // Calculate total reading time in minutes
    const totalReadingTimeMin = baseReadingTimeMin + codeReadingTime + tableReadingTime + imageViewingTime;
    
    // Ensure reading time is at least 1 minute if there's any content
    const finalReadingTime = content.length > 0 ? Math.max(1, Math.ceil(totalReadingTimeMin)) : 0;
    
    // Update state with calculated values
    setWordCount(words.length);
    setCharCount(chars);
    setReadingTime(finalReadingTime);
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const autoSaveDraft = async (content: string, title: string) => {
    if (!isAddDialogOpen) return;
    setIsAutoSaving(true);
    try {
      const draft = {
        title,
        content,
        tags: selectedTags,
        summary: newPost.summary,
        coverImage: newPost.coverImage,
        status: newPost.status,
        featured: newPost.featured,
        slug: newPost.slug || generateSlug(title),
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('blog-draft-enhanced', JSON.stringify(draft));
      setLastSaved(new Date());
    } catch (e) {
      console.error('Failed to auto-save draft', e);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const loadEnhancedDraft = () => {
    try {
      const raw = localStorage.getItem('blog-draft-enhanced');
      if (!raw) return;
      const draft = JSON.parse(raw);
      const updatedData = {
        title: draft.title || '',
        content: draft.content || '',
        summary: draft.summary || '',
        coverImage: draft.coverImage || '',
        status: draft.status || BlogStatus.DRAFT,
        featured: draft.featured || false,
        slug: draft.slug || generateSlug(draft.title || '')
      };
      
      setNewPost(prev => ({
        ...prev,
        ...updatedData
      }));
      setSelectedTags(draft.tags || []);
      calculateStats(stripHtml(draft.content || ''));
      toast({ title: 'Draft loaded', description: 'Loaded enhanced draft from local storage' });
    } catch (e) {
      console.error('Failed to load enhanced draft', e);
    }
  };
  
  // Handle form input changes for new post
  const handleNewPostChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Generate slug when title changes
    if (name === 'title') {
      const slug = generateSlug(value);
      setNewPost(prev => ({
        ...prev,
        [name]: value,
        slug: slug
      }));
    } else {
      setNewPost(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle rich text content changes for new post
  const handleNewPostContentChange = (content: string) => {
    setNewPost(prev => ({
      ...prev,
      content
    }));
    calculateStats(stripHtml(content));
    autoSaveDraft(content, newPost.title);
  };

  // Autosave draft for new post to localStorage
  useEffect(() => {
    if (!isAddDialogOpen) return;
    const handler = setTimeout(() => {
      autoSaveDraft(newPost.content, newPost.title);
    }, 2000);

    return () => clearTimeout(handler);
  }, [newPost, isAddDialogOpen, autoSaveDraft]);

  // Keyboard shortcuts
  useHotkeys('ctrl+s, cmd+s', (e) => {
    e.preventDefault();
    if (isAddDialogOpen) {
      handleAddPost();
    } else if (isEditDialogOpen) {
      handleUpdatePost();
    }
  });

  useHotkeys('f11', (e) => {
    e.preventDefault();
    setIsFullScreen(!isFullScreen);
  });
  
  // Handle switch changes for new post
  const handleNewPostSwitchChange = (name: string, checked: boolean) => {
    setNewPost(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleNewPostStatusChange = (value: BlogStatus) => {
    setNewPost(prev => ({
      ...prev,
      status: value
    }));
  };

  // Handle form input changes for editing post
  const handleEditPostChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (currentPost) {
      // Generate slug when title changes
      if (name === 'title') {
        const slug = generateSlug(value);
        setCurrentPost({
          ...currentPost,
          [name]: value,
          slug: slug
        });
      } else {
        setCurrentPost({
          ...currentPost,
          [name]: value
        });
      }
    }
  };
  
  // Handle switch changes for editing post
  const handleEditPostSwitchChange = (name: string, checked: boolean) => {
    if (currentPost) {
      setCurrentPost({
        ...currentPost,
        [name]: checked
      });
    }
  };

  const handleEditPostStatusChange = (value: BlogStatus) => {
    if (currentPost) {
      setCurrentPost({
        ...currentPost,
        status: value
      });
    }
  };
  
  // Handle tag selection
  const handleTagSelection = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter(t => t !== tagName));
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };
  
  // Handle tag selection for edit
  const handleEditTagSelection = (tagName: string) => {
    if (!currentPost) return;
    
    const currentTags = currentPost.tags.map(tag => tag.name);
    let updatedTags;
    
    if (currentTags.includes(tagName)) {
      // Remove tag
      updatedTags = currentPost.tags.filter(tag => tag.name !== tagName);
    } else {
      // Add tag
      const tagObject = tags.find(t => t.name === tagName);
      if (tagObject) {
        updatedTags = [...currentPost.tags, tagObject];
      } else {
        updatedTags = [
          ...currentPost.tags,
          { id: "temp-" + Math.random().toString(36).substr(2, 9), name: tagName, slug: "" }
        ];
      }
    }
    
    setCurrentPost({
      ...currentPost,
      tags: updatedTags
    });
  };
  
  // Add a new tag
  const handleAddTag = async () => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) return;

    // Prevent duplicate selection
    if (selectedTags.includes(trimmedTag)) {
      setNewTag("");
      return;
    }

    // If tag already exists in fetched list, just select it
    const existingTag = tags.find(tag => tag.name.toLowerCase() === trimmedTag.toLowerCase());
    if (existingTag) {
      setSelectedTags(prev => [...prev, existingTag.name]);
      setNewTag("");
      toast({
        title: "Tag selected",
        description: `Using existing tag "${existingTag.name}"`,
      });
      return;
    }

    setIsCreatingTag(true);

    try {
      const response = await fetch('/api/blog-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: trimmedTag }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'Failed to create tag' }));
        throw new Error(errorBody.error || 'Failed to create tag');
      }

      const createdTag = await response.json();
      const preparedTag: BlogTag = {
        id: createdTag.id,
        name: createdTag.name,
        slug: createdTag.slug,
      };

      setTags(prev => [...prev, preparedTag].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedTags(prev => [...prev, preparedTag.name]);
      setNewTag("");

      toast({
        title: "Tag created",
        description: `Created new tag "${preparedTag.name}"`,
      });
    } catch (error: unknown) {
      console.error('Error creating tag:', error);
      toast({
        title: "Error",
        description: (error as Error)?.message || 'Failed to create tag',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingTag(false);
    }
  };
  
  // Add a new blog post
  const handleAddPost = async () => {
    if (!newPost.title.trim()) {
      setSaveError("Title is required");
      toast({
        title: "Validation Error",
        description: "Please enter a title for your blog post",
        variant: "destructive"
      });
      return;
    }

    if (!newPost.content.trim()) {
      setSaveError("Content is required");
      toast({
        title: "Validation Error",
        description: "Please add some content to your blog post",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch('/api/blog-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newPost,
          tags: selectedTags
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add blog post');
      }
      
      toast({
        title: "Success",
        description: "Blog post published successfully!",
      });
      
      // Reset form and close dialog
      setNewPost({
        title: "",
        slug: "",
        summary: "",
        content: "",
        coverImage: "",
        status: BlogStatus.DRAFT,
        featured: false,
        tags: []
      });
      setSelectedTags([]);
      setIsAddDialogOpen(false);
      setWordCount(0);
      setCharCount(0);
      setReadingTime(0);
      
      // Clear saved draft
      localStorage.removeItem('blog-draft-enhanced');
      
      // Refresh blog post list
      fetchBlogPosts();
    } catch (error: unknown) {
      console.error('Error adding blog post:', error);
      setSaveError((error as Error)?.message);
      toast({
        title: "Error",
        description: (error as Error)?.message || "Failed to save blog post",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Update a blog post
  const handleUpdatePost = async () => {
    if (!currentPost) return;
    
    try {
      const response = await fetch(`/api/blog-admin/${currentPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...currentPost,
          tags: currentPost.tags.map(tag => tag.name),
          status: currentPost.status,
          published: currentPost.status === 'PUBLISHED',
          publishedAt: currentPost.status === 'PUBLISHED' && !currentPost.publishedAt ? new Date().toISOString() : currentPost.publishedAt
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update blog post');
      }
      
      toast({
        title: "Success",
        description: "Blog post updated successfully",
      });
      
      // Close dialog and refresh list
      setIsEditDialogOpen(false);
      fetchBlogPosts();
    } catch (error: unknown) {
      console.error('Error updating blog post:', error);
      toast({
        title: "Error",
        description: (error as Error)?.message || "Failed to update blog post",
        variant: "destructive"
      });
    }
  };
  
  // Delete a blog post
  const handleDeletePost = async () => {
    if (!currentPost) return;
    
    try {
      const response = await fetch(`/api/blog-admin/${currentPost.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete blog post');
      }
      
      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      });
      
      // Close dialog and refresh list
      setIsDeleteDialogOpen(false);
      fetchBlogPosts();
    } catch (error: unknown) {
      console.error('Error deleting blog post:', error);
      toast({
        title: "Error",
        description: (error as Error)?.message || "Failed to delete blog post",
        variant: "destructive"
      });
    }
  };
  
  // Set up edit dialog
  const openEditDialog = (post: BlogPost) => {
    setCurrentPost(post);
    setIsEditDialogOpen(true);
  };
  
  // Set up delete dialog
  const openDeleteDialog = (post: BlogPost) => {
    setCurrentPost(post);
    setIsDeleteDialogOpen(true);
  };

  // Bulk update status for filtered posts
  const bulkUpdateStatus = async (newStatus: string) => {
    const postsToUpdate = filteredBlogPosts.filter(post => post.status !== newStatus);
    
    if (postsToUpdate.length === 0) {
      toast({
        title: "No posts to update",
        description: `All ${statusFilter === 'all' ? 'posts' : statusFilter.toLowerCase()} are already ${newStatus.toLowerCase()}`,
      });
      return;
    }

    setBulkAction({ type: 'status', status: newStatus });
    setIsBulkDialogOpen(true);
  };

  // Load data on component mount
  useEffect(() => {
    fetchBlogPosts();
    fetchTags();
  }, []);
  
  return (
    <div className="container mx-auto p-6">
      <motion.div
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
          Blog Management
        </h1>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
        >
          <Plus size={16} className="mr-2" /> New Post
        </Button>
      </motion.div>

      {/* Status Filter Section */}
      <motion.div
        className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold mb-4 text-white">Filter by Status</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Posts ({blogPosts.length})
          </button>
          <button
            onClick={() => setStatusFilter('PUBLISHED')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              statusFilter === 'PUBLISHED'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Published ({blogPosts.filter(p => p.status === 'PUBLISHED').length})
          </button>
          <button
            onClick={() => setStatusFilter('DRAFT')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              statusFilter === 'DRAFT'
                ? 'bg-gradient-to-r from-gray-600 to-slate-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Draft ({blogPosts.filter(p => p.status === 'DRAFT').length})
          </button>
          <button
            onClick={() => setStatusFilter('UNLISTED')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              statusFilter === 'UNLISTED'
                ? 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Unlisted ({blogPosts.filter(p => p.status === 'UNLISTED').length})
          </button>
          <button
            onClick={() => setStatusFilter('ARCHIVED')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              statusFilter === 'ARCHIVED'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Archived ({blogPosts.filter(p => p.status === 'ARCHIVED').length})
          </button>
        </div>
      </motion.div>

      {/* Quick Actions Section */}
      <motion.div
        className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold mb-4 text-white">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => bulkUpdateStatus('PUBLISHED')}
            className="bg-green-600 hover:bg-green-700"
            disabled={filteredBlogPosts.filter(p => p.status !== 'PUBLISHED').length === 0}
          >
            <FileCheck size={16} className="mr-2" />
            Publish All {statusFilter === 'all' ? 'Drafts' : statusFilter.toLowerCase()}
          </Button>
          <Button
            onClick={() => bulkUpdateStatus('DRAFT')}
            className="bg-gray-600 hover:bg-gray-700"
            disabled={filteredBlogPosts.filter(p => p.status !== 'DRAFT').length === 0}
          >
            <DraftingCompass size={16} className="mr-2" />
            Move to Draft
          </Button>
          <Button
            onClick={() => bulkUpdateStatus('UNLISTED')}
            className="bg-yellow-600 hover:bg-yellow-700"
            disabled={filteredBlogPosts.filter(p => p.status !== 'UNLISTED').length === 0}
          >
            <FileX size={16} className="mr-2" />
            Make Unlisted
          </Button>
          <Button
            onClick={() => bulkUpdateStatus('ARCHIVED')}
            className="bg-red-600 hover:bg-red-700"
            disabled={filteredBlogPosts.filter(p => p.status !== 'ARCHIVED').length === 0}
          >
            <Archive size={16} className="mr-2" />
            Archive All
          </Button>
        </div>
      </motion.div>

      {/* Blog Posts List */}
      <motion.div
        className="grid gap-6"
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
            <p className="mt-4 text-gray-400">Loading blog posts...</p>
          </div>
        ) : filteredBlogPosts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-700 rounded-xl">
            <p className="text-gray-400">
              {statusFilter === 'all'
                ? 'No blog posts found. Create your first post!'
                : `No ${statusFilter.toLowerCase()} blog posts found.`
              }
            </p>
          </div>
        ) : (
          filteredBlogPosts.map((post) => (
            <motion.div
              key={post.id}
              className="bg-black/50 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-5"
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <div className="flex flex-col md:flex-row justify-between">
                <div className="flex-grow">
                  <div className="flex items-center mb-2">
                    <h2 className="text-xl font-bold mr-3">{post.title}</h2>
                    {post.featured && (
                      <span className="bg-amber-800/30 text-amber-400 text-xs px-2 py-1 rounded-full flex items-center">
                        <Star size={12} className="mr-1" /> Featured
                      </span>
                    )}
                    <StatusBadge status={post.status} />
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                    {post.summary || post.content.substring(0, 150)}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map(tag => (
                      <span key={tag.id} className="bg-blue-900/30 text-blue-400 text-xs px-2 py-1 rounded-full flex items-center">
                        <Tag size={10} className="mr-1" /> {tag.name}
                      </span>
                    ))}
                    {post.tags.length === 0 && (
                      <span className="text-gray-500 text-xs">No tags</span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar size={14} className="mr-1" />
                    <span>
                      {post.publishedAt 
                        ? `Published: ${format(new Date(post.publishedAt), 'MMM d, yyyy')}`
                        : `Created: ${format(new Date(post.createdAt), 'MMM d, yyyy')}`
                      }
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center mt-4 md:mt-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(post)}
                    className="text-cyan-500 hover:text-cyan-400 hover:bg-cyan-950/30"
                  >
                    <Pencil size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openDeleteDialog(post)}
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

      {/* Add Blog Post Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-950 border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl">Add New Blog Post</DialogTitle>
            <DialogDescription>Create a new blog post for your portfolio</DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter post title"
                    value={newPost.title}
                    onChange={handleNewPostChange}
                  />
                  {newPost.title && (
                    <div className="text-xs text-gray-500 mt-1">
                      URL slug: <span className="font-mono">{newPost.slug || generateSlug(newPost.title)}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    name="summary"
                    placeholder="Brief summary of your post"
                    value={newPost.summary || ''}
                    onChange={handleNewPostChange}
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Content</Label>
                  <div className="border border-gray-800 rounded-lg overflow-hidden">
                    <div className="p-3 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-300">Rich Text Editor</div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditorMode('rich')}
                            className={`px-3 py-1 rounded text-sm ${editorMode === 'rich' ? 'bg-cyan-700 text-white' : 'bg-gray-800 text-gray-300'}`}
                          >
                            <Type size={14} className="inline mr-1" /> Rich Text
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditorMode('markdown')}
                            className={`px-3 py-1 rounded text-sm ${editorMode === 'markdown' ? 'bg-cyan-700 text-white' : 'bg-gray-800 text-gray-300'}`}
                          >
                            <Hash size={14} className="inline mr-1" /> Markdown
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-xs text-gray-400">
                          {wordCount} words • {charCount} chars • {readingTime} min read
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={loadEnhancedDraft} className="text-xs text-gray-400 hover:text-white">
                            Load Draft
                          </button>
                          {lastSaved && (
                            <span className="text-xs text-green-400">
                              Saved {format(lastSaved, 'HH:mm')}
                            </span>
                          )}
                          {isAutoSaving && (
                            <span className="text-xs text-yellow-400">Saving...</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsFullScreen(true)}
                          className="text-gray-400 hover:text-white"
                        >
                          <Maximize size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="bg-black">
                      {editorMode === 'rich' ? (
                        <EnhancedEditor
                          value={newPost.content}
                          onChange={handleNewPostContentChange}
                          placeholder="Start writing your amazing blog post..."
                          wordCount={wordCount}
                          charCount={charCount}
                          readingTime={readingTime}
                          isFullScreen={isFullScreen}
                          onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
                        />
                      ) : (
                        <div className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex gap-1">
                              <button type="button" onClick={() => setNewPost(prev => ({ ...prev, content: prev.content + '\n**bold**' }))} className="px-2 py-1 bg-gray-800 rounded text-sm">Bold</button>
                              <button type="button" onClick={() => setNewPost(prev => ({ ...prev, content: prev.content + '\n_italic_' }))} className="px-2 py-1 bg-gray-800 rounded text-sm">Italic</button>
                              <button type="button" onClick={() => setNewPost(prev => ({ ...prev, content: prev.content + '\n`code`' }))} className="px-2 py-1 bg-gray-800 rounded text-sm">Code</button>
                              <button type="button" onClick={() => setNewPost(prev => ({ ...prev, content: prev.content + '\n- list item' }))} className="px-2 py-1 bg-gray-800 rounded text-sm">List</button>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                              <button type="button" onClick={() => setNewEditorTab('write')} className={`px-2 py-1 rounded ${newEditorTab === 'write' ? 'bg-cyan-700 text-white' : 'bg-gray-800 text-gray-300'}`}>Write</button>
                              <button type="button" onClick={() => setNewEditorTab('preview')} className={`px-2 py-1 rounded ${newEditorTab === 'preview' ? 'bg-cyan-700 text-white' : 'bg-gray-800 text-gray-300'}`}>Preview</button>
                            </div>
                          </div>

                          {newEditorTab === 'write' ? (
                            <textarea
                              value={newPost.content}
                              onChange={(e) => {
                                setNewPost(prev => ({ ...prev, content: e.target.value }));
                                calculateStats(e.target.value);
                              }}
                              placeholder="Write your post content in Markdown, use **bold**, _italic_, `code`, lists, headers, and more."
                              className="w-full h-64 bg-gray-900 text-gray-100 p-3 rounded resize-y font-mono"
                            />
                          ) : (
                            <div className="prose prose-invert max-w-none bg-gray-900 p-4 rounded">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{newPost.content || ''}</ReactMarkdown>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="coverImage">Cover Image URL</Label>
                  <Input
                    id="coverImage"
                    name="coverImage"
                    placeholder="https://example.com/image.jpg"
                    value={newPost.coverImage || ''}
                    onChange={handleNewPostChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagSelection(tag.name)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedTags.includes(tag.name)
                            ? 'bg-cyan-700 text-white'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a new tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddTag} variant="outline" disabled={isCreatingTag}>
                      {isCreatingTag ? 'Adding…' : 'Add'}
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={newPost.featured}
                      onCheckedChange={(checked) => handleNewPostSwitchChange('featured', checked)}
                    />
                    <Label htmlFor="featured">Feature Post</Label>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={newPost.status} onValueChange={handleNewPostStatusChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={BlogStatus.DRAFT}>Draft</SelectItem>
                        <SelectItem value={BlogStatus.PUBLISHED}>Published</SelectItem>
                        <SelectItem value={BlogStatus.UNLISTED}>Unlisted</SelectItem>
                        <SelectItem value={BlogStatus.ARCHIVED}>Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="pt-4">
              <div className="border border-gray-700 rounded-lg p-6 bg-black/50">
                <h1 className="text-2xl font-bold mb-4">{newPost.title || "Untitled Post"}</h1>
                {newPost.coverImage && (
                  <div className="mb-4">
                    <img 
                      src={newPost.coverImage} 
                      alt={newPost.title} 
                      className="rounded-lg max-h-56 object-cover" 
                    />
                  </div>
                )}
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{newPost.content || ''}</ReactMarkdown>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            {saveError && (
              <div className="flex-1 text-red-400 text-sm">
                {saveError}
              </div>
            )}
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleAddPost} disabled={isSaving}>
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Post
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Blog Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-950 border-cyan-500/30">
          {currentPost && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Edit Blog Post</DialogTitle>
                <DialogDescription>Update your blog post details</DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="editor" className="w-full">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                
                <TabsContent value="editor" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-title">Title</Label>
                      <Input
                        id="edit-title"
                        name="title"
                        placeholder="Enter post title"
                        value={currentPost.title}
                        onChange={handleEditPostChange}
                      />
                      {currentPost.title && (
                        <div className="text-xs text-gray-500 mt-1">
                          URL slug: <span className="font-mono">{currentPost.slug || generateSlug(currentPost.title)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-summary">Summary</Label>
                      <Textarea
                        id="edit-summary"
                        name="summary"
                        placeholder="Brief summary of your post"
                        value={currentPost.summary || ''}
                        onChange={handleEditPostChange}
                        rows={2}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Content</Label>
                      <div className="border border-gray-800 rounded-lg overflow-hidden">
                        <div className="p-3 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-300">Rich Text Editor</div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setEditorMode('rich')}
                                className={`px-3 py-1 rounded text-sm ${editorMode === 'rich' ? 'bg-cyan-700 text-white' : 'bg-gray-800 text-gray-300'}`}
                              >
                                <Type size={14} className="inline mr-1" /> Rich Text
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditorMode('markdown')}
                                className={`px-3 py-1 rounded text-sm ${editorMode === 'markdown' ? 'bg-cyan-700 text-white' : 'bg-gray-800 text-gray-300'}`}
                              >
                                <Hash size={14} className="inline mr-1" /> Markdown
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-xs text-gray-400">
                              {wordCount} words • {charCount} chars • {readingTime} min read
                            </div>
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={loadEnhancedDraft} className="text-xs text-gray-400 hover:text-white">
                                Load Draft
                              </button>
                              {lastSaved && (
                                <span className="text-xs text-green-400">
                                  Saved {format(lastSaved, 'HH:mm')}
                                </span>
                              )}
                              {isAutoSaving && (
                                <span className="text-xs text-yellow-400">Saving...</span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsFullScreen(true)}
                              className="text-gray-400 hover:text-white"
                            >
                              <Maximize size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="bg-black">
                          {editorMode === 'rich' ? (
                            <EnhancedEditor
                              value={currentPost.content}
                              onChange={(content) => {
                                if (currentPost) {
                                  setCurrentPost({ ...currentPost, content });
                                  calculateStats(stripHtml(content));
                                }
                              }}
                              placeholder="Edit your amazing blog post..."
                              isFullScreen={isFullScreen}
                              onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
                              wordCount={wordCount}
                              charCount={charCount}
                              readingTime={readingTime}
                            />
                          ) : (
                            <div className="p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex gap-1">
                                  <button type="button" onClick={() => setCurrentPost(prev => prev ? ({ ...prev, content: prev.content + '\n**bold**' }) : prev)} className="px-2 py-1 bg-gray-800 rounded text-sm">Bold</button>
                                  <button type="button" onClick={() => setCurrentPost(prev => prev ? ({ ...prev, content: prev.content + '\n_italic_' }) : prev)} className="px-2 py-1 bg-gray-800 rounded text-sm">Italic</button>
                                  <button type="button" onClick={() => setCurrentPost(prev => prev ? ({ ...prev, content: prev.content + '\n`code`' }) : prev)} className="px-2 py-1 bg-gray-800 rounded text-sm">Code</button>
                                </div>
                                <div className="ml-auto flex items-center gap-2">
                                  <button type="button" onClick={() => setEditEditorTab('write')} className={`px-2 py-1 rounded ${editEditorTab === 'write' ? 'bg-cyan-700 text-white' : 'bg-gray-800 text-gray-300'}`}>Write</button>
                                  <button type="button" onClick={() => setEditEditorTab('preview')} className={`px-2 py-1 rounded ${editEditorTab === 'preview' ? 'bg-cyan-700 text-white' : 'bg-gray-800 text-gray-300'}`}>Preview</button>
                                </div>
                              </div>

                              {editEditorTab === 'write' ? (
                                <textarea
                                  value={currentPost.content}
                                  onChange={(e) => {
                                    setCurrentPost(prev => prev ? ({ ...prev, content: e.target.value }) : prev);
                                    calculateStats(e.target.value);
                                  }}
                                  placeholder="Edit your post content in Markdown"
                                  className="w-full h-64 bg-gray-900 text-gray-100 p-3 rounded resize-y font-mono"
                                />
                              ) : (
                                <div className="prose prose-invert max-w-none bg-gray-900 p-4 rounded">
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentPost.content || ''}</ReactMarkdown>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-coverImage">Cover Image URL</Label>
                      <Input
                        id="edit-coverImage"
                        name="coverImage"
                        placeholder="https://example.com/image.jpg"
                        value={currentPost.coverImage || ''}
                        onChange={handleEditPostChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleEditTagSelection(tag.name)}
                            className={`px-3 py-1 rounded-full text-sm ${
                              currentPost.tags.some(t => t.name === tag.name)
                                ? 'bg-cyan-700 text-white'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="edit-featured"
                          checked={currentPost.featured}
                          onCheckedChange={(checked) => handleEditPostSwitchChange('featured', checked)}
                        />
                        <Label htmlFor="edit-featured">Feature Post</Label>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={currentPost.status} onValueChange={handleEditPostStatusChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={BlogStatus.DRAFT}>Draft</SelectItem>
                            <SelectItem value={BlogStatus.PUBLISHED}>Published</SelectItem>
                            <SelectItem value={BlogStatus.UNLISTED}>Unlisted</SelectItem>
                            <SelectItem value={BlogStatus.ARCHIVED}>Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="preview" className="pt-4">
                  <div className="border border-gray-700 rounded-lg p-6 bg-black/50">
                    <h1 className="text-2xl font-bold mb-4">{currentPost.title}</h1>
                    {currentPost.coverImage && (
                      <div className="mb-4">
                        <img 
                          src={currentPost.coverImage} 
                          alt={currentPost.title} 
                          className="rounded-lg max-h-56 object-cover" 
                        />
                      </div>
                    )}
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentPost.content || ''}</ReactMarkdown>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdatePost}>Update Post</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-gray-950 border-red-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl">Delete Blog Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {currentPost && (
            <div className="py-4">
              <p className="font-semibold">{currentPost.title}</p>
              <p className="text-gray-400 text-sm mt-2">{currentPost.summary || currentPost.content.substring(0, 100)}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeletePost}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Screen Editor Dialog */}
      <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
        <DialogContent className="max-w-full max-h-full w-full h-full bg-gray-950 border-cyan-500/30 p-0">
          <div className="flex flex-col h-full">
            <DialogHeader className="p-6 pb-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl">Full Screen Editor</DialogTitle>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-400">
                    {wordCount} words • {charCount} chars • {readingTime} min read
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(false)}>
                    <Minimize size={18} />
                  </Button>
                </div>
              </div>
            </DialogHeader>
            
            <div className="flex-1 p-6 overflow-hidden">
              <div className="h-full">
                <EnhancedEditor
                  value={newPost.content}
                  onChange={handleNewPostContentChange}
                  placeholder="Start writing your amazing blog post..."
                  isFullScreen={true}
                  wordCount={wordCount}
                  charCount={charCount}
                  readingTime={readingTime}
                  onToggleFullScreen={() => setIsFullScreen(false)}
                />
              </div>
            </div>
            
            <DialogFooter className="p-6 pt-4 border-t border-gray-800">
              <Button variant="outline" onClick={() => setIsFullScreen(false)}>Close</Button>
              <Button onClick={() => { setIsFullScreen(false); handleAddPost(); }}>Save & Close</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
