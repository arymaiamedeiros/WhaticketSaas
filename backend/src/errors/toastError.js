import { isString } from 'lodash';
import { i18n } from "../translate/i18n";
import showToast from "../../frontend/src/utils/toast";

const toastError = err => {
	const errorMsg = err?.response?.data?.message || err?.response?.data?.error;
	if (errorMsg) {
		if (i18n.exists(`backendErrors.${errorMsg}`)) {
			showToast.error(i18n.t(`backendErrors.${errorMsg}`), {
				toastId: errorMsg,
			});
			return;
		} else {
			showToast.error(errorMsg, {
				toastId: errorMsg,
			});
			return;
		}
	} else if (isString(err)) {
		showToast.error(err, {
			toastId: err,
		});
		return;
	} else {
		showToast.error("An error occurred!", {
			toastId: "An error occurred!",
		});
		return;
	}
};

export default toastError;
