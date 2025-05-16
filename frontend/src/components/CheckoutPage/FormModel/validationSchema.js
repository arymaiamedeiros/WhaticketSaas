import * as Yup from 'yup';
import checkoutFormModel from './checkoutFormModel';
const {
  formField: {
    firstName,
    address1,
    city,
    zipcode,
    country,
    plan
  }
} = checkoutFormModel;


export default [
  Yup.object().shape({
    [firstName.name]: Yup.string().required(`${firstName.requiredErrorMsg}`),
    [address1.name]: Yup.string().required(`${address1.requiredErrorMsg}`),
    [city.name]: Yup.string()
      .nullable()
      .required(`${city.requiredErrorMsg}`),
    [zipcode.name]: Yup.string()
      .required(`${zipcode.requiredErrorMsg}`),

    [country.name]: Yup.string()
      .nullable()
      .required(`${country.requiredErrorMsg}`)
  }),
  
  // Para o segundo passo (PaymentForm)
  Yup.object().shape({
    [plan.name]: Yup.string()
      .required(`${plan.requiredErrorMsg}`)
      .test(
        'validPlan',
        'O plano selecionado é inválido',
        function (value) {
          if (!value) return false;
          try {
            const planObj = JSON.parse(value);
            return planObj && 
                   typeof planObj.price !== 'undefined' && 
                   typeof planObj.users !== 'undefined' && 
                   typeof planObj.connections !== 'undefined';
          } catch (error) {
            return false;
          }
        }
      )
  }),
  
  // Para o último passo (ReviewOrder)
  Yup.object().shape({
    // Pode deixar vazio se não precisar de validações adicionais
  })
];
