import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  orderBy,
  where,
  getDocs,
  setDoc
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { handleFirestoreError, OperationType } from "@/src/lib/error-handler";
import { useAuth } from "@/src/contexts/AuthContext";
import { 
  Plus, 
  MoreVertical, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  ChevronRight,
  ShieldCheck,
  UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const { profile } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Task form state
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
    status: "TODO"
  });
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    // Fetch Project
    const fetchDoc = async () => {
      try {
        const docRef = doc(db, "projects", projectId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() });
        } else {
          toast.error("Project not found");
          navigate("/projects");
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `projects/${projectId}`);
      }
    };
    fetchDoc();

    // Real-time Tasks
    const qTasks = query(
      collection(db, `projects/${projectId}/tasks`),
      orderBy("createdAt", "desc")
    );
    const unsubscribeTasks = onSnapshot(qTasks, { includeMetadataChanges: true }, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(taskList);
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, `projects/${projectId}/tasks`);
    });

    // Real-time Members
    const qMembers = query(collection(db, `projects/${projectId}/members`));
    const unsubscribeMembers = onSnapshot(qMembers, { includeMetadataChanges: true }, (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeTasks();
      unsubscribeMembers();
    };
  }, [projectId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    try {
      await addDoc(collection(db, `projects/${projectId}/tasks`), {
        ...newTask,
        projectId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        assigneeId: profile?.uid
      });
      toast.success("Task created");
      setIsTaskDialogOpen(false);
      setNewTask({ title: "", description: "", priority: "MEDIUM", dueDate: "", status: "TODO" });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `projects/${projectId}/tasks`);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await updateDoc(doc(db, `projects/${projectId}/tasks`, taskId), {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `projects/${projectId}/tasks/${taskId}`);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    try {
      await deleteDoc(doc(db, `projects/${projectId}/tasks`, taskId));
      toast.success("Task deleted");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `projects/${projectId}/tasks/${taskId}`);
    }
  };

  const TaskColumn = ({ title, status }: { title: string, status: string }) => {
    const columnTasks = tasks.filter(t => t.status === status);
    return (
      <div className="flex-1 min-w-[280px] sm:min-w-[320px] flex flex-col h-full bg-slate-100/50 rounded-3xl p-4 snap-start">
        <div className="flex items-center justify-between px-2 mb-6">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-700">{title}</h3>
            <Badge variant="secondary" className="bg-white text-slate-400 border-none rounded-full px-2 py-0.5">
              {columnTasks.length}
            </Badge>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-400 hover:text-slate-900 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setNewTask(prev => ({ ...prev, status }));
              setIsTaskDialogOpen(true);
            }}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          <AnimatePresence>
            {columnTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border-none shadow-sm hover:shadow-md transition-all rounded-2xl group cursor-grab active:cursor-grabbing">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="secondary" className={`${
                        task.priority === 'HIGH' ? 'bg-rose-50 text-rose-600' :
                        task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600' :
                        'bg-emerald-50 text-emerald-600'
                      } border-none rounded-full px-2 py-0.5 text-[10px] font-bold`}>
                        {task.priority}
                      </Badge>
                      <button 
                        onClick={() => updateTaskStatus(task.id, status === 'TODO' ? 'IN_PROGRESS' : status === 'IN_PROGRESS' ? 'COMPLETED' : 'TODO')}
                        className="text-slate-300 hover:text-slate-900 transition-colors"
                      >
                        <CheckCircle2 className={`w-5 h-5 ${task.status === 'COMPLETED' ? 'text-emerald-500' : ''}`} />
                      </button>
                    </div>
                    <h4 className="font-semibold text-slate-900 mb-2 leading-snug">{task.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">{task.description}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-1.5 text-slate-400 px-2 py-1 rounded-full bg-slate-50">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium">
                          {task.dueDate ? format(new Date(task.dueDate), "MMM dd") : "No due date"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-400 hover:text-rose-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Avatar className="w-6 h-6 border-2 border-white">
                          <AvatarFallback className="bg-blue-50 text-[10px] font-bold text-blue-600">JD</AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    try {
      // For invite, we'd normally search for user by email.
      // Here we'll search the global 'users' collection.
      const q = query(collection(db, "users"), where("email", "==", inviteEmail));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        toast.error("User not found. They must login to ProFlow first.");
        return;
      }

      const invitedUser = snap.docs[0].data();
      const invitedUid = snap.docs[0].id;

      // Add to members subcollection using user's UID as doc ID
      await setDoc(doc(db, `projects/${projectId}/members`, invitedUid), {
        userId: invitedUid,
        role: "MEMBER",
        joinedAt: serverTimestamp()
      });

      toast.success(`Invited ${invitedUser.displayName}`);
      setIsInviteDialogOpen(false);
      setInviteEmail("");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `projects/${projectId}/members`);
    }
  };

  if (loading && !project) return <div className="flex items-center justify-center h-screen bg-[#f5f5f5]">Loading Board...</div>;

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Breadcrumbs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <button 
            onClick={() => navigate("/projects")} 
            className="text-slate-400 hover:text-slate-900 transition-colors whitespace-nowrap text-sm font-medium"
          >
            Projects
          </button>
          <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 truncate">
            {project?.name}
          </h1>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <div className="flex -space-x-2 overflow-hidden">
            {members.slice(0, 3).map((m) => (
              <Avatar key={m.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white">
                <AvatarFallback className="text-[10px] bg-slate-100 uppercase">U</AvatarFallback>
              </Avatar>
            ))}
            {members.length > 3 && (
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-50 text-[10px] font-bold text-slate-400 ring-2 ring-white">
                +{members.length - 3}
              </div>
            )}
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger
                render={
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-900 border border-slate-200">
                    <UserPlus className="w-4 h-4" />
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-md rounded-3xl overflow-hidden p-0 border-none">
                <div className="bg-[#1a1a1a] px-8 py-6 text-white">
                  <DialogTitle className="text-xl font-bold">Invite Member</DialogTitle>
                  <p className="text-slate-400 text-xs">Invite a teammate to collaborate on this project.</p>
                </div>
                <form onSubmit={handleInviteMember} className="p-8 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold ml-1">Email Address</Label>
                    <Input 
                      required 
                      type="email"
                      className="rounded-xl h-11"
                      placeholder="e.g. teammate@company.com"
                      value={inviteEmail} 
                      onChange={e => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <DialogFooter className="pt-4">
                    <Button type="submit" className="w-full bg-[#1a1a1a] rounded-xl h-12">Send Invitation</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
            <DialogTrigger
              render={
                <Button className="bg-[#1a1a1a] hover:bg-black text-white rounded-full px-4 sm:px-6 h-10 sm:h-11 shadow-lg text-xs sm:text-sm">
                  <Plus className="w-4 h-4 mr-1.5 sm:mr-2" />
                  Add Task
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md rounded-3xl overflow-hidden p-0 border-none">
              <div className="bg-[#1a1a1a] px-8 py-6 text-white">
                <DialogTitle className="text-xl font-bold">New Task</DialogTitle>
                <p className="text-slate-400 text-xs">Define a new objective for this project.</p>
              </div>
              <form onSubmit={handleCreateTask} className="p-8 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold ml-1">Task Title</Label>
                  <Input 
                    required 
                    className="rounded-xl h-11"
                    placeholder="Describe what needs to be done..."
                    value={newTask.title} 
                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold ml-1">Priority</Label>
                    <Select value={newTask.priority} onValueChange={v => setNewTask({...newTask, priority: v})}>
                      <SelectTrigger className="rounded-xl h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold ml-1">Due Date</Label>
                    <Input type="date" className="rounded-xl h-11" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full bg-[#1a1a1a] rounded-xl h-12">Create Task</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 flex gap-4 sm:gap-6 overflow-x-auto pb-6 items-start min-h-0 snap-x snap-mandatory">
        <TaskColumn title="To Do" status="TODO" />
        <TaskColumn title="In Progress" status="IN_PROGRESS" />
        <TaskColumn title="Completed" status="COMPLETED" />
      </div>
    </div>
  );
}
