import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/")({
  staticData: {
    title: "Home",
  },
  component: Home,
});

function Home() {
  return (
    <div className="max-w-full">
      <h1 className="">Home</h1>
    </div>
  );
}
