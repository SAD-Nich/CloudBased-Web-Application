export default function AboutPage() {
  const YOUTUBE_LINK = "https://youtu.be/Bw9r2l2jN5c";
  const toEmbed = (url: string) => {
    try {
      const u = new URL(url);
      if (u.hostname === "youtu.be") return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
      if (u.hostname.includes("youtube.com")) {
        const id = u.searchParams.get("v") || u.pathname.split("/").pop();
        return id ? `https://www.youtube.com/embed/${id}` : url;
      }
      return url;
    } catch {
      return url;
    }
  };

  const embedUrl = toEmbed(YOUTUBE_LINK);

  return (
    <div className="p-8">
      <div className="mx-auto w-full max-w-3xl">
        <h2 className="mb-4 text-2xl font-bold">About Me</h2>
        <p>
          <strong>Name:</strong> Nicholaus Santo Agnus Dei
        </p>
        <p>
          <strong>Student Number:</strong> 22586549
        </p>

        <div className="mt-6">
          <h3 className="mb-2 text-xl font-semibold">Video</h3>
          <div
            className="relative mx-auto w-full max-w-[560px] overflow-hidden rounded border border-[#ccc]"
            style={{ paddingTop: "56.25%" }} // 16:9
          >
            <iframe
              src={embedUrl}
              title="YouTube video"
              className="absolute inset-0 h-full w-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </div>
  );
}
