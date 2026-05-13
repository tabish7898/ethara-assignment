import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { handleFirestoreError, OperationType } from "@/src/lib/error-handler";
import { useAuth } from "@/src/contexts/AuthContext";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Calendar, 
  Users, 
  Trash2,
  FolderOpen,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Projects() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // Create Project State
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    priority: "MEDIUM",
    deadline: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchProjects = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      // For mvp, fetch where user is owner.
      // In real app, we'd fetch all projects from projects collection where user is in 'members' subcollection.
      // But firestore rules prevent global collection listing if not owner/member.
      const q = query(collection(db, "projects"), where("ownerId", "==", profile.uid));
      const querySnapshot = await getDocs(q);
      const fetchedProjects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(fetchedProjects);
    } catch (err) {
      console.error("Error fetching projects:", err);
      toast.error("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [profile]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      const projectData = {
        ...newProject,
        ownerId: profile.uid,
        status: "ACTIVE",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "projects"), projectData);
      
      // Auto-add creator as Admin member using their UID as doc ID
      await setDoc(doc(db, `projects/${docRef.id}/members`, profile.uid), {
        userId: profile.uid,
        role: "ADMIN",
        joinedAt: serverTimestamp()
      });

      toast.success("Project created successfully!");
      setIsDialogOpen(false);
      setNewProject({ name: "", description: "", priority: "MEDIUM", deadline: "" });
      fetchProjects();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "projects");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project? All tasks will be lost.")) return;
    try {
      await deleteDoc(doc(db, "projects", projectId));
      toast.success("Project deleted.");
      fetchProjects();
    } catch (err) {
      console.error("Error deleting project:", err);
      toast.error("Permission denied.");
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage and track all your active team projects.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger 
            render={
              <Button className="bg-[#1a1a1a] hover:bg-black text-white rounded-full px-6 py-6 shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center">
                <Plus className="w-5 h-5" />
                New Project
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[425px] rounded-3xl overflow-hidden p-0 border-none shadow-2xl">
            <div className="bg-[#1a1a1a] p-8 text-white">
              <DialogTitle className="text-2xl font-bold tracking-tight">Create Project</DialogTitle>
              <p className="text-slate-400 text-sm mt-1">Fill in the details to start a new workspace.</p>
            </div>
            <form onSubmit={handleCreateProject} className="p-8 space-y-5 bg-white">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-widest font-semibold text-slate-500">Project Name</Label>
                <Input 
                  id="name" 
                  required
                  placeholder="e.g. Design System v2" 
                  className="rounded-xl border-slate-200 focus:ring-slate-900 h-11"
                  value={newProject.name}
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-semibold text-slate-500 text-slate-500">Priority</Label>
                <Select 
                  value={newProject.priority}
                  onValueChange={val => setNewProject({...newProject, priority: val})}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 h-11">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline" className="text-xs uppercase tracking-widest font-semibold text-slate-500">Deadline</Label>
                <Input 
                  id="deadline" 
                  type="date"
                  className="rounded-xl border-slate-200 h-11"
                  value={newProject.deadline}
                  onChange={e => setNewProject({...newProject, deadline: e.target.value})}
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full bg-[#1a1a1a] hover:bg-black text-white h-12 rounded-xl">Initialize Project</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Search projects..." 
          className="pl-11 rounded-full bg-white border-none shadow-sm h-12 focus:ring-1 focus:ring-slate-200"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <FolderOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-600">No projects found</h3>
          <p className="text-slate-400 mt-1">Start your first project to begin managing tasks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="border-none shadow-sm hover:shadow-xl transition-all rounded-3xl group overflow-hidden bg-white">
              <CardContent className="p-0">
                <div 
                  className="p-6 cursor-pointer" 
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-[#1a1a1a] group-hover:text-white transition-colors">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        onClick={(e) => e.stopPropagation()}
                        render={
                          <Button variant="ghost" size="icon" className="text-slate-400 rounded-full">
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDeleteProject(project.id)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-2 truncate">
                    {project.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Badge variant="secondary" className={`${
                      project.priority === 'HIGH' ? 'bg-rose-50 text-rose-600' :
                      project.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600' :
                      'bg-emerald-50 text-emerald-600'
                    } border-none rounded-full px-3 py-0.5`}>
                      {project.priority}
                    </Badge>
                    <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-none rounded-full px-3 py-0.5">
                      {project.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-medium">
                        {project.deadline ? format(new Date(project.deadline), "MMM dd") : "No deadline"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 justify-end">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-medium">4 Members</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
