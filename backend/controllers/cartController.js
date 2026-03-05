const User = require("../models/User");

// Get User Garaget
const getGaraget = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(200).json([]);
    }
    res.status(200).json(user.GaragetItems);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching Garaget", error: error.message });
  }
};

// Add to Garaget / Update Quantity
const updateGaragetItem = async (req, res) => {
  try {
    const { product, size, delta, isAdd } = req.body;
    let user = await User.findOne({ firebaseUid: req.user.uid });

    // If user doesn't exist in MongoDB yet, create them
    // (You might want a dedicated registration endpoint, but this auto-creates for ease of use)
    if (!user) {
      user = new User({
        firebaseUid: req.user.uid,
        email: req.user.email || "no-email",
        GaragetItems: [],
      });
    }

    const GaragetId = `${product.id || product._id}-${size}`;
    const existingItemIndex = user.GaragetItems.findIndex(
      (item) => item.GaragetId === GaragetId,
    );

    if (existingItemIndex > -1) {
      // Update existing item
      if (isAdd) {
        user.GaragetItems[existingItemIndex].quantity += 1;
      } else {
        const newQty = Math.max(
          1,
          user.GaragetItems[existingItemIndex].quantity + delta,
        );
        user.GaragetItems[existingItemIndex].quantity = newQty;
      }
    } else if (isAdd) {
      // Add new item
      user.GaragetItems.push({
        GaragetId,
        productId: product.id || product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        size,
        quantity: 1,
      });
    }

    await user.save();
    res.status(200).json(user.GaragetItems);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating Garaget", error: error.message });
  }
};

// Remove from Garaget
const removeFromGaraget = async (req, res) => {
  try {
    const { GaragetId } = req.params;
    const user = await User.findOne({ firebaseUid: req.user.uid });

    if (!user) return res.status(404).json({ message: "User not found" });

    user.GaragetItems = user.GaragetItems.filter(
      (item) => item.GaragetId !== GaragetId,
    );
    await user.save();

    res.status(200).json(user.GaragetItems);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing from Garaget", error: error.message });
  }
};

// Clear Garaget
const clearGaraget = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });

    if (!user) return res.status(404).json({ message: "User not found" });

    user.GaragetItems = [];
    await user.save();

    res.status(200).json(user.GaragetItems);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error clearing Garaget", error: error.message });
  }
};

module.exports = {
  getGaraget,
  updateGaragetItem,
  removeFromGaraget,
  clearGaraget,
};
