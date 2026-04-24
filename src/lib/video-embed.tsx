interface VideoEmbedProps {
  embedUrl: string;
  platform: string;
}

export function VideoEmbed({ embedUrl, platform }: VideoEmbedProps) {
  if (platform === 'mp4') {
    return (
      <div className="my-4">
        <div className="relative w-full bg-black rounded-lg overflow-hidden border border-border shadow-sm" style={{ paddingBottom: '56.25%' }}>
          <video
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full"
            controls
            controlsList="nodownload"
            preload="metadata"
            playsInline
          />
        </div>
      </div>
    );
  }

  return (
    <div className="my-4">
      <div className="relative w-full bg-black aspect-video">
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full rounded-lg border border-border shadow-sm"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          // @ts-ignore — legacy attributes for Safari/Firefox fullscreen
          webkitallowfullscreen="true"
          mozallowfullscreen="true"
          style={{ border: 0 }}
          title={`${platform} video`}
        />
      </div>
    </div>
  );
}
