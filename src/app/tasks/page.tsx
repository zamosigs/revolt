"use client";

import React, { useState } from 'react';
import { 
  LayoutGrid, 
  List, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  ChevronRight,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDataStore } from '@/store/useDataStore';
import { TaskCard } from '@/features/tasks/TaskCard';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/ui/enterprise/PageHeader';
import { FilterToolbar } from '@/components/ui/enterprise/FilterToolbar';
import { Select } from '@/components/ui/enterprise/Select';
import { PersonnelSelector } from '@/components/ui/enterprise/PersonnelSelector';
import { useEmployees } from '@/hooks/useEmployees';
import { AddTaskModal } from '@/features/tasks/AddTaskModal';

const columns = [
  { id: 'Pending', label: 'To Do' },
  { id: 'In Progress', label: 'In Progress' },
  { id: 'Completed', label: 'Completed' },
  { id: 'Overdue', label: 'Overdue' },
];

export default function TasksPage() {
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const { tasks } = useDataStore();
  const { data: employees = [] } = useEmployees();
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const getAssigneeName = (id: string) => {
    const emp = employees.find(e => e.id === id);
    return emp?.full_name || emp?.name || 'Unassigned';
  };

  const priorityOptions = [
    { value: 'all', label: 'Priority Level' },
    { value: 'Critical', label: 'Critical' },
    { value: 'Standard', label: 'Standard' },
    { value: 'Low', label: 'Low Priority' }
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden gap-6">
      <PageHeader 
        title="Task Control" 
        subtitle="Strategic Operations Center & Mission Coordination"
        icon={LayoutGrid}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-secondary/50 border border-border/50 rounded-lg p-0.5">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setView('kanban')}
                className={cn("rounded-md h-7 px-3 text-[9px] font-black uppercase italic transition-all", view === 'kanban' ? "bg-brand-orange text-white shadow-md" : "text-muted-foreground")}
              >
                <LayoutGrid size={12} className="mr-1.5" />
                Board
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setView('table')}
                className={cn("rounded-md h-7 px-3 text-[9px] font-black uppercase italic transition-all", view === 'table' ? "bg-brand-orange text-white shadow-md" : "text-muted-foreground")}
              >
                <List size={12} className="mr-1.5" />
                Table
              </Button>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} size="sm" className="h-9 rounded-lg bg-brand-orange hover:bg-brand-orange/90 text-white font-black uppercase italic px-4 shadow-lg active:scale-95 transition-all text-[10px]">
              <Plus size={16} className="mr-1.5" />
              New Task
            </Button>
          </div>
        }
      />

      <FilterToolbar 
        searchPlaceholder="Search operational tasks..."
        filters={
          <div className="flex items-center gap-2">
            <PersonnelSelector 
              value={assigneeFilter} 
              onChange={setAssigneeFilter} 
              label=""
              placeholder="ALL ASSIGNEES"
              showWorkload={false}
            />
            <Select 
              options={priorityOptions} 
              value={priorityFilter} 
              onChange={setPriorityFilter} 
              className="w-36"
            />
          </div>
        }
      />

      <AnimatePresence mode="wait">
        {view === 'kanban' ? (
          <motion.div 
            key="kanban"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex gap-4 flex-1 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-brand-orange/20"
          >
            {columns.map((column) => (
              <div key={column.id} className="flex flex-col gap-2 min-w-[260px] max-w-[300px] flex-shrink-0 group/column">
                <div className="flex items-center justify-between bg-secondary/50 px-4 py-2.5 rounded-t-lg border-x border-t border-border/50 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-brand-orange animate-pulse" />
                    <h3 className="font-black italic uppercase text-[9px] tracking-[0.2em] text-foreground">{column.label}</h3>
                    <Badge variant="outline" className="rounded-md border-brand-orange/30 text-brand-orange text-[8px] font-black px-1.5 h-3.5 flex items-center">
                      {tasks.filter(t => t.status === column.id).length}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsAddModalOpen(true)} className="h-6 w-6 rounded-md hover:bg-brand-orange hover:text-white transition-all">
                    <Plus size={10} />
                  </Button>
                </div>
                
                <div className="flex flex-col gap-2 bg-secondary/10 p-2 rounded-b-lg border-x border-b border-border/50 min-h-[400px] shadow-inner">
                  {tasks
                    .filter(t => t.status === column.id)
                    .map((task) => (
                      <TaskCard 
                        key={task.id} 
                        task={{ ...task, assigneeName: getAssigneeName(task.assignee) }} 
                      />
                    ))
                  }
                  {tasks.filter(t => t.status === column.id).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center border-2 border-dashed border-border/20 rounded-xl opacity-30">
                      <p className="text-[9px] font-bold uppercase tracking-widest">No Active Tasks</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 overflow-hidden"
          >
            <Card className="overflow-hidden border-border/30 bg-secondary/10 backdrop-blur-md rounded-xl shadow-xl border">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/30 bg-secondary/30">
                      <th className="px-5 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Operational Task</th>
                      <th className="px-5 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Assignee</th>
                      <th className="px-5 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Status</th>
                      <th className="px-5 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Priority</th>
                      <th className="px-5 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">Deadline</th>
                      <th className="px-5 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-right text-muted-foreground italic">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {tasks.map((task) => (
                      <tr key={task.id} className="group hover:bg-brand-orange/[0.03] transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-black italic uppercase text-[11px] tracking-tight group-hover:text-brand-orange transition-colors">{task.title}</span>
                            <span className="text-[10px] font-medium text-muted-foreground line-clamp-1 max-w-xs opacity-70 italic">{task.description}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-md bg-brand-orange text-white flex items-center justify-center font-black italic text-[9px] shadow-sm">
                              {getAssigneeName(task.assignee).split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-tight opacity-80">{getAssigneeName(task.assignee)}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <Badge variant="outline" className="rounded-md border-border/50 text-[8px] font-black uppercase tracking-widest px-1.5 h-4">
                            {task.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          <Badge 
                            variant={task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'warning' : 'success'}
                            className="rounded-md text-[8px] font-black uppercase tracking-widest px-1.5 h-4"
                          >
                            {task.priority}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase italic opacity-70">
                            <Clock size={10} className="text-brand-orange" />
                            {task.deadline}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-secondary transition-all">
                            <MoreVertical size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AddTaskModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}
