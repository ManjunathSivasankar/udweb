const Product = require("../models/Product");

// Get all products
const getProducts = async (req, res) => {
  try {
    // Optimization: Exclude large fields when listing products to reduce response size
    const products = await Product.find()
      .select("-description -specifications")
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching product", error: error.message });
  }
};

// Create Product (Admin mainly)
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      images,
      fabric,
      color,
      sizes,
    } = req.body;
    const newProduct = new Product({
      name,
      description,
      price,
      category,
      image,
      images,
      fabric,
      color,
      sizes,
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating product", error: error.message });
  }
};

// Delete Product (Admin mainly)
const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  deleteProduct,
};
