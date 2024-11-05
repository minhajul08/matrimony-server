const express = require('express');
const app = express ();
const cors = require ('cors');
const { ObjectId } = require('mongodb')
require('dotenv').config()
const port = process.env.PORT || 5000;

//  middleware 

app.use(cors ());
app.use (express.json ());





const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.01tlpf1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
      const premiumMember = client.db('Matrimony').collection('premiumMember');
      const successStory = client.db('Matrimony').collection('SuccessStory');
      const bioData = client.db('Matrimony').collection('BioData');
      const addToFavorite = client.db('Matrimony').collection('addToFavorite');


      // premiumMember 
      app.get ('/premiumMember', async (req,res) => {
         const result = await premiumMember.find().toArray();
         res.send (result);
      })

      // success-story

      app.get ('/successStory', async (req,res) => {
        const result = await successStory.find().toArray();
        res.send (result);
      })

      // BioData 

      app.get ('/bioData', async (req,res) => {
        const result = await bioData.find().toArray();
        res.send(result)
      })

      app.get('/bioDataDetails/:id',  async (req, res) => {
        const id = req.params.id
        const query = { _id: new ObjectId(id) }
        const result = await bioData.findOne(query)
        res.send(result)
      })
 
      app.get('/favorite', async (req, res) => {
        const email = req.query.email;
        const query = { email: email };
        const result = await addToFavorite.find(query).toArray();
        res.send(result);
    });
    
     

     // add to favorite

     app.post ('/favorite', async (req,res) => {
      const favorite = req.body
      const result = await addToFavorite.insertOne(favorite)
      res.send (result)

     })


    // Connect the client to the server	(optional starting in v4.7)
   //  await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   //  await client.close();
  }
}
run().catch(console.dir);



app.get ('/', (req,res) => {
   res.send ('matrimony server is running')
})


app.listen (port , () => {
   console.log (`matrimony server is running in ${port}`)
})






