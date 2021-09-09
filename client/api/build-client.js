import axios  from "axios";

const buildClient = ({req}) => {
  if(typeof window === "undefined") {
    return axios.create(      
      {
        headers: req.headers,
        //baseURL: "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local"
        baseURL: "http://www.ticketing-app-prod.rest"
      }
    );   
  } else {    
    return axios.create({
      baseURL: "/"
    });
  }
};

export default buildClient;