/// <reference types="node" />
import nats from "node-nats-streaming";
import { TicketCreatedPublisher } from "./events/ticket-created-publisher";
import { TicketCreatedEventData } from "./events/ticket-created-event";

console.clear();

const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222"
});

stan.on("connect", async () => {
  console.log("Publisher connected to NATS");
  
  const publisher = new TicketCreatedPublisher(stan);

  const data: TicketCreatedEventData = {
    id: "1234567890abcdefabcdef12",
    title: "Concert",
    price: 100,
    userId: "123456789012345678901234"
  };

  try {
    await publisher.publish(data);
  } catch(err) {
    console.error(err);
  }  
});