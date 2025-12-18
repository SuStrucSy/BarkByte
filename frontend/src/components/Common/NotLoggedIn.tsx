import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const NotLoggedIn = () => {
	return (
		<div className="flex flex-col h-screen place-items-center p-4">
			<div className="flex align-items-center z-1">
				<div className="flex flex-col ml-4 place-items-center p-4">
					<span className="text-6xl md:text-8xl font-bold leading-none mb-4">
						401
					</span>
					<span className="text-2xl font-bold mb-2">Unauthorized</span>
				</div>
			</div>

			<span className="text-lg text-gray-600 mb-4 text-center z-1">
				To View this page please log in
			</span>
			<div className="z-1">
				<Button className="mt-4 self-center" asChild>
					<Link to="/login">Login</Link>
				</Button>
			</div>
		</div>
	);
};

export default NotLoggedIn;
