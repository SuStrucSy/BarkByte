import { useTheme } from "@/components/theme-provider";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Appearance = () => {
	const { setTheme, theme } = useTheme();

	return (
		<div className="p-3">
			<h3 className="text-sm py-4">Appearance</h3>
			<RadioGroup defaultValue={theme}>
				<div className="flex items-center gap-3">
					<RadioGroupItem
						value="light"
						id="radioLight"
						onClick={() => setTheme("light")}
					/>
					<Label htmlFor="radioLight">Light</Label>
				</div>
				<div className="flex items-center gap-3">
					<RadioGroupItem
						value="dark"
						id="radioDark"
						onClick={() => setTheme("dark")}
					/>
					<Label htmlFor="radioDark">Dark</Label>
				</div>
				<div className="flex items-center gap-3">
					<RadioGroupItem
						value="system"
						id="radioSystem"
						onClick={() => setTheme("system")}
					/>
					<Label htmlFor="radioSystem">System</Label>
				</div>
			</RadioGroup>
		</div>
	);
};

export default Appearance;
