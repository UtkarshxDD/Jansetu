import mongoose from 'mongoose';

mongoose.connect('mongodb+srv://uk94586794:B552E853QGMYAgn7@cluster0.fzv4m.mongodb.net/?appName=Cluster0')
  .then(async () => {
    const db = mongoose.connection.db;
    const posts = await db.collection('posts').find({}).toArray();
    console.log("Posts count:", posts.length);
    console.log("Media arrays:", posts.map(doc => doc.media || doc.image || doc.images));
    process.exit(0);
  });
