import { cn } from "@/lib/utils";

interface ToggleChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export const ToggleChip = ({ label, active, onClick }: ToggleChipProps) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
      active
        ? "bg-primary text-primary-foreground border-primary"
        : "text-muted-foreground hover:bg-accent border",
    )}
  >
    {label}
  </button>
);
