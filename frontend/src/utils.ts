import type { AxiosError } from "axios";
import { toast } from "sonner";
import type { HTTPValidationError } from './api/model';

export const emailPattern = {
	value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
	message: "Invalid email address",
};

export const namePattern = {
	value: /^[A-Za-z\s\u00C0-\u017F]{1,30}$/,
	message: "Invalid name",
};

export const passwordRules = (isRequired = true) => {
	const rules: any = {
		minLength: {
			value: 8,
			message: "Password must be at least 8 characters",
		},
	};

	if (isRequired) {
		rules.required = "Password is required";
	}

	return rules;
};

export const confirmPasswordRules = (
	getValues: () => any,
	isRequired = true,
) => {
	const rules: any = {
		validate: (value: string) => {
			const password = getValues().password || getValues().new_password;
			return value === password ? true : "The passwords do not match";
		},
	};

	if (isRequired) {
		rules.required = "Password confirmation is required";
	}

	return rules;
};

export const handleError = (err: void | HTTPValidationError) => {
  let title = "Something went wrong.";
  let description = "Please try again.";

  // Handle AxiosError (HTTP 400, 401, etc.)
  if (err && 'response' in err && 'status' in (err as any).response) {
    const axiosErr = err as AxiosError;
    const status = axiosErr.response?.status;

    if (status === 400) {
      title = "Bad Request";
      if (axiosErr.response?.data?.detail) {
        description = axiosErr.response.data.detail;
      } else {
        description = "Invalid request data. Check your credentials.";
      }
    } else if (status === 401) {
      title = "Unauthorized";
      description = "Invalid username or password.";
    } else if (status === 422) {
      title = "Validation Error";
      if (axiosErr.response?.data?.detail) {
        const detail = axiosErr.response.data.detail;
        if (Array.isArray(detail)) {
          description = detail.map((e: any) => e.msg).join('; ');
        } else {
          description = detail;
        }
      }
    } else {
      title = `Server Error (${status})`;
      description = axiosErr.response?.data?.detail || "Server returned an error.";
    }
  }
  // Existing HTTPValidationError handling
  else if ('detail' in err) {
    const errDetail = err.detail;
    if (Array.isArray(errDetail) && errDetail.length > 0) {
      title = "Validation Error";
      description = errDetail.map((e: any) => e.msg).join('; ');
    } else if (typeof errDetail === 'string') {
      description = errDetail;
    }
  }
  // Generic Error
  else if (err instanceof Error) {
    title = err.message;
  }

  toast.error(title, { description });
};
