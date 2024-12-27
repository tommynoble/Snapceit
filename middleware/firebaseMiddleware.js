const db = require('../firebaseConfig');

const firebaseMiddleware = async (req, res, next) => {
  try {
    // Example: Fetch data from Firebase
    const snapshot = await db.collection('your-collection').get();
    const data = snapshot.docs.map(doc => doc.data());

    // Attach data to the request object
    req.firebaseData = data;

    next();
  } catch (error) {
    console.error('Error fetching data from Firebase:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = firebaseMiddleware;
