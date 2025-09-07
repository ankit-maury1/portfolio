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
import { Plus, Pencil, Trash2, Calendar, GraduationCap, MapPin } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Define TypeScript types
interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location?: string;
  description?: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  current: boolean;
  logo?: string;
  order: number;
}

export default function EducationManagement() {
  const [educationItems, setEducationItems] = useState<Education[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentEducation, setCurrentEducation] = useState<Education | null>(null);
  const [newEducation, setNewEducation] = useState<Omit<Education, 'id'>>({
    institution: "",
    degree: "",
    field: "",
    location: "",
    description: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    current: false,
    logo: "",
    order: 0
  });
  
  // Fetch education items on component mount
  useEffect(() => {
    fetchEducationItems();
  }, []);

  const fetchEducationItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/education');
      if (!response.ok) {
        throw new Error('Failed to fetch education data');
      }
      
      const data = await response.json();
      setEducationItems(data);
    } catch (error) {
      console.error('Error fetching education data:', error);
      toast({
        title: "Error",
        description: "Failed to load education data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEducation = async () => {
    try {
      const response = await fetch('/api/education', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEducation),
      });

      if (!response.ok) {
        throw new Error('Failed to add education');
      }

      const addedEducation = await response.json();
      setEducationItems([...educationItems, addedEducation]);
      setIsAddDialogOpen(false);
      setNewEducation({
        institution: "",
        degree: "",
        field: "",
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
        description: "Education added successfully",
      });
    } catch (error) {
      console.error('Error adding education:', error);
      toast({
        title: "Error",
        description: "Failed to add education",
        variant: "destructive"
      });
    }
  };

  const handleEditEducation = async () => {
    if (!currentEducation) return;
    
    try {
      const response = await fetch(`/api/education/${currentEducation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentEducation),
      });

      if (!response.ok) {
        throw new Error('Failed to update education');
      }

      const updatedEducation = await response.json();
      setEducationItems(educationItems.map(edu => 
        edu.id === updatedEducation.id ? updatedEducation : edu
      ));
      
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Education updated successfully",
      });
    } catch (error) {
      console.error('Error updating education:', error);
      toast({
        title: "Error",
        description: "Failed to update education",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEducation = async () => {
    if (!currentEducation) return;
    
    try {
      const response = await fetch(`/api/education/${currentEducation.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete education');
      }

      setEducationItems(educationItems.filter(edu => edu.id !== currentEducation.id));
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Education deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting education:', error);
      toast({
        title: "Error",
        description: "Failed to delete education",
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
        <h2 className="text-2xl font-semibold text-white mb-6">Manage Education</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] bg-gray-900 border border-purple-500/30">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Education</DialogTitle>
              <DialogDescription>
                Add details about your educational background
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="institution" className="text-right text-white">
                  Institution
                </Label>
                <Input
                  id="institution"
                  className="col-span-3 bg-gray-800 border-gray-700 text-white"
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation({...newEducation, institution: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="degree" className="text-right text-white">
                  Degree
                </Label>
                <Input
                  id="degree"
                  className="col-span-3 bg-gray-800 border-gray-700 text-white"
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="field" className="text-right text-white">
                  Field of Study
                </Label>
                <Input
                  id="field"
                  className="col-span-3 bg-gray-800 border-gray-700 text-white"
                  value={newEducation.field}
                  onChange={(e) => setNewEducation({...newEducation, field: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right text-white">
                  Location
                </Label>
                <Input
                  id="location"
                  className="col-span-3 bg-gray-800 border-gray-700 text-white"
                  value={newEducation.location}
                  onChange={(e) => setNewEducation({...newEducation, location: e.target.value})}
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
                  value={newEducation.startDate}
                  onChange={(e) => setNewEducation({...newEducation, startDate: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="current" className="text-right text-white">
                  Currently Studying
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={newEducation.current} 
                    onCheckedChange={(checked) => setNewEducation({
                      ...newEducation, 
                      current: checked,
                      endDate: checked ? "" : newEducation.endDate
                    })} 
                  />
                  <Label htmlFor="current" className="text-white">
                    I'm currently studying here
                  </Label>
                </div>
              </div>
              
              {!newEducation.current && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endDate" className="text-right text-white">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    className="col-span-3 bg-gray-800 border-gray-700 text-white"
                    value={newEducation.endDate}
                    onChange={(e) => setNewEducation({...newEducation, endDate: e.target.value})}
                  />
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="logo" className="text-right text-white">
                  Institution Logo URL
                </Label>
                <Input
                  id="logo"
                  className="col-span-3 bg-gray-800 border-gray-700 text-white"
                  value={newEducation.logo}
                  onChange={(e) => setNewEducation({...newEducation, logo: e.target.value})}
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
                  value={newEducation.order}
                  onChange={(e) => setNewEducation({...newEducation, order: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right text-white">
                  Description
                </Label>
                <Textarea
                  id="description"
                  className="col-span-3 bg-gray-800 border-gray-700 text-white min-h-[100px]"
                  value={newEducation.description}
                  onChange={(e) => setNewEducation({...newEducation, description: e.target.value})}
                  placeholder="Describe your studies, achievements, etc."
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
                onClick={handleAddEducation}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                disabled={!newEducation.institution || !newEducation.degree || !newEducation.field}
              >
                Add Education
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : educationItems.length === 0 ? (
        <div className="text-center py-10">
          <GraduationCap className="h-16 w-16 mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl text-gray-300 mb-2">No education added yet</h3>
          <p className="text-gray-500 mb-6">Add your educational background to showcase your qualifications</p>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {educationItems.map((education) => (
            <motion.div 
              key={education.id}
              className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 hover:border-purple-500/50 transition-all duration-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between">
                <div className="flex items-start space-x-4">
                  {education.logo ? (
                    <div className="w-12 h-12 rounded-md bg-black/30 flex items-center justify-center overflow-hidden">
                      <img src={education.logo} alt={education.institution} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-purple-900/20 text-purple-500 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-white">{education.degree}</h3>
                    <div className="flex flex-wrap text-sm text-gray-400 mt-1">
                      <div className="flex items-center mr-4">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        {education.institution}
                      </div>
                      {education.location && (
                        <div className="flex items-center mr-4">
                          <MapPin className="h-3 w-3 mr-1" />
                          {education.location}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(education.startDate)} - {education.current ? "Present" : formatDate(education.endDate)}
                      </div>
                    </div>
                    <p className="text-gray-300 mt-2">{education.field}</p>
                    {education.description && <p className="text-gray-400 mt-2">{education.description}</p>}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Dialog open={isEditDialogOpen && currentEducation?.id === education.id} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20"
                        onClick={() => setCurrentEducation(education)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px] bg-gray-900 border border-purple-500/30">
                      <DialogHeader>
                        <DialogTitle className="text-white">Edit Education</DialogTitle>
                        <DialogDescription>
                          Update your educational background
                        </DialogDescription>
                      </DialogHeader>
                      
                      {currentEducation && (
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-institution" className="text-right text-white">
                              Institution
                            </Label>
                            <Input
                              id="edit-institution"
                              className="col-span-3 bg-gray-800 border-gray-700 text-white"
                              value={currentEducation.institution}
                              onChange={(e) => setCurrentEducation({...currentEducation, institution: e.target.value})}
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-degree" className="text-right text-white">
                              Degree
                            </Label>
                            <Input
                              id="edit-degree"
                              className="col-span-3 bg-gray-800 border-gray-700 text-white"
                              value={currentEducation.degree}
                              onChange={(e) => setCurrentEducation({...currentEducation, degree: e.target.value})}
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-field" className="text-right text-white">
                              Field of Study
                            </Label>
                            <Input
                              id="edit-field"
                              className="col-span-3 bg-gray-800 border-gray-700 text-white"
                              value={currentEducation.field}
                              onChange={(e) => setCurrentEducation({...currentEducation, field: e.target.value})}
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-location" className="text-right text-white">
                              Location
                            </Label>
                            <Input
                              id="edit-location"
                              className="col-span-3 bg-gray-800 border-gray-700 text-white"
                              value={currentEducation.location || ""}
                              onChange={(e) => setCurrentEducation({...currentEducation, location: e.target.value})}
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
                              value={currentEducation.startDate ? new Date(currentEducation.startDate).toISOString().split('T')[0] : ""}
                              onChange={(e) => setCurrentEducation({...currentEducation, startDate: e.target.value})}
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-current" className="text-right text-white">
                              Currently Studying
                            </Label>
                            <div className="flex items-center space-x-2">
                              <Switch 
                                checked={currentEducation.current} 
                                onCheckedChange={(checked) => setCurrentEducation({
                                  ...currentEducation, 
                                  current: checked,
                                  endDate: checked ? "" : currentEducation.endDate
                                })} 
                              />
                              <Label htmlFor="edit-current" className="text-white">
                                I'm currently studying here
                              </Label>
                            </div>
                          </div>
                          
                          {!currentEducation.current && (
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-endDate" className="text-right text-white">
                                End Date
                              </Label>
                              <Input
                                id="edit-endDate"
                                type="date"
                                className="col-span-3 bg-gray-800 border-gray-700 text-white"
                                value={currentEducation.endDate ? new Date(currentEducation.endDate).toISOString().split('T')[0] : ""}
                                onChange={(e) => setCurrentEducation({...currentEducation, endDate: e.target.value})}
                              />
                            </div>
                          )}
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-logo" className="text-right text-white">
                              Institution Logo URL
                            </Label>
                            <Input
                              id="edit-logo"
                              className="col-span-3 bg-gray-800 border-gray-700 text-white"
                              value={currentEducation.logo || ""}
                              onChange={(e) => setCurrentEducation({...currentEducation, logo: e.target.value})}
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
                              value={currentEducation.order}
                              onChange={(e) => setCurrentEducation({...currentEducation, order: parseInt(e.target.value) || 0})}
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-description" className="text-right text-white">
                              Description
                            </Label>
                            <Textarea
                              id="edit-description"
                              className="col-span-3 bg-gray-800 border-gray-700 text-white min-h-[100px]"
                              value={currentEducation.description || ""}
                              onChange={(e) => setCurrentEducation({...currentEducation, description: e.target.value})}
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
                          onClick={handleEditEducation}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={isDeleteDialogOpen && currentEducation?.id === education.id} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        onClick={() => setCurrentEducation(education)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[400px] bg-gray-900 border border-red-500/30">
                      <DialogHeader>
                        <DialogTitle className="text-white">Delete Education</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this education record? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      
                      {currentEducation && (
                        <div className="p-4 bg-red-900/10 border border-red-500/30 rounded-lg">
                          <h4 className="font-medium text-white">{currentEducation.degree}</h4>
                          <p className="text-gray-400 text-sm mt-1">{currentEducation.institution}</p>
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
                          onClick={handleDeleteEducation}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Delete Education
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
