"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { X, Plus, Pencil, Trash2, ExternalLink, Image } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Types
type Project = {
  id: string;
  title: string;
  description: string;
  image: string;
  status: string;
  category: string;
  featured: boolean;
  liveUrl: string;
  githubUrl: string;
  technologies: string[]; // display names
  skillIds: string[]; // actual IDs used in API
};

interface SkillOption { id: string; name: string; }

export default function ProjectsManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<SkillOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        
        // Transform data to match our frontend Project type
        const formattedProjects: Project[] = data.map((p: {
          id: string;
          title: string;
          description: string;
          coverImage?: string;
          status?: string;
          category?: string;
          featured: boolean;
          liveUrl?: string;
          githubUrl?: string;
          skills?: Array<{ name: string; id?: string; _id?: string }>;
        }) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          image: p.coverImage || '',
          status: p.status || 'completed',
          category: p.category || 'frontend',
          featured: p.featured,
          liveUrl: p.liveUrl || '',
          githubUrl: p.githubUrl || '',
          technologies: p.skills?.map((ps) => ps.name) || [],
          skillIds: p.skills?.map((ps) => ps.id || ps._id)?.filter(Boolean) || []
        }));
        
        setProjects(formattedProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  // Fetch skills for selection
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch('/api/skills');
        if (!res.ok) return;
        const data = await res.json();
        const options: SkillOption[] = data.map((s: { id?: string; _id?: string; name: string }) => ({ 
          id: s.id || s._id, 
          name: s.name 
        }));
        setSkills(options);
      } catch (e) {
        console.error('Failed to load skills', e);
      }
    };
    fetchSkills();
  }, []);

  // Define the project type
  // duplicate type removed

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState<Omit<Project, 'id' | 'skillIds'> & {id?: string, skillIds?: string[]}>({
    title: "",
    description: "",
    image: "",
    status: "planned",
    category: "frontend",
    featured: false,
    liveUrl: "",
    githubUrl: "",
    technologies: [],
    skillIds: []
  });

  // Inline 'Other' category text inputs
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [editCategoryInput, setEditCategoryInput] = useState("");

  // For technology tags input
  const [newTech, setNewTech] = useState("");

  const addTechnology = (project: Project | (Omit<Project, 'id' | 'skillIds'> & {id?: string, skillIds?: string[]}), tech: string) => {
    if (!tech.trim()) return;
    if (project.technologies.includes(tech.trim())) return;
    
    const updatedTech = [...project.technologies, tech.trim()];
    if (project === newProject) {
      setNewProject({...newProject, technologies: updatedTech});
    } else if (currentProject) {
      setCurrentProject({...currentProject, technologies: updatedTech});
    }
    setNewTech("");
  };

  const removeTechnology = (project: Project | (Omit<Project, 'id' | 'skillIds'> & {id?: string, skillIds?: string[]}), techToRemove: string) => {
    const updatedTech = project.technologies.filter((tech: string) => tech !== techToRemove);
    if (project === newProject) {
      setNewProject({...newProject, technologies: updatedTech});
    } else if (currentProject) {
      setCurrentProject({...currentProject, technologies: updatedTech});
    }
  };

  // Toggle skill selection (shared for add/edit dialogs)
  const toggleSkill = <T extends Project | (Omit<Project, 'id' | 'skillIds'> & {id?: string, skillIds?: string[]})>(
    skillId: string,
    skillName: string,
    project: T,
    setProject: (p: T) => void
  ) => {
    const currentIds: string[] = project.skillIds || [];
    const has = currentIds.includes(skillId);
    const nextIds = has ? currentIds.filter(id => id !== skillId) : [...currentIds, skillId];
    const techNames = skills.filter(s => nextIds.includes(s.id)).map(s => s.name);
    setProject({ ...project, skillIds: nextIds, technologies: techNames } as T);
  };

  const normalizeUrl = (val: string) => {
    if (!val) return '';
    const trimmed = val.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const handleAddProject = async () => {
    try {
      // Create API payload
      const categoryToUse = newProject.category === '__other' ? (newCategoryInput.trim() || 'general') : newProject.category;

      const projectData = {
        title: newProject.title,
        description: newProject.description,
        coverImage: newProject.image,
        featured: newProject.featured,
        liveUrl: normalizeUrl(newProject.liveUrl),
        githubUrl: normalizeUrl(newProject.githubUrl),
        status: newProject.status,
        category: categoryToUse,
        skills: newProject.skillIds || []
      };
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create project');
      }
      
      const createdProject = await response.json();
      
      // Transform to match our Project type
      const formattedProject: Project = {
        id: createdProject.id,
        title: createdProject.title,
        description: createdProject.description,
        image: createdProject.coverImage || '',
        status: createdProject.status || 'completed',
        category: createdProject.category || 'frontend',
        featured: createdProject.featured,
  liveUrl: createdProject.liveUrl || '',
  githubUrl: createdProject.githubUrl || '',
        technologies: (createdProject.skills || []).map((s: any) => s.name) || [],
        skillIds: (createdProject.skills || []).map((s: any) => s.id || s._id) || []
      };
      
      setProjects([...projects, formattedProject]);
      setNewProject({
        title: "",
        description: "",
        image: "",
        status: "planned",
        category: "frontend",
        featured: false,
        liveUrl: "",
        githubUrl: "",
        technologies: [],
        skillIds: []
      });
      setIsAddDialogOpen(false);
  setNewCategoryInput("");
      
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Failed to create project. Please try again.');
    }
  };

  const handleEditProject = async () => {
    if (!currentProject) return;
    
    try {
      // Create API payload
      const categoryToUse = currentProject.category === '__other' ? (editCategoryInput.trim() || 'general') : currentProject.category;

      const projectData = {
        title: currentProject.title,
        description: currentProject.description,
        coverImage: currentProject.image,
        featured: currentProject.featured,
        liveUrl: normalizeUrl(currentProject.liveUrl),
        githubUrl: normalizeUrl(currentProject.githubUrl),
        status: currentProject.status,
        category: categoryToUse,
        skills: currentProject.skillIds
      };
      
      const response = await fetch(`/api/projects/${currentProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update project');
      }
      
      const updatedProject = await response.json();
      
          // Update projects in state
          const updatedProjects = projects.map(proj => 
            proj.id === currentProject.id ? {
              ...proj,
              title: updatedProject.title,
              description: updatedProject.description,
              image: updatedProject.coverImage || '',
              featured: updatedProject.featured,
              liveUrl: updatedProject.liveUrl || '',
              githubUrl: updatedProject.githubUrl || '',
              status: updatedProject.status || proj.status,
              category: updatedProject.category || proj.category,
              technologies: (updatedProject.skills || []).map((s: { name: string }) => s.name) || proj.technologies,
              skillIds: (updatedProject.skills || []).map((s: { id?: string; _id?: string }) => s.id || s._id) || proj.skillIds
            } : proj
          );
      
  setProjects(updatedProjects);
  setIsEditDialogOpen(false);
  setEditCategoryInput("");
      
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Failed to update project. Please try again.');
    }
  };

  const handleDeleteProject = async () => {
    if (!currentProject) return;
    
    try {
      const response = await fetch(`/api/projects/${currentProject.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
      
      const filteredProjects = projects.filter(proj => proj.id !== currentProject.id);
      setProjects(filteredProjects);
      setIsDeleteDialogOpen(false);
      
    } catch (err) {
      console.error('Error deleting project:', err);
      setError('Failed to delete project. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white mb-6">Manage Projects</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] bg-gray-900 border border-cyan-500/30">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Project</DialogTitle>
              <DialogDescription>
                Create a new project for your portfolio.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right text-white">
                  Title
                </Label>
                <Input
                  id="title"
                  className="col-span-3 bg-gray-800 border-gray-700 text-white"
                  value={newProject.title}
                  onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right text-white">
                  Description
                </Label>
                <Textarea
                  id="description"
                  className="col-span-3 bg-gray-800 border-gray-700 text-white min-h-[100px]"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right text-white">
                  Image URL
                </Label>
                <div className="col-span-3 flex">
                  <Input
                    id="image"
                    className="flex-1 bg-gray-800 border-gray-700 text-white"
                    value={newProject.image}
                    onChange={(e) => setNewProject({...newProject, image: e.target.value})}
                  />
                  <Button variant="outline" size="icon" className="ml-2 border-gray-700">
                    <Image className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right text-white">
                  Status
                </Label>
                <Select
                  value={newProject.status}
                  onValueChange={(value) => setNewProject({...newProject, status: value})}
                >
                  <SelectTrigger className="col-span-3 bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right text-white">
                  Category
                </Label>
                <Select
                  value={newProject.category}
                  onValueChange={(value) => setNewProject({...newProject, category: value})}
                >
                  <SelectTrigger className="col-span-3 bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                  {Array.from(new Set(projects.map(p => p.category).filter(Boolean))).length > 0 ? (
                                    <>
                                      {Array.from(new Set(projects.map(p => p.category).filter(Boolean))).map((c) => (
                                        <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                                      ))}
                                      <SelectItem value="__other">Other</SelectItem>
                                    </>
                                  ) : (
                                    <>
                                      <SelectItem value="frontend">Frontend</SelectItem>
                                      <SelectItem value="backend">Backend</SelectItem>
                                      <SelectItem value="fullstack">Fullstack</SelectItem>
                                      <SelectItem value="mobile">Mobile</SelectItem>
                                      <SelectItem value="design">Design</SelectItem>
                                      <SelectItem value="__other">Other</SelectItem>
                                    </>
                                  )}
                                </SelectContent>
                </Select>
                              {newProject.category === '__other' && (
                                <div className="col-span-3 mt-2">
                                  <Input
                                    placeholder="Enter new category"
                                    className="bg-gray-800 border-gray-700 text-white"
                                    value={newCategoryInput}
                                    onChange={(e) => setNewCategoryInput(e.target.value)}
                                  />
                                </div>
                              )}
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="featured" className="text-right text-white">
                  Featured
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={newProject.featured} 
                    onCheckedChange={(checked) => setNewProject({...newProject, featured: checked})} 
                  />
                  <Label htmlFor="featured" className="text-white">
                    Show on homepage
                  </Label>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="liveUrl" className="text-right text-white">
                  Live URL
                </Label>
                <Input
                  id="liveUrl"
                  className="col-span-3 bg-gray-800 border-gray-700 text-white"
                  value={newProject.liveUrl}
                  onChange={(e) => setNewProject({...newProject, liveUrl: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="githubUrl" className="text-right text-white">
                  GitHub URL
                </Label>
                <Input
                  id="githubUrl"
                  className="col-span-3 bg-gray-800 border-gray-700 text-white"
                  value={newProject.githubUrl}
                  onChange={(e) => setNewProject({...newProject, githubUrl: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="technologies" className="text-right text-white">
                  Technologies
                </Label>
                <div className="col-span-3 space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Select Skills</p>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border border-gray-800 p-2 rounded">
                      {skills.map(skill => {
                        const active = (newProject.skillIds || []).includes(skill.id);
                        return (
                          <button
                            type="button"
                            key={skill.id}
                            onClick={() => toggleSkill(skill.id, skill.name, newProject, setNewProject)}
                            className={`px-2 py-1 rounded text-xs border ${active ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/40' : 'text-gray-400 border-gray-700 hover:border-cyan-600 hover:text-cyan-300'}`}
                          >
                            {skill.name}
                          </button>
                        );
                      })}
                      {skills.length === 0 && <span className="text-xs text-gray-500">No skills loaded</span>}
                    </div>
                  </div>
                  <div className="flex">
                    <Input
                      id="technologies"
                      className="flex-1 bg-gray-800 border-gray-700 text-white"
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      placeholder="Add technology and press Enter"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTechnology(newProject, newTech);
                        }
                      }}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-2 border-gray-700"
                      onClick={() => addTechnology(newProject, newTech)}
                    >
                      Add
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {newProject.technologies.map((tech, idx) => (
                      <span 
                        key={idx} 
                        className="px-2 py-1 bg-cyan-900/30 text-cyan-400 rounded-full flex items-center text-xs"
                      >
                        {tech}
                        <button 
                          onClick={() => removeTechnology(newProject, tech)}
                          className="ml-1 text-cyan-400 hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddProject}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                disabled={!newProject.title}
              >
                Add Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Projects Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400">Project Name</th>
              <th className="text-left py-3 px-4 text-gray-400">Status</th>
              <th className="text-left py-3 px-4 text-gray-400">Category</th>
              <th className="text-left py-3 px-4 text-gray-400">Featured</th>
              <th className="text-left py-3 px-4 text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <motion.tr 
                key={project.id} 
                className="border-b border-gray-800 hover:bg-gray-800/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="py-3 px-4 text-white">{project.title}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    project.status === 'completed' ? "bg-green-900/30 text-green-400" : 
                    project.status === 'in-progress' ? "bg-yellow-900/30 text-yellow-400" : 
                    "bg-blue-900/30 text-blue-400"
                  }`}>
                    {project.status === 'completed' ? "Completed" : 
                     project.status === 'in-progress' ? "In Progress" : "Planned"}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-300 capitalize">
                  {project.category}
                </td>
                <td className="py-3 px-4">
                  {project.featured ? (
                    <span className="px-2 py-1 bg-purple-900/30 text-purple-400 rounded-full text-xs">
                      Featured
                    </span>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex space-x-2">
                    {/* Edit Dialog */}
                    <Dialog open={isEditDialogOpen && currentProject?.id === project.id} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/20"
                          onClick={() => setCurrentProject(project)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[550px] bg-gray-900 border border-cyan-500/30">
                        <DialogHeader>
                          <DialogTitle className="text-white">Edit Project</DialogTitle>
                          <DialogDescription>
                            Update the project details.
                          </DialogDescription>
                        </DialogHeader>
                        
                        {currentProject && (
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-title" className="text-right text-white">
                                Title
                              </Label>
                              <Input
                                id="edit-title"
                                className="col-span-3 bg-gray-800 border-gray-700 text-white"
                                value={currentProject.title}
                                onChange={(e) => setCurrentProject({...currentProject, title: e.target.value})}
                              />
                            </div>
                            
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-description" className="text-right text-white">
                                Description
                              </Label>
                              <Textarea
                                id="edit-description"
                                className="col-span-3 bg-gray-800 border-gray-700 text-white min-h-[100px]"
                                value={currentProject.description}
                                onChange={(e) => setCurrentProject({...currentProject, description: e.target.value})}
                              />
                            </div>
                            
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-image" className="text-right text-white">
                                Image URL
                              </Label>
                              <div className="col-span-3 flex">
                                <Input
                                  id="edit-image"
                                  className="flex-1 bg-gray-800 border-gray-700 text-white"
                                  value={currentProject.image}
                                  onChange={(e) => setCurrentProject({...currentProject, image: e.target.value})}
                                />
                                <Button variant="outline" size="icon" className="ml-2 border-gray-700">
                                  <Image className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-status" className="text-right text-white">
                                Status
                              </Label>
                              <Select
                                value={currentProject.status}
                                onValueChange={(value) => setCurrentProject({...currentProject, status: value})}
                              >
                                <SelectTrigger className="col-span-3 bg-gray-800 border-gray-700 text-white">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                  <SelectItem value="planned">Planned</SelectItem>
                                  <SelectItem value="in-progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-category" className="text-right text-white">
                                Category
                              </Label>
                              <Select
                                value={currentProject.category}
                                onValueChange={(value) => setCurrentProject({...currentProject, category: value})}
                              >
                                <SelectTrigger className="col-span-3 bg-gray-800 border-gray-700 text-white">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                  {Array.from(new Set(projects.map(p => p.category).filter(Boolean))).length > 0 ? (
                                    <>
                                      {Array.from(new Set(projects.map(p => p.category).filter(Boolean))).map((c) => (
                                        <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                                      ))}
                                      <SelectItem value="__other">Other</SelectItem>
                                    </>
                                  ) : (
                                    <>
                                      <SelectItem value="frontend">Frontend</SelectItem>
                                      <SelectItem value="backend">Backend</SelectItem>
                                      <SelectItem value="fullstack">Fullstack</SelectItem>
                                      <SelectItem value="mobile">Mobile</SelectItem>
                                      <SelectItem value="design">Design</SelectItem>
                                      <SelectItem value="__other">Other</SelectItem>
                                    </>
                                  )}
                                </SelectContent>
                              </Select>
                              {currentProject?.category === '__other' && (
                                <div className="col-span-3 mt-2">
                                  <Input
                                    placeholder="Enter new category"
                                    className="bg-gray-800 border-gray-700 text-white"
                                    value={editCategoryInput}
                                    onChange={(e) => setEditCategoryInput(e.target.value)}
                                  />
                                </div>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-featured" className="text-right text-white">
                                Featured
                              </Label>
                              <div className="flex items-center space-x-2">
                                <Switch 
                                  checked={currentProject.featured} 
                                  onCheckedChange={(checked) => setCurrentProject({...currentProject, featured: checked})} 
                                />
                                <Label htmlFor="edit-featured" className="text-white">
                                  Show on homepage
                                </Label>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-liveUrl" className="text-right text-white">
                                Live URL
                              </Label>
                              <Input
                                id="edit-liveUrl"
                                className="col-span-3 bg-gray-800 border-gray-700 text-white"
                                value={currentProject.liveUrl}
                                onChange={(e) => setCurrentProject({...currentProject, liveUrl: e.target.value})}
                              />
                            </div>
                            
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-githubUrl" className="text-right text-white">
                                GitHub URL
                              </Label>
                              <Input
                                id="edit-githubUrl"
                                className="col-span-3 bg-gray-800 border-gray-700 text-white"
                                value={currentProject.githubUrl}
                                onChange={(e) => setCurrentProject({...currentProject, githubUrl: e.target.value})}
                              />
                            </div>
                            
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-technologies" className="text-right text-white">
                                Technologies
                              </Label>
                              <div className="col-span-3 space-y-4">
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">Select Skills</p>
                                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border border-gray-800 p-2 rounded">
                                    {skills.map(skill => {
                                      const active = (currentProject.skillIds || []).includes(skill.id);
                                      return (
                                        <button
                                          type="button"
                                          key={skill.id}
                                          onClick={() => toggleSkill(skill.id, skill.name, currentProject, setCurrentProject)}
                                          className={`px-2 py-1 rounded text-xs border ${active ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500/40' : 'text-gray-400 border-gray-700 hover:border-cyan-600 hover:text-cyan-300'}`}
                                        >
                                          {skill.name}
                                        </button>
                                      );
                                    })}
                                    {skills.length === 0 && <span className="text-xs text-gray-500">No skills loaded</span>}
                                  </div>
                                </div>
                                <div className="flex">
                                  <Input
                                    id="edit-technologies"
                                    className="flex-1 bg-gray-800 border-gray-700 text-white"
                                    value={newTech}
                                    onChange={(e) => setNewTech(e.target.value)}
                                    placeholder="Add technology and press Enter"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        addTechnology(currentProject, newTech);
                                      }
                                    }}
                                  />
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="ml-2 border-gray-700"
                                    onClick={() => addTechnology(currentProject, newTech)}
                                  >
                                    Add
                                  </Button>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                  {currentProject.technologies.map((tech, idx) => (
                                    <span 
                                      key={idx} 
                                      className="px-2 py-1 bg-cyan-900/30 text-cyan-400 rounded-full flex items-center text-xs"
                                    >
                                      {tech}
                                      <button 
                                        onClick={() => removeTechnology(currentProject, tech)}
                                        className="ml-1 text-cyan-400 hover:text-white"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsEditDialogOpen(false)}
                            className="border-gray-700 text-white hover:bg-gray-800"
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleEditProject}
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                          >
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    {/* Delete Dialog */}
                    <Dialog open={isDeleteDialogOpen && currentProject?.id === project.id} onOpenChange={setIsDeleteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          onClick={() => setCurrentProject(project)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[400px] bg-gray-900 border border-red-500/30">
                        <DialogHeader>
                          <DialogTitle className="text-white">Delete Project</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this project? This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        
                        {currentProject && (
                          <div className="py-4">
                            <div className="p-4 rounded-lg bg-red-900/10 border border-red-500/30">
                              <h4 className="text-white font-medium">{currentProject.title}</h4>
                              <p className="text-gray-400 text-sm mt-1">{currentProject.description}</p>
                            </div>
                          </div>
                        )}
                        
                        <DialogFooter>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="border-gray-700 text-white hover:bg-gray-800"
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleDeleteProject}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            Delete Project
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    {/* View Button */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      asChild
                      className="text-gray-400 hover:text-gray-300 hover:bg-gray-800/50"
                    >
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
