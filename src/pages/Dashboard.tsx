import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { handleFirestoreError, OperationType } from "@/src/lib/error-handler";
import { useAuth } from "@/src/contexts/AuthContext";
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Activity
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!profile) return;

      try {
        const path = "projects";
        const projectsQuery = query(collection(db, path), where("ownerId", "==", profile.uid));
        const projectsSnap = await getDocs(projectsQuery).catch(err => {
          handleFirestoreError(err, OperationType.LIST, path);
          return { size: 0 } as any;
        });
        const projectsCount = projectsSnap.size;

        setStats(prev => ({ ...prev, totalProjects: projectsCount }));
        setLoading(false);
      } catch (err) {
        console.error("Dashboard Stats Error:", err);
      }
    }

    fetchStats();
  }, [profile]);

  const chartData = [
    { name: "Mon", tasks: 4 },
    { name: "Tue", tasks: 7 },
    { name: "Wed", tasks: 5 },
    { name: "Thu", tasks: 12 },
    { name: "Fri", tasks: 9 },
    { name: "Sat", tasks: 3 },
    { name: "Sun", tasks: 2 },
  ];

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="border-none shadow-sm hover:shadow-md transition-all rounded-3xl p-2">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`${color} p-3 rounded-2xl`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <Badge variant="secondary" className="bg-slate-50 text-slate-500 font-medium">This month</Badge>
        </div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-sm text-slate-500 mt-1">{title}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Howdy, {profile?.displayName?.split(" ")[0]}!</h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your projects today.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-full shadow-sm border border-slate-100 px-4 py-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">{format(new Date(), "MMMM do, yyyy")}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Projects" value={stats.totalProjects} icon={Briefcase} color="bg-blue-600" />
        <StatCard title="Completed Tasks" value={stats.completedTasks} icon={CheckCircle2} color="bg-emerald-600" />
        <StatCard title="Pending Tasks" value={stats.pendingTasks} icon={Clock} color="bg-amber-500" />
        <StatCard title="Overdue Tasks" value={stats.overdueTasks} icon={AlertCircle} color="bg-rose-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Productivity Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="border-b border-slate-50 p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Task Completion Trend
              </CardTitle>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <div className="flex items-center gap-1.5 text-blue-600">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  Performance
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-8">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }} 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="tasks" radius={[6, 6, 0, 0]} barSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 3 ? '#FF6321' : '#E2E8F0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-50 p-6">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="p-6 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                  <Avatar className="w-8 h-8 rounded-full border border-white">
                    <AvatarFallback className="bg-slate-100 text-xs">JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">John Doe</span> updated task 
                      <span className="font-semibold text-blue-600"> #PRO-124</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
