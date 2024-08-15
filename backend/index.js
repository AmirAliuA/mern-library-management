/*
  This backend application is built using Node.js with the Express framework and connects to a
  MongoDB database. It serves as an API for managing a library's book inventory, allowing users
  to perform various operations such as adding, updating, retrieving, and deleting books.

  Key features:
    - CRUD Operations:
        The backend supports Create, Read, Update, and Delete operations for book records, 
        allowing users to manage their library inventory effectively.
    
    - Category Filtering:
        Users can retrieve books by category, enabling easier access to specific types of literature.
    
    - RESTful API: 
        The application follows RESTful principles, making it intuitive to interact with using standard HTTP methods.

  How It Works:
    - Setup and Initialization:
        The application initializes by loading environment variables from a .env file, which includes the MongoDB connection string.
        It creates an instance of an Express application and sets up middleware for handling CORS and JSON request bodies.

    - MongoDB Connection:
        A MongoDB client is created, and the application connects to the MongoDB server. It verifies the connection by sending a ping command.

    - Route Definitions:
        Various API endpoints are defined using Express route handlers:
        POST /upload-book: Inserts a new book record into the database.
        GET /all-books: Retrieves all book records or filters them by category.
        PATCH /book/:id: Updates an existing book record identified by its ID.
        DELETE /book/:id: Deletes a book record identified by its ID.
        GET /book/:id: Retrieves a single book record based on its ID.

    - Error Handling:
        The application includes error handling for database operations, ensuring that users receive appropriate error messages if something goes wrong.

    - Server Listening:
        Finally, the application starts listening on a specified port (default is 5000), making it ready to handle incoming API requests.

  Why I placed the route handlers outside the run asynchronus function:
    - Server setup seperation: 
        Maintain a clear separation between the application’s setup logic (like connecting to the database) 
        and the route handlers. This organization makes the code easier to read and maintain.

    - Application initialization:
        express app (+ routes) is ready to handle requests 
        as soon as the server starts listening, even if the database connection is still established.

    - Consistent structure & code readibility

    - Scope management
*/

// imports
const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());

// mongodb client options & database configuration
const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// routes
app.get('/', (req, res) => {
  res.send('Hello World!');
})

// mongodb collections
const bookCollections = client.db("library-management").collection("books");

// insert a book to the database - POST method
app.post("/upload-book", async (req, res) => {
  const data = req.body;
  // console.log(data);
  const result = await bookCollections.insertOne(data);
  res.send(result);
});

// get all books & find by a category from the database
app.get("/all-books", async (req, res) => {
  let query = {};

  if (req.query?.category) {
    query = { category: req.query.category }
  }

  const result = await bookCollections.find(query).toArray();
  res.send(result);
});

// update a book - PATCH method
app.patch("/book/:id", async (req, res) => {
  const id = req.params.id;
  // console.log(id);
  const updateBookData = req.body;
  const filter = { _id: new ObjectId(id) };
  const updatedDoc = {
    $set: {
      ...updateBookData
    }
  }

  const options = { upsert: true };

  // update now
  const result = await bookCollections.updateOne(filter, updatedDoc, options);
  res.send(result);
});

// delete a book from the database - DELETE method
app.delete("/book/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const result = await bookCollections.deleteOne(filter);
  res.send(result);
});

// get data from a single book
app.get("/book/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const result = await bookCollections.findOne(filter);
  res.send(result);
});

async function run() {
  try {
    // connect the client to the server
    await client.connect();
    
    // ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

// handles errors in asynchronus functions
run().catch(console.dir);

// start the server
app.listen(port, () => {
  console.log(`The backend server is running under port ${port}`)
})