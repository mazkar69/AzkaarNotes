# 🐳 Install & Run MongoDB Inside Docker (Complete Guide)

This guide explains how to install and run MongoDB in Docker, expose port **27017**, set username/password, add container name, enable persistent storage, and connect using **Mongoose** or **MongoDB Compass / Atlas-style URI**.

---

## 📦 1. Pull the MongoDB Docker Image

```bash
docker pull mongo
```

---

## 🚀 2. Run MongoDB Container With Port, Username & Password

```bash
docker run -d   --name my-mongo   -p 27017:27017   -e MONGO_INITDB_ROOT_USERNAME=admin   -e MONGO_INITDB_ROOT_PASSWORD=admin   mongo
```

### ✔️ What this command does:
- `-d` → run in background  
- `--name my-mongo` → container name  
- `-p 27017:27017` → exposes MongoDB port  
- `MONGO_INITDB_ROOT_USERNAME=admin` → root username  
- `MONGO_INITDB_ROOT_PASSWORD=admin` → root password  

---

## 🔍 3. Verify That MongoDB Container Is Running

```bash
docker ps
```

---

## 🧪 4. Connect to Mongo Shell Inside Container (Optional)

```bash
docker exec -it my-mongo mongosh -u admin -p admin
```

---

## 💾 5. Run MongoDB With a Docker Volume (Recommended)

```bash
docker run -d   --name my-mongo   -p 27017:27017   -v mongo-data:/data/db   -e MONGO_INITDB_ROOT_USERNAME=admin   -e MONGO_INITDB_ROOT_PASSWORD=admin   mongo
```

This ensures your database is safe even if the container is deleted.

---

## 📂 6. Use a Custom Host Directory for Data Persistence

### Create storage directory:

```bash
mkdir -p /home/ubuntu/mongo-storage
```

### Run with custom path:

```bash
docker run -d   --name my-mongo   -p 27017:27017   -v /home/ubuntu/mongo-storage:/data/db   -e MONGO_INITDB_ROOT_USERNAME=admin   -e MONGO_INITDB_ROOT_PASSWORD=admin   mongo
```

---

## 🔁 7. Restart / Stop / Remove MongoDB Container

```bash
docker restart my-mongo
docker stop my-mongo
docker rm my-mongo
```

---

## 🌐 8. MongoDB Connection URI (Public IP)

If your EC2 security group allows inbound port **27017**, you can connect like this:

```
mongodb://admin:admin@PUBLIC_IP:27017/?authSource=admin
```

Replace `PUBLIC_IP` with your actual server IP.

---

# 🧩 9. Connect Using Mongoose (Node.js)

Install mongoose:

```bash
npm install mongoose
```

### Example connection code:

```js
import mongoose from "mongoose";

mongoose.connect("mongodb://admin:admin@PUBLIC_IP:27017/mydb?authSource=admin")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("Error:", err));
```

Replace:

- `PUBLIC_IP` → your EC2 or server IP  
- `mydb` → your database name  

---

# 🧭 10. Connect Using MongoDB Compass

Use this connection string:

```
mongodb://admin:admin@PUBLIC_IP:27017/?authSource=admin
```

Or with database name:

```
mongodb://admin:admin@PUBLIC_IP:27017/mydb?authSource=admin
```

---

# ☁️ 11. Atlas-Compatible URI Example (Same Format)

Even though this is self-hosted MongoDB (not Atlas), you can still use Atlas-style patterns:

```
mongodb://admin:admin@PUBLIC_IP:27017/mydb?retryWrites=true&w=majority&authSource=admin
```

---

# ⚠️ Security Note

Do **NOT** open port 27017 to `0.0.0.0/0` in production.  
Instead:

- Allow only your IP  
- Or use SSH tunneling  
- Or keep MongoDB in a private network (Docker bridge / VPC)

---

# 🎉 MongoDB Docker Setup Complete!

You now know how to:

✔️ Install Mongo in Docker  
✔️ Expose port 27017  
✔️ Add username & password  
✔️ Persist database  
✔️ Connect via Mongoose  
✔️ Connect via Compass / URI  

---

Happy coding! 🚀🔥
