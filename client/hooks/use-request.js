import {useState} from "react";
import axios from "axios";

const useRequest  = ( {url, method, body, onSuccess} ) => {
  const [errors, setErrors] = useState(null);

  const doRequest = async (props = {}) => {
    try {

      const response = await axios[method](url, {...body, ...props});
      setErrors(null); 
      
      if(onSuccess) {
        onSuccess(response.data);
      }
        
      return response.data;
    } catch(err) {
      setErrors(   
        <div className="alert alert-danger">
          <h4>Oooops...</h4>
          <ul className="my-0">
            {err.response.data.errors.map(err => <li key={err.message}>{err.message}</li>)}
          </ul>        
        </div>
      );
      //throw err;
    }
  };

  return {
    doRequest: doRequest,
    errors: errors
  };  
};

export default useRequest;