import { useEffect, useState } from 'react';
import React from 'react'
import Router from "next/router";
import StripeCheckout from 'react-stripe-checkout';
import useRequest from "../../hooks/use-request";

const OrderShow = ({ order, currentUser }) => { 
  const [timeLeft, setTimeLeft] = useState(0);

  const {doRequest, errors} = useRequest({
    url: "/api/payments",
    method: "post",
    body: { 
      orderId: order.id
    },
    onSuccess: (payment) => Router.push("/orders"),
  });

  useEffect(()=> {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };
    findTimeLeft(); //because interval will run for the first time after 1 second 
    const timerId = setInterval(findTimeLeft,1000);
    
    return ()=>{
      clearInterval(timerId);
    }
  }, [order]);  

  //called every time state changes
  if(timeLeft < 0) {
    <div>Order Expired</div>
  }

  return <div>
    <h2>{order.ticket.title}</h2>
    <h4>Price: {order.ticket.price} </h4>
    <div>Time left to pay: {timeLeft} seconds</div>
    { <StripeCheckout
      token={({ id }) => doRequest({ token:id })}
      stripeKey = "pk_test_51JWFZEDg2mAMldRjl5AJHyiYj0EtBRZvb5beSoqZgqlfA86IeXlKU9tXQzdJaruu7iLHBmTJlW8CiNYzcvPn0Bzc00Gu2hbUwF"
      amount={order.ticket.price * 100}
      email={currentUser.email}
    /> }
    {errors}
  </div>;
} 

OrderShow.getInitialProps = async (context, client) => {  
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);  
  return { order: data };
};

export default OrderShow;