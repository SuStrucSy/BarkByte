"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { Drawer as DrawerPrimitive } from "vaul";
import { XIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";

type SheetSide = "top" | "right" | "bottom" | "left";

const SheetModeContext = React.createContext({ isMobile: false });

function useSheetMode() {
	return React.useContext(SheetModeContext);
}

function Sheet({
	children,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Root>) {
	const { isMobile } = useIsMobile();

	return (
		<SheetModeContext.Provider value={{ isMobile }}>
			{isMobile ? (
				<DrawerPrimitive.Root
					data-slot="sheet"
					direction="bottom"
					{...(props as React.ComponentProps<typeof DrawerPrimitive.Root>)}
				>
					{children}
				</DrawerPrimitive.Root>
			) : (
				<SheetPrimitive.Root data-slot="sheet" {...props}>
					{children}
				</SheetPrimitive.Root>
			)}
		</SheetModeContext.Provider>
	);
}

function SheetTrigger({
	...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
	const { isMobile } = useSheetMode();

	return isMobile ? (
		<DrawerPrimitive.Trigger
			data-slot="sheet-trigger"
			{...(props as React.ComponentProps<typeof DrawerPrimitive.Trigger>)}
		/>
	) : (
		<SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
	);
}

function SheetClose({
	...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
	const { isMobile } = useSheetMode();

	return isMobile ? (
		<DrawerPrimitive.Close
			data-slot="sheet-close"
			{...(props as React.ComponentProps<typeof DrawerPrimitive.Close>)}
		/>
	) : (
		<SheetPrimitive.Close data-slot="sheet-close" {...props} />
	);
}

function SheetPortal({
	children,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
	const { isMobile } = useSheetMode();

	return isMobile ? (
		<DrawerPrimitive.Portal
			data-slot="sheet-portal"
			{...(props as React.ComponentProps<typeof DrawerPrimitive.Portal>)}
		>
			{children}
		</DrawerPrimitive.Portal>
	) : (
		<SheetPrimitive.Portal data-slot="sheet-portal" {...props}>
			{children}
		</SheetPrimitive.Portal>
	);
}

const SheetOverlay = React.forwardRef<
	React.ElementRef<typeof SheetPrimitive.Overlay>,
	React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => {
	const { isMobile } = useSheetMode();

	if (isMobile) {
		return (
			<DrawerPrimitive.Overlay
				ref={ref as React.Ref<HTMLDivElement>}
				data-slot="sheet-overlay"
				className={cn(
					"fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
					className,
				)}
				{...(props as React.ComponentPropsWithoutRef<
					typeof DrawerPrimitive.Overlay
				>)}
			/>
		);
	}

	return (
		<SheetPrimitive.Overlay
			ref={ref}
			data-slot="sheet-overlay"
			className={cn(
				"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
				className,
			)}
			{...props}
		/>
	);
});
SheetOverlay.displayName = "SheetOverlay";

function getSheetClasses(side: SheetSide) {
	return cn(
		"bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
		side === "right" &&
			"data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
		side === "left" &&
			"data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
		side === "top" &&
			"data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
		side === "bottom" &&
			"data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
	);
}

function SheetContent({
	className,
	children,
	side = "right",
	...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
	side?: SheetSide;
}) {
	const { isMobile } = useSheetMode();

	if (isMobile) {
		return (
			<SheetPortal>
				<SheetOverlay />
				<DrawerPrimitive.Content
					data-slot="sheet-content"
					className={cn(
						"group/drawer-content fixed inset-x-0 bottom-0 z-50 mt-24 flex max-h-[85vh] flex-col rounded-t-lg border-t bg-background shadow-lg",
						className,
					)}
					{...(props as React.ComponentProps<typeof DrawerPrimitive.Content>)}
				>
					<div className="mx-auto mt-3 mb-5 h-1.5 w-12 shrink-0 rounded-full bg-muted ring-1 ring-border/80" />
					{children}
				</DrawerPrimitive.Content>
			</SheetPortal>
		);
	}

	return (
		<SheetPortal>
			<SheetOverlay />
			<SheetPrimitive.Content
				data-slot="sheet-content"
				className={cn(getSheetClasses(side), className)}
				{...props}
			>
				{children}
				<SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
					<XIcon className="size-4" />
					<span className="sr-only">Close</span>
				</SheetPrimitive.Close>
			</SheetPrimitive.Content>
		</SheetPortal>
	);
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sheet-header"
			className={cn("flex flex-col gap-1.5 p-4", className)}
			{...props}
		/>
	);
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="sheet-footer"
			className={cn("mt-auto flex flex-col gap-2 p-4", className)}
			{...props}
		/>
	);
}

function SheetTitle({
	className,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
	const { isMobile } = useSheetMode();

	return isMobile ? (
		<DrawerPrimitive.Title
			data-slot="sheet-title"
			className={cn("text-foreground font-semibold", className)}
			{...(props as React.ComponentProps<typeof DrawerPrimitive.Title>)}
		/>
	) : (
		<SheetPrimitive.Title
			data-slot="sheet-title"
			className={cn("text-foreground font-semibold", className)}
			{...props}
		/>
	);
}

function SheetDescription({
	className,
	...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
	const { isMobile } = useSheetMode();

	return isMobile ? (
		<DrawerPrimitive.Description
			data-slot="sheet-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...(props as React.ComponentProps<typeof DrawerPrimitive.Description>)}
		/>
	) : (
		<SheetPrimitive.Description
			data-slot="sheet-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

export {
	Sheet,
	SheetTrigger,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetFooter,
	SheetTitle,
	SheetDescription,
};
