import Product from "../models/Product";
import Category from "../models/Category";
import e from "cors";

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      description,
      shortDescription,
      price,
      comparePrice,
      costPrice,
      category,
      images,
      stock,
      lowStockThreshold,
      status,
      isFeatured,
      tags,
      specifications,
      metaTitle,
      metaDescription,
    } = req.body;

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found" });
    }
    if (sku) {
      const skuExists = await Product.findOne({ sku });
      if (skuExists) {
        return res.status(400).json({ message: "Sku already exists" });
      }
    }
    const product = await Product.create({
      name,
      sku,
      description,
      shortDescription,
      price,
      comparePrice,
      costPrice,
      category,
      images: images || [],
      stock: stock || 0,
      lowStockThreshold,
      status: status || "active",
      isFeatured: isFeatured || false,
      tags: tags || [],
      specifications: specifications || [],
      metaTitle,
      metaDescription,
      createdBy: req.user._id, // From auth middleware
    });
    const populatedProduct = await Product.findById(product._id).populate(
      "category",
      "name slug"
    );

    res.status(201).json({
      success: true,
      data: populatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get all products with filtering, search, pagination
// @route   GET /api/products
// @access  Public

export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      status,
      search,
      sort = "-createdAt",
      isFeatured,
      inStock,
    } = req.query;
    const query = {};
    if (category) {
      query.category = category;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }
    if (status) {
      query.status = status;
    } else if (!req.user || res.user.role !== "admin") {
      query.status = "active";
    }
    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === "true";
    }
    if (search) {
      query.$text = { $search: search };
    }
    if (inStock === "true") {
      query.stock = { $gt: 0 };
    }
    const skip = (Number(page) - 1) * Number(limit);
    const products = await Product.find(query)
      .populate("category", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));
    const total = await Product.countDocuments(query);
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
