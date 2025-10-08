export const metadata = {
  title: "Coming Soon",
  description: "This page is under construction.",
};

export default function ComingSoonPage() {
  return (
    <div
      className="flex min-h-[70vh] items-center justify-center px-6 text-center md:min-h-[75vh]"
    >
      <div>
        <h1 className="mb-2 text-3xl font-bold md:text-4xl">Coming Soon</h1>
        <p className="mb-6 text-base opacity-80 md:text-lg">
          NOT DONE YET!
        </p>
      </div>
    </div>
  );
}