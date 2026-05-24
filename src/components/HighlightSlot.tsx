type HighlightSlotProps = {
  searchUrl: string;
  videoId: string | null;
};

export function HighlightSlot({ searchUrl, videoId }: HighlightSlotProps) {
  return (
    <div className="space-y-2">
      {videoId ? (
        <div className="aspect-video w-full overflow-hidden rounded-md">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
            title="Game recap"
            allow="encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="h-full w-full"
          />
        </div>
      ) : null}
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
    </div>
  );
}
