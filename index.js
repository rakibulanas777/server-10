const express = require("express");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
const port = process.env.PORT || 8000;

dotenv.config();
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://rakibulanas777:78ijcfUJEqn9uziK@cluster0.beey76q.mongodb.net/tour?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

connectToMongoDB();

app.post("/users", async (req, res) => {
  try {
    const user = req.body;
    const database = client.db("usersDB");
    const usersCollection = database.collection("users");
    const result = await usersCollection.insertOne(user);
    const token = jwt.sign({ id: result.insertedId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "User added successfully",
      userId: result.insertedId,
      token,
    });
    console.log(result);
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ error: "Failed to add user" });
  }
});

app.post("/tours", async (req, res) => {
  try {
    const tour = req.body;
    const database = client.db("your_database_name");
    const toursCollection = database.collection("tours");
    const result = await toursCollection.insertOne(tour);
    res.status(201).json({
      message: "Tour added successfully",
      tourId: result.insertedId,
    });
    console.log(result);
  } catch (error) {
    console.error("Error adding tour:", error);
    res.status(500).json({ error: "Failed to add tour" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
