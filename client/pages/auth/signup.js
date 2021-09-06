import {useState} from "react";
import Router from "next/router";
import useRequest from "../../hooks/use-request";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {doRequest, errors} = useRequest({
    url: "/api/users/signup",
    method: "post",
    body: { 
      email: email,
      password: password
    },
    onSuccess: (data) => Router.push("/")
  });

  const onSubmit = async (e) => {
    e.preventDefault();

    const data = await doRequest();
  };
  
  return <div>
    <form onSubmit={onSubmit} >
      <h1>Sign Up</h1>
      <div className="form-group mb-2">
        <label>Email Address</label>
        <input 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          type="text" 
          className="form-control"/>
      </div>
      <div className="form-group mb-2">
        <label>Password</label>
        <input 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          type="password" 
          className="form-control"/>
      </div>
      {errors}
      <button className="btn btn-primary">Sign Up</button>
    </form>
  </div>;
};
 
export default SignUp;