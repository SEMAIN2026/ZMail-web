import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e72e4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-br from-[#5e72e4] to-[#7c3aed] text-white font-semibold shadow-lg shadow-[#7c3aed]/20 hover:shadow-xl hover:shadow-[#7c3aed]/40 hover:brightness-110",
        outline:
          "border border-[#2a313c] bg-transparent text-[#e6edf3] hover:bg-[#1c2330] hover:border-[#5e72e4]",
        ghost:
          "bg-transparent text-[#e6edf3] hover:bg-[#1c2330]",
        danger:
          "border border-[#b91c1c]/60 bg-transparent text-[#ef4444] hover:bg-[#b91c1c] hover:text-white",
        link: "text-[#5e72e4] underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        md: "h-11 px-5 text-sm",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
