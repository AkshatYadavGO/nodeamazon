import mongoose from "mongoose";
import bcrypt from "bcrypt"

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
         match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
        type: String,
        enum: ["Manager", "Admin", "Customer"],
        default: "Customer"
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
},
    { timestamps: true });

UserSchema.pre("save", async function (next){
    if(!this.isModified("password")){
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
});

UserSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
};

export default mongoose.model("User",UserSchema)