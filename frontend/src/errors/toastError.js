import { isString } from 'lodash';
import { i18n } from "../translate/i18n";
import showToast from "../utils/toast";

const toastError = err => {
    console.log(err?.response);
    
    const errorCode = err?.response?.status;
    const errorMsg = err?.response?.data?.error;

    if(errorCode === 500) {
        console.error(`Error: ${i18n.t(`backendErrors.${errorMsg}`)}`);
        return;
    }

    if (errorMsg) {
        if (i18n.exists(`backendErrors.${errorMsg}`)) {
            console.error(`Error: ${i18n.t(`backendErrors.${errorMsg}`)}`);
            
            showToast.error(i18n.t(`backendErrors.${errorMsg}`), {
                toastId: errorMsg,
            });
            
            return;
        } else {
            console.error(`Error: ${errorMsg}`);
            
            showToast.error(errorMsg, {
                toastId: errorMsg,
            });
            
            return;
        }
    } else if (isString(err)) {
        console.error(`Error: ${err}`);
        
        showToast.error(err, {
            toastId: err,
        });
        
        return;
    } else {
        console.error("An error occurred!");
        
        showToast.error("An error occurred!", {
            toastId: "An error occurred!",
        });
        
        return;
    }
};

export default toastError;