import './Checkout.css'

const Checkout = ({ tableId, onCheckout }) => {
  const handleRequestPayment = () => {
    // TODO: Request payment from cashier
    console.log('Request payment for table:', tableId)
    if (onCheckout) {
      onCheckout()
    }
  }

  return (
    <div className="checkout">
      <button className="btn btn-success" onClick={handleRequestPayment}>
        Yêu cầu thanh toán
      </button>
    </div>
  )
}

export default Checkout
