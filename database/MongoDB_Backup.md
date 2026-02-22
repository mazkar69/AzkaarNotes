# Import Export Database in MongoDB

In MongoDB, instead of importing and exporting a single collection or table, we can import and export the complete database. This can be done from Atlas to a local machine, Atlas to an Ubuntu server, or from an Ubuntu server to a local machine. To accomplish this, we can use the `mongodump` and `mongorestore` tools. These tools are installed automatically when MongoDB is installed; if not, you will need to install them.

## 1: Export the Database

### Atlas to Local Machine or EC2 Server
Copy the URI from Atlas (select the Node.js URI):

```sh
mongodump --uri="mongodb+srv://<username>:<password>@<cluster-url>/chaardham" --out=/path/to/backup
```

### Server to Local Machine

```sh
mongodump --uri="mongodb://admin:admin@43.204.76.78:27017" --out=/path/to/backup
```

### Local Dump (localhost) [For Backup]

```sh
mongodump --host localhost --port 27017 --username admin --password admin --authenticationDatabase admin --db <your-database-name> --out=./local_backup/
```

## 2:  Import the Database (For Restore)

### Import the Database from Local Machine to Atlas
  
  ```sh
mongorestore --uri="mongodb+srv://<username>:<password>@<cluster-url>/chaardham" --drop /path/to/backup
```


### Import the Database from Local Machine to Local Server

```sh
mongorestore --db=chaardham /path/on/server/chaardham
```

### If Validation is Required in MongoDB

```sh
mongorestore --db=chaardham --username=admin --password=admin --authenticationDatabase=admin /path/on/server/chaardham
```

If MongoDB is not running on the default `localhost:27017`, add the `--host` parameter with your server’s IP.

### 3: Restore a Collection from the Backup Database to the Running Database

Go to the backup database, where you will find the collection name that you want to restore. For example, if you want to restore the `donations` collection, you will find two files: `donations.bson` and a metadata file. To restore the collection, you need the `.bson` file.

```sh
mongorestore --username admin --password admin --authenticationDatabase admin \
  --nsInclude="chaardham.donations" --db chaardham --collection donations \
  --drop /path/to/backup/directory/donations.bson
```