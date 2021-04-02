const express = require("express");
const app = express();
require("dotenv").config();
const port = 4000;
const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const ObjectId = require("mongodb").ObjectId;
const MongoClient = require("mongodb").MongoClient;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ocnvo.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const productsCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("booksCollection");
  const placedOrder = client.db("book_voice").collection("placedOrder");

  //create data
  app.post("/insertProduct", (req, res) => {
    const product = req.body;
    productsCollection.insertOne(product).then((result) => {
      res.send({
        message: "You have successfully inserted your product in database",
        isInserted: result.insertedCount > 0,
      });
    });
  });
  //store information of placed order
  app.post("/placeOrder", (req, res) => {
    const orderDetails = req.body;
    placedOrder.insertOne(orderDetails).then((result) => {
      res.send({
        message: "You have successfully placed your order",
        isInserted: result.insertedCount > 0,
      });
    });
  });

  //Read database
  app.get("/getAllProducts", (req, res) => {
    productsCollection
      .find({})
      .toArray((error, documents) => res.send(documents));
  });

  //read database based on id
  app.get("/getProduct/:id", (req, res) => {
    const id = req.params.id;
    productsCollection
      .findOne({
        _id: ObjectId(id),
      })
      .then((result) => res.send(result));
  });

  // get all order placed by a single user
  app.get("/getOrderDetails/:email", (req, res) => {
    const email = req.params.email;
    console.log(email);
    placedOrder.find({ email }).toArray((err, document) => {
      res.send(document);
    });
  });

  //get all orders' data placed by users
  app.get("/getAllOrders", (req, res) => {
    placedOrder.find({}).toArray((error, documents) => res.send(documents));
  });

  //update product
  app.patch("/updateProduct/:id", (req, res) => {
    const id = req.params.id;
    console.log(req.body, id);
    updateProduct = req.body;
    console.log(updateProduct);
    productsCollection
      .updateOne(
        { _id: ObjectId(id) },
        {
          $set: updateProduct,
        }
      )
      .then((result) => res.send({ message: "updated successfully" }));
  });

  //delete a product
  app.delete("/delete/:id", (req, res) => {
    const id = req.params.id;
    console.log("hello", id);
    productsCollection.deleteOne({ _id: ObjectId(id) }).then((result) => {
      console.log(result);
      res.send({ message: "deleted successfully" });
    });
  });

  //search function
  // app.get("/search", function (req, res) {
  //   console.log(req.body.query);
  //   productsCollection
  //     .find({ book_name: { $regex: /^javascript/i } })
  //     .toArray(function (err, items) {
  //       res.send(items);
  //     });
  // });
  //   //end of mongodb function
});

app.listen(process.env.PORT || port);
