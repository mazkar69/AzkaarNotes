## Nodejs Deployment guide

```json
"scripts": {
  "start": "node app.js",
  "build": "cd client && npm install && npm run build"
},
```

```javascript
// Uncomment from .env to run this if in production
if (process.env.NODE_ENV == "production") {

    app.use(express.static("client/build"));

    const path = require("path");

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
    });
    
} else {
    app.get('/', (req, res) => {
        res.send("Running..........");
    });
}
```

