import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Input } from "../ui/input";

const ClearableInput = ({
  onClear,
  className,
  ...props
}: React.ComponentProps<typeof Input> & { onClear: () => void }) => {
  const hasValue = !!props.value;
  return (
    <div className="relative">
      <Input {...props} className={cn(className, hasValue)} />
      {hasValue && (
        <button
          type="button"
          tabIndex={-1}
          onClick={onClear}
          aria-label="Limpar campo"
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 transition-colors"
        >
          <XIcon className="h-4 w-5" />
        </button>
      )}
    </div>
  );
};

export default ClearableInput;
