const express = require("express");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { ObjectId } = require("mongodb");
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
      user: result,
      token,
    });
    console.log(result);
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ error: "Failed to add user" });
  }
});

app.get("/users/current-user", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log(token);
    if (!token) {
      return res.status(401).json({ error: "Token not provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded);
    const userId = decoded.id;

    await client.connect();
    const database = client.db("usersDB");
    const usersCollection = database.collection("users");
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ error: "Failed to fetch current user" });
  } finally {
    await client.close();
  }
});

app.post("/tours", async (req, res) => {
  try {
    const tour = req.body;
    const database = client.db("toursDB");
    const toursCollection = database.collection("tour");
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

app.get("/tours", async (req, res) => {
  try {
    const database = client.db("toursDB");
    const toursCollection = database.collection("tour");
    const tours = await toursCollection.find({}).toArray();
    res.status(200).json(tours);
  } catch (error) {
    console.error("Error fetching tours:", error);
    res.status(500).json({ error: "Failed to fetch tours" });
  }
});

app.get("/tours/:tourId", async (req, res) => {
  try {
    const { tourId } = req.params;
    const database = client.db("toursDB");
    const toursCollection = database.collection("tour");
    const tour = await toursCollection.findOne({ _id: new ObjectId(tourId) });

    if (!tour) {
      return res.status(404).json({ error: "Tour not found" });
    }

    res.status(200).json(tour);
  } catch (error) {
    console.error("Error fetching tour:", error);
    res.status(500).json({ error: "Failed to fetch tour" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
