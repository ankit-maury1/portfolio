"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Calendar, Briefcase, MapPin } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Define TypeScript types
interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string;
  description: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  current: boolean;
  logo?: string;
  order: number;
}

export default function ExperienceManagement() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentExperience, setCurrentExperience] = useState<Experience | null>(null);
  const [newExperience, setNewExperience] = useState<Omit<Experience, 'id'>>({
    title: "",
    company: "",
    location: "",
    description: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    current: false,
    logo: "",
    order: 0
  });
  
  // Fetch experiences on component mount
  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/experiences');
      if (!response.ok) {
        throw new Error('Failed to fetch experiences');
      }
      
      const data = await response.json();
      setExperiences(data);
    } catch (error) {
      console.error('Error fetching experiences:', error);
      toast({
        title: "Error",
        description: "Failed to load experiences",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExperience = async () => {
    try {
      const response = await fetch('/api/experiences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExperience),
      });

      if (!response.ok) {
        throw new Error('Failed to add experience');
      }

      const addedExperience = await response.json();
      setExperiences([...experiences, addedExperience]);
      setIsAddDialogOpen(false);
      setNewExperience({
        title: "",
        company: "",
        location: "",
        description: "",
        startDate: new Date().toISOString().split('T')[0],
        endDate: "",
        current: false,
        logo: "",
        order: 0
      });
      
      toast({
        title: "Success",
        description: "Experience added successfully",
      });
    } catch (error) {
      console.error('Error adding experience:', error);
      toast({
        title: "Error",
        description: "Failed to add experience",
        variant: "destructive"
      });
    }
  };

  const handleEditExperience = async () => {
    if (!currentExperience) return;
    
    try {
      const response = await fetch(`/api/experiences/${currentExperience.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentExperience),
      });

      if (!response.ok) {
        throw new Error('Failed to update experience');
      }

      const updatedExperience = await response.json();
      setExperiences(experiences.map(exp => 
        exp.id === updatedExperience.id ? updatedExperience : exp
      ));
      
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Experience updated successfully",
      });
    } catch (error) {
      console.error('Error updating experience:', error);
      toast({
        title: "Error",
        description: "Failed to update experience",
        variant: "destructive"
      });
    }
  };

  const handleDeleteExperience = async () => {
    if (!currentExperience) return;
    
    try {
      const response = await fetch(`/api/experiences/${currentExperience.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete experience');
      }

      setExperiences(experiences.filter(exp => exp.id !== currentExperience.id));
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Experience deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting experience:', error);
      toast({
        title: "Error",
        description: "Failed to delete experience",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Present";
    return format(new Date(dateString), 'MMM yyyy');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white mb-6">Manage Work Experience</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] bg-gray-900 border border-cyan-500/30">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Experience</DialogTitle>
              <DialogDescription>
                Add details about your work experience
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right text-white">
                  Job Title
                </Label>
                <Input
                  id="title"
                  className="col-span-3 bg-gray-800 border-gray-700 text-white"
                  value={newExperience.title}
                  onChange={(e) => setNewExperience({...newExperience, title: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company" className="text-right text-white">
                  Company
                </Label>
                <Input
                  id="company"
                  className="col-span-3 bg-gray-800 border-gray-700 text-white"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right text-white">
                  Location
                </Label>
                <Input
                  id="location"
                  className="col-span-3 bg-gray-800 border-gray-700 text-white"
                  value={newExperience.location}
                  onChange={(e) => setNewExperience({...newExperience, location: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right text-white">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  className="col-span-3 bg-gray-800 border-gray-700 text-white"
                  value={newExperience.startDate}
                  onChange={(e) => setNewExperience({...newExperience, startDate: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="current" className="text-right text-white">
                  Current Job
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={newExperience.current} 
                    onCheckedChange={(checked) => setNewExperience({
                      ...newExperience, 
                      current: checked,
                      endDate: checked ? "" : newExperience.endDate
                    })} 
                  />
                  <Label htmlFor="current" className="text-white">
                    I currently work here
                  </Label>
                </div>
              </div>
              
              {!newExperience.current && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endDate" className="text-right text-white">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    className="col-span-3 bg-gray-800 border-gray-700 text-white"
                    value={newExperience.endDate}
                    onChange={(e) => setNewExperience({...newExperience, endDate: e.target.value})}
                  />
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="logo" className="text-right text-white">
                  Company Logo URL
                </Label>
                <Input
                  id="logo"
                  className="col-span-3 bg-gray-800 border-gray-700 text-white"
                  value={newExperience.logo}
                  onChange={(e) => setNewExperience({...newExperience, logo: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="order" className="text-right text-white">
                  Display Order
                </Label>
                <Input
                  id="order"
                  type="number"
                  className="col-span-3 bg-gray-800 border-gray-700 text-white"
                  value={newExperience.order}
                  onChange={(e) => setNewExperience({...newExperience, order: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right text-white">
                  Description
                </Label>
                <Textarea
                  id="description"
                  className="col-span-3 bg-gray-800 border-gray-700 text-white min-h-[100px]"
                  value={newExperience.description}
                  onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                  placeholder="Describe your responsibilities and achievements..."
                />
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
                onClick={handleAddExperience}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                disabled={!newExperience.title || !newExperience.company || !newExperience.description}
              >
                Add Experience
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      ) : experiences.length === 0 ? (
        <div className="text-center py-10">
          <Briefcase className="h-16 w-16 mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl text-gray-300 mb-2">No experiences added yet</h3>
          <p className="text-gray-500 mb-6">Add your work history to showcase your professional experience</p>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Experience
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((experience) => (
            <motion.div 
              key={experience.id}
              className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 hover:border-cyan-500/50 transition-all duration-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between">
                <div className="flex items-start space-x-4">
                  {experience.logo ? (
                    <div className="w-12 h-12 rounded-md bg-black/30 flex items-center justify-center overflow-hidden">
                      <img src={experience.logo} alt={experience.company} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-cyan-900/20 text-cyan-500 flex items-center justify-center">
                      <Briefcase className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-white">{experience.title}</h3>
                    <div className="flex flex-wrap text-sm text-gray-400 mt-1">
                      <div className="flex items-center mr-4">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {experience.company}
                      </div>
                      {experience.location && (
                        <div className="flex items-center mr-4">
                          <MapPin className="h-3 w-3 mr-1" />
                          {experience.location}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(experience.startDate)} - {experience.current ? "Present" : formatDate(experience.endDate)}
                      </div>
                    </div>
                    <p className="text-gray-300 mt-3">{experience.description}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Dialog open={isEditDialogOpen && currentExperience?.id === experience.id} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/20"
                        onClick={() => setCurrentExperience(experience)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px] bg-gray-900 border border-cyan-500/30">
                      <DialogHeader>
                        <DialogTitle className="text-white">Edit Experience</DialogTitle>
                        <DialogDescription>
                          Update your work experience details
                        </DialogDescription>
                      </DialogHeader>
                      
                      {currentExperience && (
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-title" className="text-right text-white">
                              Job Title
                            </Label>
                            <Input
                              id="edit-title"
                              className="col-span-3 bg-gray-800 border-gray-700 text-white"
                              value={currentExperience.title}
                              onChange={(e) => setCurrentExperience({...currentExperience, title: e.target.value})}
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-company" className="text-right text-white">
                              Company
                            </Label>
                            <Input
                              id="edit-company"
                              className="col-span-3 bg-gray-800 border-gray-700 text-white"
                              value={currentExperience.company}
                              onChange={(e) => setCurrentExperience({...currentExperience, company: e.target.value})}
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-location" className="text-right text-white">
                              Location
                            </Label>
                            <Input
                              id="edit-location"
                              className="col-span-3 bg-gray-800 border-gray-700 text-white"
                              value={currentExperience.location || ""}
                              onChange={(e) => setCurrentExperience({...currentExperience, location: e.target.value})}
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-startDate" className="text-right text-white">
                              Start Date
                            </Label>
                            <Input
                              id="edit-startDate"
                              type="date"
                              className="col-span-3 bg-gray-800 border-gray-700 text-white"
                              value={currentExperience.startDate ? new Date(currentExperience.startDate).toISOString().split('T')[0] : ""}
                              onChange={(e) => setCurrentExperience({...currentExperience, startDate: e.target.value})}
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-current" className="text-right text-white">
                              Current Job
                            </Label>
                            <div className="flex items-center space-x-2">
                              <Switch 
                                checked={currentExperience.current} 
                                onCheckedChange={(checked) => setCurrentExperience({
                                  ...currentExperience, 
                                  current: checked,
                                  endDate: checked ? "" : currentExperience.endDate
                                })} 
                              />
                              <Label htmlFor="edit-current" className="text-white">
                                I currently work here
                              </Label>
                            </div>
                          </div>
                          
                          {!currentExperience.current && (
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-endDate" className="text-right text-white">
                                End Date
                              </Label>
                              <Input
                                id="edit-endDate"
                                type="date"
                                className="col-span-3 bg-gray-800 border-gray-700 text-white"
                                value={currentExperience.endDate ? new Date(currentExperience.endDate).toISOString().split('T')[0] : ""}
                                onChange={(e) => setCurrentExperience({...currentExperience, endDate: e.target.value})}
                              />
                            </div>
                          )}
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-logo" className="text-right text-white">
                              Company Logo URL
                            </Label>
                            <Input
                              id="edit-logo"
                              className="col-span-3 bg-gray-800 border-gray-700 text-white"
                              value={currentExperience.logo || ""}
                              onChange={(e) => setCurrentExperience({...currentExperience, logo: e.target.value})}
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-order" className="text-right text-white">
                              Display Order
                            </Label>
                            <Input
                              id="edit-order"
                              type="number"
                              className="col-span-3 bg-gray-800 border-gray-700 text-white"
                              value={currentExperience.order}
                              onChange={(e) => setCurrentExperience({...currentExperience, order: parseInt(e.target.value) || 0})}
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-description" className="text-right text-white">
                              Description
                            </Label>
                            <Textarea
                              id="edit-description"
                              className="col-span-3 bg-gray-800 border-gray-700 text-white min-h-[100px]"
                              value={currentExperience.description}
                              onChange={(e) => setCurrentExperience({...currentExperience, description: e.target.value})}
                            />
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
                          onClick={handleEditExperience}
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                        >
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={isDeleteDialogOpen && currentExperience?.id === experience.id} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        onClick={() => setCurrentExperience(experience)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px] bg-gray-900 border border-red-500/30">
                      <DialogHeader>
                        <DialogTitle className="text-white">Delete Experience</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this experience? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      
                      {currentExperience && (
                        <div className="p-4 bg-red-900/10 border border-red-500/30 rounded-lg">
                          <h4 className="font-medium text-white">{currentExperience.title}</h4>
                          <p className="text-gray-400 text-sm mt-1">{currentExperience.company}</p>
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
                          onClick={handleDeleteExperience}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Delete Experience
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
