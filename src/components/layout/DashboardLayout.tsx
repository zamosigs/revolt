"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { motion } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <motion.main 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-1 overflow-y-auto"
        >
          <div className="mx-auto w-full max-w-[1800px] px-4 md:px-6 lg:px-8 py-5 md:py-6">
            <div className="flex flex-col gap-5 md:gap-6">
              {children}
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
