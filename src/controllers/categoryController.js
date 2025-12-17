import Category from "../models/Category";
// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin

export const createCategory = async (req, res) => {
  try {
    const { name, description, parent, image, metaTitle, metaDescription } =
      req.body;
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: "catergory already exists" });
    }
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res
          .status(404)
          .json({ message: "parent doesnt exists for this category" });
      }
    }
    const catergory = await Category.create({
      name,
      description,
      parent: parent || null,
      image,
      metaTitle,
      metaDescription,
    });

    res.status(201).json({
      success: true,
      data: catergory,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public

export const getCategories = async (req, res) => {
  const { parent, active } = req.query;
  try {
    const query = {};
    if (parent !== undefined) {
      query.parent = parent === "null" ? null : parent;
    }
    if (active !== undefined) {
      query.active = active === "true";
    }
    const categories = await Category.findOne(query)
      .populate("parent", "name slug")
      .sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get category tree (hierarchical structure)
// @route   GET /api/categories/tree
// @access  Public

export const getCategoryTree = async (req, res) => {
  try {
    const rootCategories  = await Category.find({ parent: null , isActive: true});

    const buildTree = async (parentId) => {
      const children = await Category.find({ parent: [parentId] , isActive: true});
      const tree=[];
      for (const child of children){
        const node = {
          _id: child._id,
          name: child.name,
          slug: child.slug,
          description: child.description,
          image: child.image,
          children: await buildTree(child._id),
        }
        tree.push(node);
      }
      return tree;
    };
    const tree=[];
    for(const root of rootCategories){
      const node = {
        _id: root._id,
        name: root.name,
        slug: root.slug,
        description: root.description,
        image: root.image,
        children: await buildTree(root._id),
      };
      tree.push(node);
    }
    res.status(200).json({
      success: true,
      data: tree
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single category by ID or slug
// @route   GET /api/categories/:identifier
// @access  Public

export const getCategory = async (req,res)=>{
  try {
    const {identifier} = req.params;
    const category = await Category.findById(identifier).populate("parent", "name slug");
    if(!category){
      category = await Category.findOne({slug: identifier}).populate("parent", "name slug");
    }
    if(!category){
      return res.status(404).json({message: "category not found"});
    }

    //get subcaterogories

    const subcaterogories= await Category.find({parent: category._id});
    res.status(200).json({
      success: true,
      data: {
        ...category.toObject(),
        subcaterogories
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin

export const updateCategory = async (req, res) => {
  try {
    const {id} = req.params;
    const {name , description , image , parent , metaTitle, metaDescription, isActive } = req.body;

    let category = await Category.findById(id);
    if(!category){
      return res.status(404).json({message:"category doesnt exist"})
    }

    if(parent&&parent.toString()!==category.parent?.toString()){
      if(parent===id){}
    }
  } catch (error) {
    
  }
};
