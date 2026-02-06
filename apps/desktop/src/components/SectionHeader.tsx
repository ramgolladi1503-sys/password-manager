type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const SectionHeader = ({ title, actionLabel, onAction }: SectionHeaderProps) => (
  <div className="section-header">
    <h2>{title}</h2>
    {actionLabel ? (
      <button className="btn ghost" onClick={onAction} type="button">
        {actionLabel}
      </button>
    ) : null}
  </div>
);
