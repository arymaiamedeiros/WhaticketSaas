import React, { useContext, useState } from "react";
import {
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  CircularProgress,
} from "@material-ui/core";
import { Formik, Form } from "formik";

import AddressForm from "./Forms/AddressForm";
import PaymentForm from "./Forms/PaymentForm";
import ReviewOrder from "./ReviewOrder";
import CheckoutSuccess from "./CheckoutSuccess";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/Auth/AuthContext";


import validationSchema from "./FormModel/validationSchema";
import checkoutFormModel from "./FormModel/checkoutFormModel";
import formInitialValues from "./FormModel/formInitialValues";

import useStyles from "./styles";
import Invoices from "../../pages/Financeiro";


export default function CheckoutPage(props) {
  const steps = ["Dados", "Personalizar", "Revisar"];
  const { formId, formField } = checkoutFormModel;
  
  
  
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(1);
  const [datePayment, setDatePayment] = useState(null);
  const [invoiceId, setinvoiceId] = useState(props.Invoice.id);
  const currentValidationSchema = validationSchema[activeStep];
  const isLastStep = activeStep === steps.length - 1;
  const { user } = useContext(AuthContext);

function _renderStepContent(step, setFieldValue, setActiveStep, values ) {

  switch (step) {
    case 0:
      return <AddressForm formField={formField} values={values} setFieldValue={setFieldValue}  />;
    case 1:
      return <PaymentForm 
      formField={formField} 
      setFieldValue={setFieldValue} 
      setActiveStep={setActiveStep} 
      activeStep={step} 
      invoiceId={invoiceId}
      values={values}
      />;
    case 2:
      return <ReviewOrder />;
    default:
      return <div>Not Found</div>;
  }
}


  async function _submitForm(values, actions) {
    try {
      // Verificar campos obrigatórios
      if (!values.firstName) {
        toast.error("O nome completo é obrigatório");
        actions.setSubmitting(false);
        return;
      }

      // Certifica-se de que o plano é um objeto JSON válido
      let planObj;
      try {
        planObj = JSON.parse(values.plan);
      } catch (error) {
        console.error("Erro ao analisar o plano:", error);
        toast.error("Erro no formato do plano selecionado");
        actions.setSubmitting(false);
        return;
      }

      // Verificar se o objeto do plano contém as propriedades necessárias
      if (!planObj || !planObj.price || !planObj.users || !planObj.connections) {
        console.error("Dados do plano incompletos:", planObj);
        toast.error("Dados do plano incompletos. Por favor, selecione um plano válido.");
        actions.setSubmitting(false);
        return;
      }

      // Verificar se invoiceId existe
      if (!invoiceId) {
        console.error("ID da fatura não encontrado");
        toast.error("ID da fatura não encontrado. Por favor, tente novamente.");
        actions.setSubmitting(false);
        return;
      }

      // Garante que os valores numéricos sejam enviados como números
      const newValues = {
        firstName: values.firstName || "",
        lastName: values.lastName || "",
        address2: values.address2 || "",
        city: values.city || "",
        state: values.state || "",
        zipcode: values.zipcode || "",
        country: values.country || "",
        useAddressForPaymentDetails: values.useAddressForPaymentDetails || false,
        nameOnCard: values.nameOnCard || "",
        cardNumber: values.cardNumber || "",
        cvv: values.cvv || "",
        plan: values.plan, // Mantém o JSON como string
        price: parseFloat(planObj.price),
        users: parseInt(planObj.users),
        connections: parseInt(planObj.connections),
        invoiceId: parseInt(invoiceId)
      }

      console.log("Enviando dados da assinatura:", newValues);
      
      const { data } = await api.post("/subscription", newValues);
      setDatePayment(data)
      actions.setSubmitting(false);
      setActiveStep(activeStep + 1);
      toast.success("Assinatura realizada com sucesso!, aguardando a realização do pagamento");
    } catch (err) {
      console.error("Erro ao submeter formulário:", err);
      // Verificar se o erro é de validação do backend
      if (err.response && err.response.data && err.response.data.error) {
        toast.error(`Erro: ${err.response.data.error}`);
      } else {
        toastError(err);
      }
      actions.setSubmitting(false);
    }
  }

  function _handleSubmit(values, actions) {
    if (isLastStep) {
      _submitForm(values, actions);
    } else {
      setActiveStep(activeStep + 1);
      actions.setTouched({});
      actions.setSubmitting(false);
    }
  }

  function _handleBack() {
    setActiveStep(activeStep - 1);
  }

  return (
    <React.Fragment>
      <Typography component="h1" variant="h4" align="center">
        Falta pouco!
      </Typography>
      <Stepper activeStep={activeStep} className={classes.stepper}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <React.Fragment>
        {activeStep === steps.length ? (
          <CheckoutSuccess pix={datePayment} />
        ) : (
          <Formik
            initialValues={{
              ...user, 
              ...formInitialValues
            }}
            validationSchema={currentValidationSchema}
            onSubmit={_handleSubmit}
          >
            {({ isSubmitting, setFieldValue, values }) => (
              <Form id={formId}>
                {_renderStepContent(activeStep, setFieldValue, setActiveStep, values)}

                <div className={classes.buttons}>
                  {activeStep !== 1 && (
                    <Button onClick={_handleBack} className={classes.button}>
                      VOLTAR
                    </Button>
                  )}
                  <div className={classes.wrapper}>
                    {activeStep !== 1 && (
                      <Button
                        disabled={isSubmitting}
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={classes.button}
                      >
                        {isLastStep ? "PAGAR" : "PRÓXIMO"}
                      </Button>
                    )}
                    {isSubmitting && (
                      <CircularProgress
                        size={24}
                        className={classes.buttonProgress}
                      />
                    )}
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </React.Fragment>
    </React.Fragment>
  );
}
