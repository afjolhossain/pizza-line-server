const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const port = process.env.PORT || 5000;

// userName: afjolhossain074;
// userPass: lvUDAHDEfANZ6lQS;
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://pizza-line-3a93f.web.app/",
      "https://pizza-line-3a93f.firebaseapp.com/",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  console.log("token come from inside", token);

  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }

  // verify the token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nfhzkgl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const productCollection = client.db("Pizza-Line").collection("products");
    const userCollection = client.db("Pizza-Line").collection("user");
    const bookingCollection = client.db("Pizza-Line").collection("booking");
    const contactCollection = client
      .db("Pizza-Line")
      .collection("contact-Info");

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "10h",
      });

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    app.post("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
    });

    // products related API :
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const newProducts = req.body;
      const result = await productCollection.insertOne(newProducts);
      res.send(result);
    });

    app.get("/user", verifyToken, async (req, res) => {
      const email = req.query.email;
      const query = { user_email: email };
      console.log(req.cookies);
      if (req.user.email !== req.query.email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });
    app.post("/user", async (req, res) => {
      const userData = req.body;
      const result = await userCollection.insertOne(userData);
      res.send(result);
    });

    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    app.put("/user/:id", async (req, res) => {
      const id = req.params.id;
      const options = { upsert: true };
      const filter = { _id: new ObjectId(id) };
      const updateInfo = req.body;
      const updateDoc = {
        $set: {
          userName: updateInfo.userName,
          productName: updateInfo.productName,
          price: updateInfo.price,
          catagory: updateInfo.catagory,
          user_email: updateInfo.user_email,
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    app.get("/user", async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //  user Order API
    app.get("/user", async (req, res) => {
      const email = req.query.email;
      const query = { user_email: email };
      console.log(query);
      const result = await userCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    // booking related API
    app.post("/booking", async (req, res) => {
      const bookingDate = req.body;
      const result = await bookingCollection.insertOne(bookingDate);
      res.send(result);
    });

    app.get("/booking", verifyToken, async (req, res) => {
      const email = req.query.email;
      const query = { user_email: email };
      if (req.user.email !== req.query.email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });
    app.delete("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/buyitem/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    // contact us API:
    app.post("/contact", async (req, res) => {
      const contactData = req.body;
      const result = await contactCollection.insertOne(contactData);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Pizza line is waiting for you");
});

app.listen(port, () => {
  console.log(`Pizza line is waiting for you at: ${port}`);
});
