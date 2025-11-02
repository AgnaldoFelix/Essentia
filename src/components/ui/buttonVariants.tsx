import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[var(--ds-success-500)] text-white hover:bg-[var(--ds-success-600)]",
        destructive: "bg-[var(--ds-danger-500)] text-white hover:bg-[var(--ds-danger-600)]",
        outline: "border border-[color:var(--ds-neutral-200)] bg-[var(--ds-default-50)] hover:bg-[var(--ds-default-100)]",
        secondary: "bg-[var(--ds-default-200)] text-[var(--ds-neutral-800)] hover:bg-[var(--ds-default-300)]",
        ghost: "bg-transparent hover:bg-[var(--ds-default-50)] hover:text-[var(--ds-neutral-800)]",
        link: "text-[var(--ds-success-600)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export default buttonVariants;
