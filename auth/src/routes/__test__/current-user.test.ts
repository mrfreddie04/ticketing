import request from "supertest"; //lest us make fake requests to express app
import { app } from "../../app";

it("responds with details about current user", async () => {    
  const cookie = await global.signin();

  //console.log("Cookie",cookie);

  const response = await request(app)  
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(201);     
    
  //console.log("User",response.body?.currentUser);

  expect(response.body?.currentUser?.email).toEqual("test@test.com");
});

it("responds with null if not authenticated", async () => {    

  const response = await request(app)  
    .get("/api/users/currentuser")
    .send()
    .expect(201);     

  expect(response.body.currentUser).toBeNull();
});