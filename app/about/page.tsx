export default function AboutPage() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">About Me</h2>
      <p><strong>Name:</strong> Nicholaus Santo Agnus Dei</p>
      <p><strong>Student Number:</strong> 22586549</p>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Project Info</h3>
        <p>
          This project is part of Assignment 1. It demonstrates navigation,
          tabs, dark mode, output generation, and GitHub workflow.
        </p>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Video Placeholder</h3>
        <div className="w-[560px] h-[315px] bg-gray-300 flex items-center justify-center">
          <span>Embed Video Here</span>
        </div>
      </div>
    </div>
  );
}