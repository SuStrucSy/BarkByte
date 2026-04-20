import { Button } from "../ui/button";

interface DisclaimerProps {
  isVisible: boolean;
  setVisible: (value: boolean | ((prev: boolean) => boolean)) => void;
}

export function Disclaimer({ isVisible, setVisible }: DisclaimerProps) {
  if (isVisible) {
    return (
      <div className="flex items-start gap-4 px-5 py-4">
        <p className="flex-1 text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Disclaimer: </span>
          This database contains curated data from cited references for research
          and educational purposes. It is intended as a preliminary engineering
          resource and does not replace project-specific design, codes, or
          manufacturer documentation. Use is at your own discretion, provided
          "as is", and the authors are not liable for any outcomes. Users should
          verify information with original sources.
        </p>
        <Button
          type="button"
          onClick={() => setVisible(false)}
          variant="link"
          className="shrink-0 text-xs text-muted-foreground  hover:text-foreground transition-colors"
        >
          Hide
        </Button>
      </div>
    );
  }
  return (
    <div className="flex justify-end md:px-5 py-1 md:py-2">
      <Button
        type="button"
        onClick={() => setVisible(true)}
        variant="link"
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Show disclaimer
      </Button>
    </div>
  );
}
