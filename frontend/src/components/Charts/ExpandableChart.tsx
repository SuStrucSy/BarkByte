import { useState } from "react";
import { Button } from "../ui/button";
import { Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

export function ExpandableChart({
  title,
  children,
}: {
  title: string;
  children: () => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="icon" variant="ghost" onClick={() => setOpen(true)}>
        <Maximize2 className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-none! w-11/12 h-screen flex flex-col rounded-none p-6">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0">{open && children()}</div>
        </DialogContent>
      </Dialog>
    </>
  );
}
