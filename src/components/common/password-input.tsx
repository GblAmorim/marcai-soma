"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";

interface PasswordInputProps {
  id?: string;
  placeholder?: string;
  value: string;
  /**
   * Called with the plain string value on every keystroke.
   * Compatible with react-hook-form's `field.onChange` and plain
   * `useState` setters — RHF accepts a raw value as well as an Event.
   */
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
}

/**
 * Shared password input with show / hide toggle.
 *
 * Usage with react-hook-form:
 *   <PasswordInput value={field.value} onChange={field.onChange} />
 *
 * Usage with useState:
 *   <PasswordInput value={password} onChange={setPassword} />
 */
const PasswordInput = ({
  id,
  placeholder,
  value,
  onChange,
  autoComplete,
  required,
}: PasswordInputProps) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        className="pr-10"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
      >
        {show ? (
          <EyeOffIcon className="h-4 w-4" />
        ) : (
          <EyeIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};

export default PasswordInput;
