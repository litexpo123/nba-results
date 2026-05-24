type HighlightSlotProps = {
  searchUrl: string;
};

export function HighlightSlot({ searchUrl }: HighlightSlotProps) {
  return (
    <div className="text-sm">
      <a
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline-offset-2 hover:underline"
      >
        More clips on YouTube
      </a>
    </div>
  );
}
