import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import useAuthStore from '../store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Plus, ListTodo, Search, AlertCircle } from 'lucide-react';
import CreateTaskModal from '@/components/CreateTaskModal';
import TaskDetailModal from '@/components/TaskDetailModal';
import StatusDropdown from '@/components/StatusDropdown';
import FilterDropdown from '@/components/FilterDropdown';
import { cn } from '@/lib/utils';

const Tasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const { user } = useAuthStore();

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      await api.put(`/tasks/${taskId}`, { status: newStatus });
    } catch (error) {
      console.error('Failed to update task status', error);
      fetchTasks();
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           task.project?.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !statusFilter || task.status === statusFilter;
      const matchesPriority = !priorityFilter || task.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'info';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center space-y-4">
        <div className="size-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
        <p className="text-sm text-muted-foreground font-black uppercase tracking-[0.2em] animate-pulse">Scanning Task Registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-[1600px] mx-auto pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tight bg-gradient-to-br from-white via-white to-white/20 bg-clip-text text-transparent">Task Registry</h2>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.25em] opacity-60">Strategic deployment and execution tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <FilterDropdown 
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'TODO', value: 'TODO' },
              { label: 'IN PROGRESS', value: 'IN_PROGRESS' },
              { label: 'COMPLETE', value: 'DONE' },
            ]}
          />
          <FilterDropdown 
            label="Priority"
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { label: 'HIGH', value: 'HIGH' },
              { label: 'MEDIUM', value: 'MEDIUM' },
              { label: 'LOW', value: 'LOW' },
            ]}
          />
          {user?.role === 'ADMIN' && (
            <Button 
              onClick={() => setIsCreateModalOpen(true)} 
              className="rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all h-11 font-black text-[10px] uppercase tracking-widest px-8"
            >
              <Plus className="size-4 mr-2" />
              New Task
            </Button>
          )}
        </div>
      </div>

      <Card className="border-white/10 bg-white/[0.02] backdrop-blur-xl rounded-[2.5rem] shadow-2xl relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <CardHeader className="border-b border-white/5 bg-white/[0.01] px-8 py-6 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-black tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent flex items-center gap-3">
            <ListTodo className="size-5 text-primary" />
            Active Tasks
          </CardTitle>
          <div className="relative group hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
            <input 
              placeholder="Filter Tasks..." 
              className="bg-white/[0.03] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-primary/50 transition-all w-64 shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTasks.length === 0 ? (
            <div className="py-32 text-center">
              <div className="size-20 rounded-[2rem] bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Search className="size-10 text-muted-foreground/20" />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/30 italic">No Matching Objectives Detected</p>
              {(statusFilter || priorityFilter || searchQuery) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-4 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10"
                  onClick={() => {
                    setStatusFilter('');
                    setPriorityFilter('');
                    setSearchQuery('');
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Task</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Parent Project</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Current Status</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Priority</TableHead>
                  <TableHead className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Deadline</TableHead>
                  <TableHead className="text-right px-8 font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Assigned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
                  
                  return (
                    <TableRow 
                      key={task._id} 
                      className="group hover:bg-white/[0.04] transition-all border-white/5 cursor-pointer relative"
                      onClick={() => {
                        setSelectedTask(task);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <TableCell className="px-8 py-6">
                        <div className="flex flex-col gap-1.5 relative z-10">
                          <span className="font-black text-base group-hover:text-primary transition-colors tracking-tight line-clamp-1">{task.title}</span>
                          {isOverdue && <span className="text-[9px] font-black text-destructive uppercase tracking-widest flex items-center gap-1"><AlertCircle className="size-3" /> Overdue</span>}
                        </div>
                      </TableCell>
                      <TableCell className="relative z-10">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/[0.03] border border-white/5 w-fit">
                          <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">{task.project?.title || 'GENERAL'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="relative z-10">
                        <StatusDropdown 
                          status={task.status} 
                          onStatusChange={(newStatus) => handleStatusChange(task._id, newStatus)} 
                        />
                      </TableCell>
                      <TableCell className="relative z-10">
                        <Badge variant={getPriorityColor(task.priority) as any} className="rounded-xl px-3 py-1 text-[9px] font-black uppercase tracking-widest shadow-lg">
                          {task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn("text-[10px] font-black uppercase tracking-widest relative z-10", isOverdue ? "text-destructive" : "text-muted-foreground/40")}>
                        {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'NO DEADLINE'}
                      </TableCell>
                      <TableCell className="text-right px-8 relative z-10">
                        <div className="flex items-center justify-end gap-2.5">
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity tracking-tighter">{task.assignedTo?.name || 'UNASSIGNED'}</span>
                          <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-[10px] font-black text-primary">
                            {task.assignedTo?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchTasks}
      />
      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default Tasks;
