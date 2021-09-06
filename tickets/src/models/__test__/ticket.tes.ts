import { Ticket } from "../ticket";

it("implements Optimistic Concurrency Control", async () => {
  //create an instance of a ticket
  const ticket = Ticket.build({
    userId: global.getMongooseId(),
    title: "Ticket OCC",
    price: 100
  });

  //save the ticket to db
  await ticket.save();
  const id = ticket.id;

  //fetch the ticket twice
  const firstInstance = await Ticket.findById(id);
  const secondInstance = await Ticket.findById(id);

  //make two separate changes to the ticket we fetch
  firstInstance!.set({price:200});
  secondInstance!.set({price:300});

  //save the first fetched ticket - should work
  await firstInstance!.save();

  //save the second fetched ticker - should fail
  // expect( async () => {
  //   await secondInstance!.save();
  // }).toThrow();
  try {
    await secondInstance!.save();
  } catch(e) {
    expect(1).toEqual(1);
    return ; //remove if causing errors
  }
    
  throw new Error("Should not reach this point");
});

it("each save increments version by 1", async () => {
  //create an instance of a ticket
  const ticket = Ticket.build({
    userId: global.getMongooseId(),
    title: "Ticket OCC",
    price: 100
  });

  //save the ticket to db
  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);



  // const id = ticket.id;

  // //first update
  // const ticket1 = await Ticket.findById(id);
  // expect(ticket1!.version).toEqual(0);
  
  // ticket1!.set({price:200});
  // await ticket1!.save();
  // expect(ticket1!.version).toEqual(1);

  // //second update
  // const ticket2 = await Ticket.findById(id);
  // expect(ticket2!.version).toEqual(1);
  
  // ticket2!.set({price:300});
  // await ticket2!.save();
  // expect(ticket2!.version).toEqual(2);  

});