"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/shadcn/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/shadcn/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import { Input } from "./shadcn/input";

export function Combobox(
  { options, form, placeholder, onSelect,def = "" }: {
    options?: { value: string; label: string }[];
    form?: string;
    placeholder?: string;
    onSelect?: (value: string) => void;
    def?:string
  },
) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(def);

  return (
    <>
      {form && <Input hidden={true} name={form} defaultValue={value} />}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className=" justify-between"
          >
            {value
              ? options?.find((o) => o.value === value)?.label
              : placeholder }
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className=" p-0">
          <Command>
            <CommandInput placeholder={placeholder} className="h-9" />
            <CommandList>
              <CommandEmpty>Empty</CommandEmpty>
              <CommandGroup>
                {options ? options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      const newValue = currentValue === value
                        ? ""
                        : currentValue;
                      setValue(newValue);
                      if (onSelect) onSelect(newValue);
                      setOpen(false);
                    }}
                  >
                    {option.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === option.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                )): <Loader className="animate-spin m-auto h-full" />}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
