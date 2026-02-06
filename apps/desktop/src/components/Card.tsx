import type { ReactNode } from "react";

type CardProps = {
  title?: string;
  subtitle?: string;
  className?: string;
  children?: ReactNode;
};

export const Card = ({ title, subtitle, className, children }: CardProps) => (
  <div className={`card ${className ?? ""}`.trim()}>
    {title ? <h3>{title}</h3> : null}
    {subtitle ? <p className="muted">{subtitle}</p> : null}
    {children}
  </div>
);
