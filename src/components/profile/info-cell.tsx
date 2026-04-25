/**
 * Displays an icon + label + value in a vertical stack.
 * Used throughout the profile page for labelled data cells.
 */
export const InfoCell = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) => (
  <div className="flex items-start gap-2.5 py-3">
    <div className="text-muted-foreground mt-0.5 shrink-0">{icon}</div>
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-sm font-medium wrap-break-word">
        {value ?? "—"}
      </span>
    </div>
  </div>
);
