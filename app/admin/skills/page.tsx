"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Define TypeScript types
interface Skill {
  id: string;
  name: string;
  level: number; // 1-100
  category: string;
  icon?: string;
  featured: boolean;
}

interface SkillCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  order: number;
}

export default function SkillsManagement() {
  const [categories, setCategories] = useState<SkillCategory[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch skills and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch categories
        const categoriesResponse = await fetch('/api/skill-categories');
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
        
        // Update newSkill with first category if available
        if (categoriesData.length > 0) {
          setNewSkill(prev => ({...prev, category: categoriesData[0].id}));
        }
        
        // Fetch skills
        const skillsResponse = await fetch('/api/skills');
        if (!skillsResponse.ok) {
          throw new Error('Failed to fetch skills');
        }
        const skillsData = await skillsResponse.json();
        
        // Transform data to match our component's expectations
        const transformedSkills = skillsData.map((skill: any) => ({
          id: skill.id,
          name: skill.name,
          level: skill.proficiency,
          category: skill.categoryId,
          icon: skill.icon,
          featured: skill.featured
        }));
        
        setSkills(transformedSkills);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load skills data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  const [isAddSkillDialogOpen, setIsAddSkillDialogOpen] = useState(false);
  const [isEditSkillDialogOpen, setIsEditSkillDialogOpen] = useState(false);
  const [isDeleteSkillDialogOpen, setIsDeleteSkillDialogOpen] = useState(false);
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  
  const [currentSkill, setCurrentSkill] = useState<Skill | null>(null);
  const [currentCategory, setCurrentCategory] = useState<SkillCategory | null>(null);
  
  const [newSkill, setNewSkill] = useState<Skill>({
    id: "",
    name: "",
    level: 50,
    category: "", // Will be updated when categories are loaded
    icon: "",
    featured: false
  });
  
  const [newCategory, setNewCategory] = useState<SkillCategory>({
    id: "",
    name: "",
    description: "",
    icon: "",
    order: categories.length + 1
  });
  
  // Skill CRUD operations
  const handleAddSkill = async () => {
    try {
      // Transform the skill data to match the API expectations
      const skillData = {
        name: newSkill.name,
        proficiency: newSkill.level,
        icon: newSkill.icon,
        categoryId: newSkill.category,
        featured: newSkill.featured
      };
      
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(skillData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create skill');
      }
      
      const createdSkill = await response.json();
      
      // Transform the response to match our component's data structure
      const skillToAdd: Skill = {
        id: createdSkill.id,
        name: createdSkill.name,
        level: createdSkill.proficiency,
        category: createdSkill.categoryId,
        icon: createdSkill.icon,
        featured: createdSkill.featured
      };
      
      setSkills([...skills, skillToAdd]);
      setIsAddSkillDialogOpen(false);
      resetNewSkill();
      
      toast({
        title: "Success",
        description: `Skill "${skillToAdd.name}" has been created.`,
      });
    } catch (error: any) {
      console.error('Error adding skill:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create skill. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleEditSkill = async () => {
    if (!currentSkill) return;
    
    try {
      // Transform the skill data to match the API expectations
      const skillData = {
        name: currentSkill.name,
        proficiency: currentSkill.level,
        icon: currentSkill.icon,
        categoryId: currentSkill.category,
        featured: currentSkill.featured
      };
      
      const response = await fetch(`/api/skills/${currentSkill.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(skillData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update skill');
      }
      
      // Update the local state
      const updatedSkills = skills.map(skill => 
        skill.id === currentSkill.id ? currentSkill : skill
      );
      setSkills(updatedSkills);
      setIsEditSkillDialogOpen(false);
      
      toast({
        title: "Success",
        description: `Skill "${currentSkill.name}" has been updated.`,
      });
    } catch (error: any) {
      console.error('Error updating skill:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update skill. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteSkill = async () => {
    if (!currentSkill) return;
    
    try {
      const response = await fetch(`/api/skills/${currentSkill.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete skill');
      }
      
      // Update the local state
      const filteredSkills = skills.filter(skill => skill.id !== currentSkill.id);
      setSkills(filteredSkills);
      setIsDeleteSkillDialogOpen(false);
      
      toast({
        title: "Success",
        description: `Skill "${currentSkill.name}" has been deleted.`,
      });
    } catch (error: any) {
      console.error('Error deleting skill:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete skill. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Category CRUD operations
  const handleAddCategory = async () => {
    try {
      const response = await fetch('/api/skill-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newCategory.name,
          description: newCategory.description,
          icon: newCategory.icon,
          order: newCategory.order
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create category');
      }
      
      const createdCategory = await response.json();
      
      setCategories([...categories, createdCategory]);
      setIsAddCategoryDialogOpen(false);
      setNewCategory({
        id: "",
        name: "",
        description: "",
        icon: "",
        order: categories.length + 2
      });
      
      toast({
        title: "Success",
        description: `Category "${createdCategory.name}" has been created.`,
      });
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create category. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const resetNewSkill = () => {
    setNewSkill({
      id: "",
      name: "",
      level: 50,
      category: categories.length > 0 ? categories[0].id : "",
      icon: "",
      featured: false
    });
  };
  
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white mb-6">Manage Skills</h2>
        {isLoading ? (
          <div className="flex items-center">
            <div className="w-6 h-6 border-2 border-t-cyan-500 border-r-cyan-500 border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></div>
            <span className="text-cyan-500">Loading...</span>
          </div>
        ) : (
          <div className="flex gap-2">
          <Dialog open={isAddCategoryDialogOpen} onOpenChange={setIsAddCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button className="border border-cyan-500/30 text-white bg-transparent hover:bg-cyan-900/20">
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-gray-900 border border-cyan-500/30">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Category</DialogTitle>
                <DialogDescription>
                  Create a new category for your skills.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category-name" className="text-right text-white">
                    Name
                  </Label>
                  <Input
                    id="category-name"
                    className="col-span-3 bg-gray-800 border-gray-700 text-white"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category-description" className="text-right text-white">
                    Description
                  </Label>
                  <Textarea
                    id="category-description"
                    className="col-span-3 bg-gray-800 border-gray-700 text-white min-h-[80px]"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category-icon" className="text-right text-white">
                    Icon (emoji)
                  </Label>
                  <Input
                    id="category-icon"
                    className="col-span-3 bg-gray-800 border-gray-700 text-white"
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                    placeholder="Emoji or icon URL"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category-order" className="text-right text-white">
                    Display Order
                  </Label>
                  <Input
                    id="category-order"
                    type="number"
                    min="1"
                    className="col-span-3 bg-gray-800 border-gray-700 text-white"
                    value={newCategory.order}
                    onChange={(e) => setNewCategory({...newCategory, order: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddCategoryDialogOpen(false)}
                  className="border-gray-700 text-white hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddCategory}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  disabled={!newCategory.name}
                >
                  Add Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddSkillDialogOpen} onOpenChange={setIsAddSkillDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Skill
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-gray-900 border border-cyan-500/30">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Skill</DialogTitle>
                <DialogDescription>
                  Add a new skill to your portfolio.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="skill-name" className="text-right text-white">
                    Name
                  </Label>
                  <Input
                    id="skill-name"
                    className="col-span-3 bg-gray-800 border-gray-700 text-white"
                    value={newSkill.name}
                    onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="skill-level" className="text-right text-white">
                    Level (1-100)
                  </Label>
                  <div className="col-span-3 flex items-center gap-4">
                    <Input
                      id="skill-level"
                      type="range"
                      min="1"
                      max="100"
                      className="flex-1 bg-gray-800 accent-cyan-500"
                      value={newSkill.level}
                      onChange={(e) => setNewSkill({...newSkill, level: parseInt(e.target.value)})}
                    />
                    <span className="text-white">{newSkill.level}%</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="skill-category" className="text-right text-white">
                    Category
                  </Label>
                  <select
                    id="skill-category"
                    className="col-span-3 bg-gray-800 border-gray-700 text-white rounded-md p-2"
                    value={newSkill.category}
                    onChange={(e) => setNewSkill({...newSkill, category: e.target.value})}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="skill-icon" className="text-right text-white">
                    Icon URL
                  </Label>
                  <Input
                    id="skill-icon"
                    className="col-span-3 bg-gray-800 border-gray-700 text-white"
                    value={newSkill.icon || ''}
                    onChange={(e) => setNewSkill({...newSkill, icon: e.target.value})}
                    placeholder="Icon URL or emoji"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="skill-featured" className="text-right text-white">
                    Featured
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="skill-featured"
                      checked={newSkill.featured} 
                      onCheckedChange={(checked) => setNewSkill({...newSkill, featured: checked})}
                    />
                    <Label htmlFor="skill-featured" className="text-white">
                      Show as featured skill
                    </Label>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddSkillDialogOpen(false)}
                  className="border-gray-700 text-white hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddSkill}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  disabled={!newSkill.name}
                >
                  Add Skill
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        )}
      </div>
      
      {/* Categories Section */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Skill Categories</h3>
        {!isLoading && categories.length === 0 ? (
          <div className="p-8 text-center rounded-lg border border-dashed border-gray-700 bg-gray-800/20">
            <h4 className="text-lg font-medium text-gray-400 mb-2">No categories found</h4>
            <p className="text-sm text-gray-500 mb-4">Start by adding your first skill category.</p>
            <Button 
              onClick={() => setIsAddCategoryDialogOpen(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Category
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
            <motion.div
              key={category.id}
              className="p-4 rounded-lg border border-gray-700 bg-gray-800/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{category.icon}</span>
                    <h4 className="text-white font-medium">{category.name}</h4>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{category.description}</p>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <span className="mr-2">Order: {category.order}</span>
                    <span>{skills.filter(skill => skill.category === category.id).length} skills</span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                    <GripVertical className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-cyan-400 hover:text-cyan-300">
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-300">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        )}
      </div>
      
      {/* Skills Section */}
      <div>
        <h3 className="text-lg font-medium text-white mb-3">Skills</h3>
        {!isLoading && skills.length === 0 ? (
          <div className="p-8 text-center rounded-lg border border-dashed border-gray-700 bg-gray-800/20">
            <h4 className="text-lg font-medium text-gray-400 mb-2">No skills found</h4>
            <p className="text-sm text-gray-500 mb-4">
              {categories.length === 0 
                ? "Create a category first, then add skills to it." 
                : "Start by adding your first skill."}
            </p>
            <Button 
              onClick={() => setIsAddSkillDialogOpen(true)}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
              disabled={categories.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Skill
            </Button>
          </div>
        ) : skills.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400">Name</th>
                  <th className="text-left py-3 px-4 text-gray-400">Level</th>
                  <th className="text-left py-3 px-4 text-gray-400">Category</th>
                  <th className="text-left py-3 px-4 text-gray-400">Featured</th>
                  <th className="text-left py-3 px-4 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {skills.map((skill) => (
                <motion.tr
                  key={skill.id}
                  className="border-b border-gray-800 hover:bg-gray-800/30"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {skill.icon && (
                        <span className="text-lg">{skill.icon.includes('/') ? '🔗' : skill.icon}</span>
                      )}
                      <span className="text-white">{skill.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-xs">{skill.level}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {getCategoryName(skill.category)}
                  </td>
                  <td className="py-3 px-4">
                    {skill.featured ? (
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
                      <Dialog open={isEditSkillDialogOpen && currentSkill?.id === skill.id} onOpenChange={setIsEditSkillDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/20"
                            onClick={() => setCurrentSkill({...skill})}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] bg-gray-900 border border-cyan-500/30">
                          <DialogHeader>
                            <DialogTitle className="text-white">Edit Skill</DialogTitle>
                            <DialogDescription>
                              Update skill details.
                            </DialogDescription>
                          </DialogHeader>
                          
                          {currentSkill && (
                            <div className="grid gap-4 py-4">
                              {/* Similar fields as Add Skill dialog */}
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-skill-name" className="text-right text-white">
                                  Name
                                </Label>
                                <Input
                                  id="edit-skill-name"
                                  className="col-span-3 bg-gray-800 border-gray-700 text-white"
                                  value={currentSkill.name}
                                  onChange={(e) => setCurrentSkill({...currentSkill, name: e.target.value})}
                                />
                              </div>
                              
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-skill-level" className="text-right text-white">
                                  Level (1-100)
                                </Label>
                                <div className="col-span-3 flex items-center gap-4">
                                  <Input
                                    id="edit-skill-level"
                                    type="range"
                                    min="1"
                                    max="100"
                                    className="flex-1 bg-gray-800 accent-cyan-500"
                                    value={currentSkill.level}
                                    onChange={(e) => setCurrentSkill({...currentSkill, level: parseInt(e.target.value)})}
                                  />
                                  <span className="text-white">{currentSkill.level}%</span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-skill-category" className="text-right text-white">
                                  Category
                                </Label>
                                <select
                                  id="edit-skill-category"
                                  className="col-span-3 bg-gray-800 border-gray-700 text-white rounded-md p-2"
                                  value={currentSkill.category}
                                  onChange={(e) => setCurrentSkill({...currentSkill, category: e.target.value})}
                                >
                                  {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                      {category.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-skill-icon" className="text-right text-white">
                                  Icon URL
                                </Label>
                                <Input
                                  id="edit-skill-icon"
                                  className="col-span-3 bg-gray-800 border-gray-700 text-white"
                                  value={currentSkill.icon || ''}
                                  onChange={(e) => setCurrentSkill({...currentSkill, icon: e.target.value})}
                                  placeholder="Icon URL or emoji"
                                />
                              </div>
                              
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-skill-featured" className="text-right text-white">
                                  Featured
                                </Label>
                                <div className="flex items-center space-x-2">
                                  <Switch 
                                    id="edit-skill-featured"
                                    checked={currentSkill.featured} 
                                    onCheckedChange={(checked) => setCurrentSkill({...currentSkill, featured: checked})}
                                  />
                                  <Label htmlFor="edit-skill-featured" className="text-white">
                                    Show as featured skill
                                  </Label>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => setIsEditSkillDialogOpen(false)}
                              className="border-gray-700 text-white hover:bg-gray-800"
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleEditSkill}
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                            >
                              Save Changes
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      
                      {/* Delete Dialog */}
                      <Dialog open={isDeleteSkillDialogOpen && currentSkill?.id === skill.id} onOpenChange={setIsDeleteSkillDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            onClick={() => setCurrentSkill({...skill})}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[400px] bg-gray-900 border border-red-500/30">
                          <DialogHeader>
                            <DialogTitle className="text-white">Delete Skill</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this skill? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          
                          {currentSkill && (
                            <div className="py-4">
                              <div className="p-4 rounded-lg bg-red-900/10 border border-red-500/30">
                                <h4 className="text-white font-medium">{currentSkill.name}</h4>
                                <p className="text-gray-400 text-sm mt-1">{getCategoryName(currentSkill.category)}</p>
                              </div>
                            </div>
                          )}
                          
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => setIsDeleteSkillDialogOpen(false)}
                              className="border-gray-700 text-white hover:bg-gray-800"
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleDeleteSkill}
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              Delete Skill
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}
