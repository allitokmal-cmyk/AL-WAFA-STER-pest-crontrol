import { Smartphone } from "lucide-react";
import { ReportItem } from "../types";

interface ClientPortalViewProps {
  reports: ReportItem[];
}

export default function ClientPortalView({ reports }: ClientPortalViewProps) {
  return (
    <div id="client-portal-root" className="min-h-[450px] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4 p-8 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 backdrop-blur-xs animate-fade-in">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-500">
          <Smartphone className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            Pest Control Service
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            This module has been set to empty. It is fully integrated with the system and ready to receive your customized operational specifications.
          </p>
        </div>
      </div>
    </div>
  );
}
