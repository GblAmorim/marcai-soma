interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export const DetailRow = ({ icon, label, value }: DetailRowProps) => (
  <div className="flex items-center gap-3 px-4 py-3">
    <span className="text-muted-foreground shrink-0">{icon}</span>
    <div className="flex flex-1 items-center justify-between gap-2">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-right text-sm font-medium capitalize">{value}</span>
    </div>
  </div>
);
