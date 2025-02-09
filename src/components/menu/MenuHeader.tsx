
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface MenuHeaderProps {
  isAllExpanded: boolean;
  toggleAllAccordions: () => void;
}

export const MenuHeader = ({ isAllExpanded, toggleAllAccordions }: MenuHeaderProps) => {
  return (
    <div className="flex items-center justify-end mb-2 px-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleAllAccordions}
        className="text-xs"
      >
        {isAllExpanded ? (
          <>
            <ChevronUp className="h-4 w-4 mr-1" />
            Collapse All
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4 mr-1" />
            Expand All
          </>
        )}
      </Button>
    </div>
  );
};
