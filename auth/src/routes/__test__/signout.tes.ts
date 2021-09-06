import request from "supertest"; //lest us make fake requests to express app
import { app } from "../../app";

it("Clears the cookie after signout", async () => {
    //it will call POST /api/users/signup running thru the entire spp middleware as if it came via http from the client
  await request(app)  
    .post("/api/users/signup")
    .send({
      email: "piotr123@piotr.com",
      password: "12345"
    })
    .expect(201);   

  const response = await request(app)  
    .post("/api/users/signout")
    .send({})
    .expect(204);      

  console.log(response.headers) ;

  expect(response.get("Set-Cookie")[0]).toEqual(
    'express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
    );
});