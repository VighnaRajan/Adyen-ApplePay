
(async function () {
  const sessionRes = await fetch('/api/sessions', { method: 'POST' });
  const session = await sessionRes.json();

  const checkout = await AdyenCheckout({
    environment: 'test',
    clientKey: session.clientKey,
    session,
    onPaymentCompleted: (result) => {
      alert('Payment completed: ' + result.resultCode);
    },
    onError: (error) => {
      console.error(error);
      alert(error.message);
    }
  });

  checkout.create('dropin').mount('#dropin');
})();
