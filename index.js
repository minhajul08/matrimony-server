const express = require('express');
const app = express ();
const cors = require ('cors');
const jwt = require ('jsonwebtoken');
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
      const userCollection = client.db('Matrimony').collection ('users');

      app.post ('/jwt', async (req,res) => {
        const user = req.body;
        const token = jwt.sign (user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: '1h'});
          res.send ( {token} );
      })

      // middleware 

      const verifyToken = (req,res,next) => {
        console.log ('inside verify token',req.headers.authorization);
        if (!req.headers.authorization) {
          return res.status(401).send ( {message: 'Unauthorized Access'});
        }
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify (token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
          if (err) {
            return res.status(401).send ( {message: 'Unauthorized Access'})
          }
          req.decoded = decoded;
          next ();
        })
        // next ();
      }

      // user related api 

      app.post('/users', async (req,res) => {
        const user = req.body;
        const query = {email: user.email}
        const existingUser = await userCollection.findOne (query);
        if (existingUser) {
          return res.send ({ message: 'user already exists', insertedId: null})
        }
        const result = await userCollection.insertOne(user)
        res.send (result)
      })


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

    app.delete ('/favorite/:id', async (req,res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await addToFavorite.deleteOne(query);
      res.send (result)
    })
 
    // users api
    app.get ('/users', verifyToken, async (req,res) => {
      
      const result = await userCollection.find().toArray();
      res.send (result)
    })

    app.get ('/users/admin/:email', verifyToken, async (req,res) => {
      const email = req.params.email;
      if (email !== req.decoded.email){
        return res.status(403).send ({message: 'forbidden access'})
      }
      const query = {email: email};
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin =user?.role === 'admin';
      }
      res.send ({ admin });
    })

    // make admin
    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      };
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    
    // make premium

    app.patch ('/users/premium/:id', async (req,res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updatedDoc = {
        $set : {
          premium: 'premium'
        }
      };
      const result = await userCollection.updateOne(filter,updatedDoc)
      res.send(result)
    })
     

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






