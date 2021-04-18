const express = require("express");
const cors = require("cors");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;

const app = express();
app.use(express.json());
app.use(cors());

const userName = process.env.DB_USER;
const pass = process.env.DB_PASS;
const dbName = process.env.DB_NAME;
const services = process.env.DB_COLLECTION_SERVICES;
const bookings = process.env.DB_COLLECTION_BOOKINGS;
const reviews = process.env.DB_COLLECTION_REVIEWS;
const admins = process.env.DB_COLLECTION_ADMINS;

const uri = `mongodb+srv://${userName}:${pass}@cluster0.twaro.mongodb.net/${dbName}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const serviceCollection = client.db(dbName).collection(services);
  const bookingCollection = client.db(dbName).collection(bookings);
  const reviewCollection = client.db(dbName).collection(reviews);
  const adminCollection = client.db(dbName).collection(admins);

  // Services

  app.get("/services", (req, res) => {
    serviceCollection.find().toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/services/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    serviceCollection.find({ _id: id }).toArray((err, documents) => {
      res.send(documents[0]);
    });
  });

  app.post("/addService", (req, res) => {
    const newService = req.body;
    serviceCollection.insertOne(newService).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.delete("/deleteService/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    serviceCollection
      .findOneAndDelete({ _id: id })
      .then((documents) => res.send(documents.value));
  });

  // Bookings

  app.get("/bookings", (req, res) => {
    bookingCollection.find().toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.put("/bookings/:id", (req, res) => {
    const id = ObjectID(req.params.id);
    bookingCollection
      .findOneAndUpdate(
        { _id: id },
        {
          $set: { status: req.body.status },
        }
      )
      .then((result) => {
        res.send("Status Updated");
      })
      .catch((error) => {
        console.log(error.message);
      });
  });

  app.post("/bookingsFromUser", (req, res) => {
    const email = req.body.email;
    bookingCollection.find({ orderedFrom: email }).toArray((err, bookings) => {
      res.send(bookings);
    });
  });

  app.post("/placeBooking", (req, res) => {
    const newBooking = req.body;
    bookingCollection.insertOne(newBooking).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // Reviews

  app.get("/reviews", (req, res) => {
    reviewCollection.find().toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/addReview", (req, res) => {
    const newReview = req.body;
    reviewCollection.insertOne(newReview).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  // Admins

  app.post("/makeAdmin", (req, res) => {
    const newAdmin = req.body;
    adminCollection.insertOne(newAdmin).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/checkAdmin", (req, res) => {
    adminCollection.find().toArray((err, adminEmail) => {
      res.send(adminEmail);
    });
  });

  if (err) {
    console.log(err.message);
  } else {
    console.log("Connected to Database");
  }
});

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send(`WonderTour Server running on port ${port}`);
});

app.listen(port);
