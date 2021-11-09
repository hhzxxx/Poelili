self.onmessage = (e) => {
    console.log("worker 接受到的message e--", e.data);
    if(e.data.code){
      // listenAction.getFetch(e.data).then((res)=>{
        self.postMessage(e.data.code)
      // })
    }
  };
