import http from 'http';

const server = http.createServer((req, res)=>{
    console.log("headers", req.headers);
    console.log("method", req.method);
    console.log("url", req.url);
    const users={
        name: "John",
        hobby: "Skating"
    }
    res.setHeader('Content-Type', 'application/json');
    
    res.end(JSON.stringify(users));
})

server.listen(3000);