"use client";

import React from 'react';
import { Combobox } from './Combobox';
import { useEmployees } from '@/hooks/useEmployees';
import { useDataStore } from '@/store/useDataStore';

interface PersonnelSelectorProps {
  value: string;
  onChange: (value: string) => void;
  role?: 'DISPATCHER' | 'SUPER_ADMIN' | 'OPERATIONS_MANAGER' | 'ACCOUNTANT' | 'CEO' | 'ADMIN' | 'all';
  label?: string;
  placeholder?: string;
  showWorkload?: boolean;
  includeAll?: boolean;
}

export function PersonnelSelector({
  value,
  onChange,
  role = 'all',
  label = "Select Personnel",
  placeholder = "Search personnel...",
  showWorkload = true,
  includeAll = true
}: PersonnelSelectorProps) {
  const { data: employees = [], isLoading } = useEmployees();
  const { clients, tasks } = useDataStore();

  const filteredEmployees = employees.filter(emp => {
    // Handle both database casing and JSON casing
    const empRole = (emp.role || '').toUpperCase();
    const targetRole = role.toUpperCase();
    
    const matchesRole = targetRole === 'ALL' || empRole === targetRole;
    const isActive = (emp.status || '').toUpperCase() === 'ACTIVE';
    
    const isVisible = matchesRole && isActive;
    
    if (role === 'DISPATCHER' && !isVisible) {
      console.log(`PersonnelSelector [${emp.full_name || emp.name}]: MatchesRole: ${matchesRole} (${empRole} vs ${targetRole}), IsActive: ${isActive} (${emp.status})`);
    }
    
    return isVisible;
  });

  if (role === 'DISPATCHER') {
    console.log('PersonnelSelector [DISPATCHER] Result Count:', filteredEmployees.length);
  }

  const employeeOptions = filteredEmployees.map(emp => {
    // Calculate workload metadata
    const clientCount = clients.filter((c: any) => (c.assigned_dispatcher_id || c.assignedDispatcher) === emp.id).length;
    const taskCount = tasks.filter(t => t.assignee === emp.id && (t.status || '').toUpperCase() !== 'COMPLETED').length;
    
    const empRole = (emp.role || '').toUpperCase();
    let description = (emp.role || 'Personnel').replace('_', ' ').toUpperCase();
    
    if (showWorkload) {
      if (empRole === 'DISPATCHER') {
        description += ` • ${clientCount} ACTIVE CLIENTS`;
      } else {
        description += ` • ${taskCount} PENDING MISSIONS`;
      }
    }

    return {
      value: emp.id,
      label: emp.full_name || emp.name || 'UNKNOWN PERSONNEL',
      description,
      status: ((emp.status || '').toUpperCase() === 'ACTIVE' ? 'active' : 'inactive') as 'active' | 'inactive'
    };
  });

  const options = includeAll 
    ? [{ value: 'all', label: placeholder || 'ALL PERSONNEL', description: 'SHOW ALL ACTIVE RECORDS' }, ...employeeOptions]
    : employeeOptions;

  const empRole = role.toUpperCase();

  return (
    <Combobox
      label={label}
      options={options}
      value={value}
      onChange={onChange}
      placeholder={isLoading ? "SYNCHRONIZING FLEET..." : placeholder}
      searchPlaceholder="TYPE NAME TO FILTER PERSONNEL..."
      emptyText={`No matching active ${role !== 'all' ? role.toLowerCase() + 's' : 'personnel'} found`}
    />
  );
}
