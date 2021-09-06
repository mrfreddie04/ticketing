import Link from "next/link";

const OrderIndex = ({currentUser, orders}) => {
  const orderList = orders.map( order => {
    return(
      <li key={order.id}>
        {order.ticket.title} - {order.status}
      </li>
    )
  });
  
  return (
    <div>
      <h1>Orders</h1>
      <ul>
        {orderList}
      </ul>
    </div>
  );
};

OrderIndex.getInitialProps = async (context, client, currentUser) => {  
  const { data } = await client.get("/api/orders");  
  return { orders: data };
};

export default OrderIndex;