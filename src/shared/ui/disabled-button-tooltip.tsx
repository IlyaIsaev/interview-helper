import type { ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

type DisabledButtonTooltipProps = {
  tooltip: string;
  children: ReactNode;
};

function DisabledButtonTooltip({ tooltip, children }: DisabledButtonTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex" tabIndex={0}>
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export { DisabledButtonTooltip };

export type { DisabledButtonTooltipProps };
