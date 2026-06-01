import { create } from 'zustand';
import employeesData from '../data/employees.json';
import tasksData from '../data/tasks.json';
import payrollData from '../data/payroll.json';
import reportsData from '../data/reports.json';
import clientsData from '../data/clients.json';
import loadsData from '../data/loads.json';

interface DataState {
  employees: typeof employeesData;
  tasks: typeof tasksData;
  payroll: typeof payrollData;
  reports: typeof reportsData;
  clients: typeof clientsData;
  loads: typeof loadsData;
  
  // Actions
  addTask: (task: any) => void;
  updateTaskStatus: (taskId: string, status: string) => void;
  addReport: (report: any) => void;
  addClient: (client: any) => void;
  updateClient: (client: any) => void;
  addLoad: (load: any) => void;
  updateLoadStatus: (loadId: string, status: string) => void;
}

export const useDataStore = create<DataState>((set) => ({
  employees: employeesData,
  tasks: tasksData,
  payroll: payrollData,
  reports: reportsData,
  clients: clientsData,
  loads: loadsData,
  
  addTask: (task) => set((state) => ({ 
    tasks: [...state.tasks, { ...task, id: `task_${Date.now()}` }] 
  })),
  
  updateTaskStatus: (taskId, status) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === taskId ? { ...t, status } : t)
  })),
  
  addReport: (report) => set((state) => ({ 
    reports: [...state.reports, { ...report, id: `rep_${Date.now()}` }] 
  })),
  
  addClient: (client) => set((state) => ({ 
    clients: [...state.clients, { ...client, id: `cli_${Date.now()}` }] 
  })),
  
  updateClient: (updatedClient) => set((state) => ({
    clients: state.clients.map((c) => c.id === updatedClient.id ? updatedClient : c)
  })),
  
  addLoad: (load) => set((state) => ({ 
    loads: [...state.loads, { ...load, id: `load_${Math.floor(Math.random() * 9000) + 1000}` }] 
  })),
  
  updateLoadStatus: (loadId, status) => set((state) => ({
    loads: state.loads.map((l) => l.id === loadId ? { ...l, status } : l)
  })),
}));
