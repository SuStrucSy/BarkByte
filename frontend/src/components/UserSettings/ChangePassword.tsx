import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { updatePasswordSchema } from "@/lib/schemas";
import type { UpdatePassword } from "@/api/model";
import { handleError } from "@/lib/utils";
import { useUsersUpdatePasswordMe } from "@/api/endpoints/users/users.gen";

interface UpdatePasswordForm extends UpdatePassword {
  confirm_password: string;
}

function ChangePassword() {
  const form = useForm<UpdatePasswordForm>({
    resolver: zodResolver(updatePasswordSchema),
    mode: "onBlur",
    criteriaMode: "all",
  });

  const mutation = useUsersUpdatePasswordMe({
    mutation: {
      onSuccess: () => {
        toast.success("Password updated successfully.");
        form.reset();
      },
      onError: (err) => {
        handleError(err);
      },
    },
  });

  const onSubmit: SubmitHandler<UpdatePasswordForm> = async (data) => {
    mutation.mutate({ data });
  };

  return (
    <div className="p-4">
      <h3 className="font-bold py-4">Change Password</h3>
      <Form {...form}>
        <form id="editUserForm" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex mt-4 gap-3">
            <Button type="submit" disabled={!form.formState.isDirty}>
              {form.formState.isSubmitting && (
                <Loader2 className="animate-spin" />
              )}
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default ChangePassword;
