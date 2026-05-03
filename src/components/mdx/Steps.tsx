import { Children, isValidElement, ReactElement, ReactNode } from "react";

export interface StepProps {
  title: string;
  children: ReactNode;
}

/** Single step. Use only inside <Steps>. */
export const Step = ({ title, children }: StepProps) => (
  <div>
    <div className="font-medium text-foreground">{title}</div>
    <div className="mt-1 text-sm text-muted-foreground [&>p]:my-2">{children}</div>
  </div>
);

export const Steps = ({ children }: { children: ReactNode }) => {
  const steps = Children.toArray(children).filter(isValidElement) as ReactElement[];
  // Geometry: circle is 1.75rem (h-7). We position it so its CENTER sits
  // exactly on the vertical dashed line. The line is drawn as a pseudo-element
  // on the <ol>, which is more reliable than a left border whose position
  // depends on padding.
  return (
    <ol className="relative my-6 ml-0 list-none space-y-5 pl-12 before:absolute before:left-[0.875rem] before:top-2 before:bottom-2 before:w-px before:border-l before:border-dashed before:border-border before:content-['']">
      {steps.map((s, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[3rem] top-0 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card text-xs font-semibold text-foreground">
            {i + 1}
          </span>
          {s}
        </li>
      ))}
    </ol>
  );
};
