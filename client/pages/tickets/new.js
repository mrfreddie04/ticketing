import {useState} from "react";
import Router from "next/router";
import useRequest from "../../hooks/use-request";

const NewTicket = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  const {doRequest, errors} = useRequest({
    url: "/api/tickets",
    method: "post",
    body: { 
      title: title,
      price: price
    },
    onSuccess: () => Router.push("/")
  });

  const onSubmit = async (e) => {
    e.preventDefault();

    await doRequest();
  };  

  const onBlur = () => {
    const value = parseFloat(price);

    if(Number.isNaN(value)) {
     return;
    } 
  
    setPrice(value.toFixed(2));
  }
 
  return <div>
    <form onSubmit={onSubmit} >
      <h1>Create a Ticket</h1>
      <div className="form-group mb-2">
        <label>Title</label>
        <input 
          value={title} 
          onChange={e => setTitle(e.target.value)} 
          type="text" 
          className="form-control"/>
      </div>
      <div className="form-group mb-2">
        <label>Price</label>
        <input 
          value={price} 
          onBlur={onBlur} 
          onChange={e => setPrice(e.target.value)} 
          type="price" 
          className="form-control"/>
      </div>
      {errors}
      <button className="btn btn-primary">Submit</button>
    </form>
  </div>;
} 

export default NewTicket;