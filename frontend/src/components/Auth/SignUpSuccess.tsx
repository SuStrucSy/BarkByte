import { Link } from "@tanstack/react-router";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type SignUpSuccessComponentProps = {
  icon?: "loading" | "success";
  title: string;
  message: string;
  action?: {
    label: string;
    to: string;
  };
};

export function SignUpSuccessComponent({
  icon = "success",
  title,
  message,
  action,
}: SignUpSuccessComponentProps) {
  return (
    <Card className="relative border bg-card shadow-sm">
      <CardContent className="flex flex-col items-center px-6 py-8 text-center">
        <div
          className={
            icon === "success"
              ? "mb-5 flex size-14 items-center justify-center rounded-full bg-emerald-500/10"
              : "mb-5 flex size-14 items-center justify-center rounded-full bg-muted"
          }
        >
          {icon === "success" ? (
            <MailCheck className="size-7 text-emerald-600" />
          ) : (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          )}
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {message}
        </p>

        {action ? (
          <div className="mt-6">
            <Button asChild>
              <Link to={action.to}>{action.label}</Link>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
