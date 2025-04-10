export const createSession = (data) => ({
  type: 'CREATE_SESSION',
  payload: data,
});

export const getQrCode = (data) => ({
  type: 'GET_QRCODE',
  payload: data,
});

export const createWhatsApp = (data) => ({
  type: 'CREATE_WHATSAPP',
  payload: data,
});

export const listWhatsApps = (data) => ({
  type: 'LIST_WHATSAPPS',
  payload: data,
});

export const deleteWhatsApp = (data) => ({
  type: 'DELETE_WHATSAPP',
  payload: data,
});
