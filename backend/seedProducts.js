const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const Collection = require("./models/Collection");
const Testimonial = require("./models/Testimonial");

dotenv.config();

const dummyProducts = [];

const dummyCollections = [
  {
    collectionId: "anime",
    name: "Anime Collection",
    image:
      "https://i.pinimg.com/736x/b2/64/22/b26422589c9f8a201fc50fd1d7daf318.jpg",
  },
  {
    collectionId: "Garage",
    name: "Garage Collection",
    image:
      "https://i.pinimg.com/1200x/cf/be/5f/cfbe5fb59488600dc64bcdff47f0f8a8.jpg",
  },
  {
    collectionId: "Devotional",
    name: "Devotional Collection",
    image:
      "https://i.pinimg.com/736x/95/ee/59/95ee590ab029d3cfed1692823b90d04b.jpg",
  },
  {
    collectionId: "acid-wash",
    name: "Acid Wash",
    image:
      "https://i.pinimg.com/1200x/3f/5a/9c/3f5a9cad2a36a5abb07ae6d3ed108d60.jpg",
  },
  {
    collectionId: "oversized-blanks",
    name: "Oversized Blanks",
    image:
      "https://i.pinimg.com/736x/9e/e8/21/9ee8215f7309ad10ee69272c42d21237.jpg",
  },
  {
    collectionId: "Quotes",
    name: "Quotes Collection",
    image:
      "https://i.pinimg.com/1200x/89/a9/f9/89a9f99fc4580317a19f181ee494dd74.jpg",
  },
];

const dummyTestimonials = [
  {
    text: "The acid wash heavyweight tee completely changed my wardrobe. The fit is insane.",
    name: "Alex Morgan",
    rating: 5,
  },
  {
    text: "Finally a brand that understands oversized cuts without looking boxy and cheap.",
    name: "Sam Rivera",
    rating: 5,
  },
  {
    text: "The details on the Devotional collection are beautiful. Premium quality feel all around.",
    name: "Jordan Lee",
    rating: 5,
  },
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");

    // Clear existing data
    await Product.deleteMany({});
    await Collection.deleteMany({});
    await Testimonial.deleteMany({});
    console.log("Cleared existing products and collections");

    // Insert dummy data
    await Product.insertMany(dummyProducts);
    await Collection.insertMany(dummyCollections);
    await Testimonial.insertMany(dummyTestimonials);
    console.log(
      "Successfully seeded database with dummy products and collections!",
    );

    process.exit();
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });
