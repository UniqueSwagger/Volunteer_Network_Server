const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello volunteer network");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.spl8q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const run = async () => {
  try {
    await client.connect();
    const database = client.db("volunteer-network");
    const eventsCollection = database.collection("events");
    const registerCollection = database.collection("registerEvents");

    //get all events
    app.get("/events", async (req, res) => {
      const result = await eventsCollection.find({}).toArray();
      res.send(result);
    });

    //get particular event
    app.get("/events/:id", async (req, res) => {
      const id = req.params.id;
      const event = await eventsCollection.findOne({ _id: ObjectId(id) });
      res.send(event);
    });

    //post event
    app.post("/newEvent", async (req, res) => {
      const result = await eventsCollection.insertOne(req.body);
      res.send(result);
    });

    //post registration info
    app.post("/register", async (req, res) => {
      const registerInfo = req.body;
      const result = await registerCollection.insertOne(registerInfo);
      res.send(result);
    });

    //get all register info
    app.get("/registerInfo", async (req, res) => {
      const result = await registerCollection.find({}).toArray();
      res.send(result);
    });

    //get the registered events for particular user
    app.get("/registeredInfo/:emailId", async (req, res) => {
      const emailId = req.params.emailId;
      const result = await registerCollection
        .find({ email: emailId })
        .toArray();
      res.send(result);
    });

    //delete any particular event
    app.delete("/registeredEvent/:id", async (req, res) => {
      const id = req.params.id;
      const result = await registerCollection.deleteOne({ _id: ObjectId(id) });
      res.send(result);
    });
  } finally {
    // await client.close();
  }
};
run().catch(console.dir);

app.listen(port, () => {
  console.log("listening to the port", port);
});
