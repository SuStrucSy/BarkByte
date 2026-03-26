import { useEffect, useState } from "react";

export function useChartHeight(mobileHeight = 280, desktopHeight = 500) {
	const [height, setHeight] = useState(desktopHeight);
	useEffect(() => {
		const update = () =>
			setHeight(window.innerWidth < 768 ? mobileHeight : desktopHeight);
		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, [mobileHeight, desktopHeight]);
	return height;
}
