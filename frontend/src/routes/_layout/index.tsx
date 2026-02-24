import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Info, Mail, Users } from "lucide-react";

export const Route = createFileRoute("/_layout/")({
  staticData: {
    title: "Home",
  },
  component: Home,
});

function Home() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <Card className="mx-auto w-full max-w-4xl">
        <CardContent className="p-8 text-center md:p-12">
          <h1 className="text-4xl font-bold leading-tight text-gray-600 md:text-6xl">
            Welcome to Timverse{" "}
            <span role="img" aria-label="waving hand">
              🪵🪐
            </span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-gray-600 md:text-base">
            Timverse is a platform that helps civil engineers record, organize, and
            understand data from timber and structural experiments in one place. It
            lets you track specimens, materials, test setups, and results in a
            clear, consistent way, instead of scattered spreadsheets and notes. The
            system makes it easier to compare experiments, spot patterns, and
            revisit results long after a test is finished. Ultimately, Timverse
            turns raw experimental data into something reliable, searchable, and
            useful for research and decision making.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button type="button">
              <Info className="h-4 w-4" />
              About
            </Button>
            <Button type="button" variant="secondary">
              <Users className="h-4 w-4" />
              Team
            </Button>
            <Button type="button" variant="secondary">
              <Mail className="h-4 w-4" />
              Contact
            </Button>
            <Button asChild variant="secondary">
              <a
                href="https://github.com/SuStrucSy/BarkByte"
                target="_blank"
                rel="noreferrer"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
