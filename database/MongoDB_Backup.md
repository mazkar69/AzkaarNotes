# Import Export Database in MongoDB

In MongoDB, instead of importing and exporting a single collection, we can import and export the complete database using the `mongodump` and `mongorestore` tools. These tools are installed automatically when MongoDB is installed; if not, you will need to install them.

## Connection Styles (Not Two Different Exports)

These are not two different kinds of exports — both produce the same type of BSON dump:

```
mongodump
   │
   ├── URI style
   │      mongodb+srv://user:password@cluster/db
   │
   └── option style
          --host
          --port
          --username
          --password
          --db
```

For example, exporting from Atlas in two different ways:

```sh
# Option style
mongodump \
  --host "cluster0.xxxxx.mongodb.net" \
  --username "myuser" \
  --password "mypassword" \
  --authenticationDatabase "admin" \
  --db "chaardham" \
  --out="./atlas_backup/"
```

```sh
# URI style
mongodump --uri="mongodb+srv://<username>:<password>@<cluster-url>/chaardham" --out=/path/to/backup
```

Both do the same work.

> **Tip:** If we don't provide the database name in either command, it will export **all** the databases.

## 1: Export the Database (mongodump)

Copy the URI from Atlas (select the Node.js URI) for the Atlas commands:

| # | Scenario                | Command                                                                                                                                                      |
| - | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1 | Atlas → Local Machine  | `mongodump --uri="mongodb+srv://<username>:<password>@<cluster-url>/chaardham" --out=/path/to/backup`                                                      |
| 2 | Server → Local Machine | `mongodump --uri="mongodb://admin:admin@43.204.76.78:27017" --out=/path/to/backup`                                                                         |
| 3 | Local → Local (Backup) | `mongodump --host localhost --port 27017 --username admin --password admin --authenticationDatabase admin --db <your-database-name> --out=./local_backup/` |

## 2: Import the Database (mongorestore)

| # | Scenario                 | Command                                                                                                                                                  |
| - | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 | Local Machine → Atlas   | `mongorestore --uri="mongodb+srv://<username>:<password>@<cluster-url>/chaardham" --drop /path/to/backup`                                              |
| 2 | Local Machine → Server  | `mongorestore --host 43.204.76.78 --port 27017 --username admin --password admin --authenticationDatabase admin --db=chaardham --drop /path/to/backup` |
| 3 | Local → Local (Restore) | `mongorestore --db=chaardham --drop /path/to/backup/chaardham`                                                                                         |

> **Tip:** Use `--host <server-ip>` whenever MongoDB is not running on `localhost` (e.g., restoring to a remote server). Without it, `mongorestore` always targets `localhost:27017`.

If validation is required in MongoDB, add the auth options:

```sh
mongorestore --db=chaardham --username=admin --password=admin --authenticationDatabase=admin /path/on/server/chaardham
```

## 3: Restore a Single Collection from the Backup

Go to the backup database folder, where you will find the collection you want to restore. For example, the `donations` collection has two files: `donations.bson` and a metadata file. To restore, you need the `.bson` file.

```sh
mongorestore --username admin --password admin --authenticationDatabase admin \
  --nsInclude="chaardham.donations" --db chaardham --collection donations \
  --drop /path/to/backup/directory/donations.bson
```
