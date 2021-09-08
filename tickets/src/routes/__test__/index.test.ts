import request from "supertest"; //lest us make fake requests to express app
import { app } from "../../app";

const createTicket = (title: string, price: number) => {
  const cookie = global.signin();

  return request(app)  
    .post("/api/tickets")
    .set("Cookie",cookie)
    .send({
      title: title,
      price: price
    });
}

it("can fetch a list of tickets", async () => {

  const createTickets = [
    createTicket("Ticket #1",50),
    createTicket("Ticket #2",76.50),
    createTicket("Ticket #3",110.25)
  ];

  const result = await Promise.all(createTickets);

  const response = await request(app)
    .get("/api/tickets")
    .send()
    .expect(200);

  //console.log(response.body);

  expect(response.body.length).toEqual(3);

})

  // const cookie = global.signin();

  // const tickets = [
  //   {
  //     title: "Ticket #1",
  //     price: 50.00
  //   },
  //   {
  //     title: "Ticket #2",
  //     price: 85.50
  //   },
  //   {
  //     title: "Ticket #3",
  //     price: 110.00
  //   }
  // ];

  // for(let ticket of tickets) {
  //   await request(app)  
  //     .post("/api/tickets")
  //     .set("Cookie",cookie)
  //     .send(ticket).expect(201);
  // };