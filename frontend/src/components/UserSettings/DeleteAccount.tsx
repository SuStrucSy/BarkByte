import DeleteConfirmation from "./DeleteConfirmation";

const DeleteAccount = () => {
	return (
		<div className="p-4">
			<h3 className="font-bold py-4">Delete Account</h3>
			<p>
				Permanently delete your data and everything associated with your
				account.
			</p>
			<DeleteConfirmation />
		</div>
	);
};
export default DeleteAccount;
