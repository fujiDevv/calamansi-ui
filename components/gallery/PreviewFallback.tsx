export default function PreviewFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <span className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
        Recording soon
      </span>
    </div>
  );
}
