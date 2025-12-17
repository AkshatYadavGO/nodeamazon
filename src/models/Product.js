import mongoose from "mongoose";
import Category from "./Category";

const ProductSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim : true,
        maxlenght: 200
    },
    slug:{
        type: String,
        unique: true,
        lowercase: true
    },
    sku:{
        type: String,
        unique: true,
        sparse: true
    },
    description:{
        type: String,
        required: true,
        maxlenght: 5000
    },
    subDescription:{
        type: String,
        maxlenght: 500
    },
    price : {
        type : Number,
        required: true,
        min:0
    },
    comparePrice:{
        type: Number,
        min:0,
        default: null
    },
    costPrice : {
        type : Number,
        default: null,
        min:0
    },
    category :{
        type : mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    image :[{
        url : {
            type: String,
            required: true
        },
        alt:{
            type: String,
            default:""
        },
        isMain:{
            type: Boolean,
            default: false
        }
    
    }
    ],
    stock : {
        type:Number,
        required : true,
        default :  0,
        min : 0,
    },
    lowStockThreshold:{
        type: Number,
        default: 10
    },
    status : {
        type : String,
        enum: ["active", "draft", "archived"],
        default: ["active"]
    },
    isFeatured : {
        type : Boolean,
        default : false
    },
    tags:[String],
    specifications: [
        {
            name: String,
            value: String
        }
    ],
    rating :{
       average : {
            type: Number,
            min:0,
            max:5,
            default:0
        },
        count:{
            type :Number,
            default:0
        }
    },
    metaTitle: {
      type: String,
      maxlength: [60, "Meta title cannot exceed 60 characters"],
    },
    metaDescription: {
      type: String,
      maxlength: [160, "Meta description cannot exceed 160 characters"],
    },
    createdBy:{
        type : mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    }
},
{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

ProductSchema.pre("save",function(next){
    if(this.isModified("name")){
        this.slug=this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    }
    next();
});
ProductSchema.virtual("discountPercentage").get(function(){
    if(this.comparePrice&&this.comparePrice>this.price){
        return Math.round((this.comparePrice - this.price) / this.comparePrice * 100);
    }
    return 0;
});

ProductSchema.virtual("stockStatus").get(function(){
    if (this.stock === 0) return "out_of_stock";
  if (this.stock <= this.lowStockThreshold) return "low_stock";
  return "in_stock";
});

ProductSchema.index({ name: "text", description: "text", tags: "text" });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });

export default mongoose.model("Product", ProductSchema);    