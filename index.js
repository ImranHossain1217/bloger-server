const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vwrnpfj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  const postsCollection = client.db("Bloger").collection("posts");

  app.get("/posts", async (req, res) => {
    const query = {};
    const posts = await postsCollection
      .find(query)
      .sort({ time: -1 })
      .toArray();
    res.send(posts);
  });

  app.get("/popularPosts", async (req, res) => {
    const query = {};
    const popularPosts = await postsCollection
      .find(query)
      .sort({ date: 1 })
      .toArray();
    res.send(popularPosts);
  });

  app.get("/posts/:id", async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const singlePost = await postsCollection.findOne(filter);
    res.send(singlePost);
  });

  app.get("/my-post", async (req, res) => {
    const email = req.query.email;
    const query = { email: email };
    const result = await postsCollection
      .find(query)
      .sort({ time: -1 })
      .toArray();
    res.send(result);
  });

  app.post("/posts", async (req, res) => {
    const post = req.body;
    const result = await postsCollection.insertOne(post);
    res.send(result);
  });

  app.put("/my-posts/update-post/:id", async (req, res) => {
    const updatePost = req.body;
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updateDoc = {
      $set: {
        title: updatePost.title,
        image: updatePost.image,
        description: updatePost.description,
      },
    };
    const result = await postsCollection.updateOne(filter, updateDoc, options);
    res.send(result);
  });

  app.delete("/my-post/:id", async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const result = await postsCollection.deleteOne(filter);
    res.send(result);
  });
};

run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});
