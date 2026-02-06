type StatusTone = "good" | "warn" | "risk" | "info" | "neutral";

type StatusPillProps = {
  label: string;
  tone?: StatusTone;
};

export const StatusPill = ({ label, tone = "neutral" }: StatusPillProps) => (
  <span className={`status-pill ${tone}`}>{label}</span>
);
