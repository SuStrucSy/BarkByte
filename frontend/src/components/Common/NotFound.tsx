import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const NotFound = () => {
	return (
		<>
			<div className="flex flex-col h-screen place-items-center p-4">
				<div className="flex align-items-center z-1">
					<div className="flex flex-col ml-4 place-items-center p-4">
						<span className="text-6xl md:text-8xl font-bold leading-none mb-4">
							404
						</span>
						<span className="text-2xl font-bold mb-2">Oops!</span>
					</div>
				</div>

				<span className="text-lg text-gray-600 mb-4 text-center z-1">
					The page you are looking for was not found.
				</span>
				<div className="z-1">
					<Button className="mt-4 self-center" asChild>
						<Link to="/">Go Back</Link>
					</Button>
				</div>
			</div>
		</>
	);
};

export default NotFound;
