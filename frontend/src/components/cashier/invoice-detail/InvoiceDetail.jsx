import Payment from '../payment/Payment'
import './InvoiceDetail.css'

const InvoiceDetail = ({ invoice, onPaymentDone }) => {
  const details = invoice?.details || []
  const isUnpaid = (invoice?.status || '').toLowerCase() === 'unpaid'

  return (
    <div className="invoice-detail">
      <h2>Chi tiết hóa đơn</h2>
      <div className="invoice-info">
        <p><strong>Đơn hàng:</strong> #{invoice?.orderId}</p>
        <p><strong>Thời gian:</strong> {invoice?.createdAt ? new Date(invoice.createdAt).toLocaleString('vi-VN') : '-'}</p>
      </div>
      <div className="invoice-items">
        <h3>Danh sách món</h3>
        <table>
          <thead>
            <tr>
              <th>Món</th>
              <th>SL</th>
              <th>Giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {details.map((item, idx) => (
              <tr key={idx}>
                <td>{item.itemName}</td>
                <td>{item.quantity}</td>
                <td>{Number(item.unitPrice).toLocaleString('vi-VN')} đ</td>
                <td>{Number(item.lineTotal).toLocaleString('vi-VN')} đ</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="invoice-total">
        <strong>Tổng cộng: {invoice ? Number(invoice.totalAmount).toLocaleString('vi-VN') : 0} đ</strong>
      </div>
      {isUnpaid && <Payment invoice={invoice} onPaymentDone={onPaymentDone} />}
    </div>
  )
}

export default InvoiceDetail
