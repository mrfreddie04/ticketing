//mock implementation
export const natsWrapper = {
  client: {
      publish: jest.fn()
        .mockImplementation(
          (subject: string, data: string, callback: ()=>void)=>{
            callback();
            return "12345";
          }
        )
    }    
};