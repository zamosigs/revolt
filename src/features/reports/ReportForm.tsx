"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';

export function ReportForm({ onSuccess }: { onSuccess: () => void }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const { addReport } = useDataStore();
  const { user } = useAuthStore();

  const onSubmit = (data: any) => {
    addReport({
      ...data,
      employeeId: user?.id,
      date: new Date().toISOString().split('T')[0],
      loadsHandled: parseInt(data.loadsHandled),
      revenueGenerated: parseInt(data.revenueGenerated),
    });
    reset();
    onSuccess();
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Daily Progress Report</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Loads Handled</label>
              <input 
                type="number"
                {...register("loadsHandled", { required: true })}
                className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand-900/10"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Revenue Generated ($)</label>
              <input 
                type="number"
                {...register("revenueGenerated", { required: true })}
                className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand-900/10"
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Problems Faced</label>
            <textarea 
              {...register("problemsFaced")}
              className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand-900/10 min-h-[100px]"
              placeholder="Any issues or delays today?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Pending Tasks</label>
            <textarea 
              {...register("pendingTasks")}
              className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand-900/10 min-h-[80px]"
              placeholder="What tasks are still open?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">{"Tomorrow's Priorities"}</label>
            <textarea 
              {...register("tomorrowPriorities")}
              className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-brand-900/10 min-h-[80px]"
              placeholder="What are the key goals for tomorrow?"
            />
          </div>

          <Button type="submit" className="w-full py-6 text-lg font-bold rounded-2xl">
            Submit Daily Report
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
