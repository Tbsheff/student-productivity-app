"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTheme } from "next-themes";

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Theme</h3>
          <p className="text-sm text-muted-foreground">
            Select your preferred theme
          </p>
        </div>

        <RadioGroup
          defaultValue={theme}
          onValueChange={(value) => setTheme(value)}
          className="grid grid-cols-3 gap-4"
        >
          <div>
            <RadioGroupItem
              value="light"
              id="theme-light"
              className="sr-only"
            />
            <Label
              htmlFor="theme-light"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
              style={{
                borderColor: theme === "light" ? "#6366F1" : undefined,
              }}
            >
              <div className="mb-2 rounded-md bg-white p-2 shadow-sm">
                <div className="space-y-2">
                  <div className="h-2 w-[80px] rounded-lg bg-[#6366F1]" />
                  <div className="h-2 w-[100px] rounded-lg bg-slate-200" />
                  <div className="h-2 w-[80px] rounded-lg bg-slate-200" />
                </div>
              </div>
              <span className="block w-full text-center">Light</span>
            </Label>
          </div>

          <div>
            <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
            <Label
              htmlFor="theme-dark"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
              style={{
                borderColor: theme === "dark" ? "#6366F1" : undefined,
              }}
            >
              <div className="mb-2 rounded-md bg-slate-950 p-2 shadow-sm">
                <div className="space-y-2">
                  <div className="h-2 w-[80px] rounded-lg bg-[#6366F1]" />
                  <div className="h-2 w-[100px] rounded-lg bg-slate-800" />
                  <div className="h-2 w-[80px] rounded-lg bg-slate-800" />
                </div>
              </div>
              <span className="block w-full text-center">Dark</span>
            </Label>
          </div>

          <div>
            <RadioGroupItem
              value="system"
              id="theme-system"
              className="sr-only"
            />
            <Label
              htmlFor="theme-system"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
              style={{
                borderColor: theme === "system" ? "#6366F1" : undefined,
              }}
            >
              <div className="mb-2 rounded-md bg-gradient-to-r from-white to-slate-950 p-2 shadow-sm">
                <div className="space-y-2">
                  <div className="h-2 w-[80px] rounded-lg bg-gradient-to-r from-[#6366F1] to-[#818cf8]" />
                  <div className="h-2 w-[100px] rounded-lg bg-gradient-to-r from-slate-200 to-slate-800" />
                  <div className="h-2 w-[80px] rounded-lg bg-gradient-to-r from-slate-200 to-slate-800" />
                </div>
              </div>
              <span className="block w-full text-center">System</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Font Size</h3>
          <p className="text-sm text-muted-foreground">
            Adjust the font size for better readability
          </p>
        </div>

        <RadioGroup defaultValue="medium" className="grid grid-cols-3 gap-4">
          <div>
            <RadioGroupItem value="small" id="font-small" className="sr-only" />
            <Label
              htmlFor="font-small"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              <span className="text-sm">Small</span>
            </Label>
          </div>

          <div>
            <RadioGroupItem
              value="medium"
              id="font-medium"
              className="sr-only"
            />
            <Label
              htmlFor="font-medium"
              className="flex flex-col items-center justify-between rounded-md border-2 border-[#6366F1] bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              <span className="text-base">Medium</span>
            </Label>
          </div>

          <div>
            <RadioGroupItem value="large" id="font-large" className="sr-only" />
            <Label
              htmlFor="font-large"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              <span className="text-lg">Large</span>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <Button className="bg-indigo-600 hover:bg-indigo-700">
        Save Preferences
      </Button>
    </div>
  );
}
