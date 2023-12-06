const express = require("express");
const app = express();
const Joi = require("joi");
const multer = require("multer");
app.use(express.static("public"));
app.use(express.json());
const cors = require("cors");
app.use(cors());
const mongoose = require("mongoose");

const upload = multer({ dest: __dirname + "/public/images" });

mongoose
  .connect(
    "mongodb+srv://abisatti18:myuofsc3@cluster1.5hvwyyk.mongodb.net/"
  )
  .then(() => console.log("Connected to mongodb..."))
  .catch((err) => console.error("could not connect ot mongodb...", err));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/fence.html");
});

const fenceSchema = new mongoose.Schema({
    make: String,
    model: String,
    year: Number,
    type: String,
    features: [String],
    img: String,
    _id: Number
});

const Fence = mongoose.model("Fence", fenceSchema);

app.get("/api/fences", (req, res) => {
    getFences(res);
});
  
const getFences = async (res) => {
    const fences = await Fence.find();
    res.send(fences);
};

app.post("/api/fences", upload.single("img"), async (req, res) => {
    console.log(req.body);
    const result = validateFence(req.body);

    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }

    // Hack to find new ID\
    const fences = await Fence.find();
    console.log(fences);
    let maxID = 0;
    for (x = 0; x < fences.length; x++) {
        if (fences[x]._id > maxID) {
            maxID = fences[x]._id;
        }
    }
    maxID++;

    const fence = new Fence({
        _id: maxID,  
        make: req.body.make,
        model: req.body.model,
        year: req.body.year,
        type: req.body.type,
        features: req.body.features.split(","),
    });

    if (req.file) {
        fence.img = "images/" + req.file.filename;
    }

    createFence(fence, res);
});

const createFence = async (fence, res) => {
    const result = await fence.save();
    res.send(fence);
};

app.put("/api/fences/:id", upload.single("img"), (req, res) => {
    const result = validateFence(req.body);
    
    if (result.error) {
        res.status(400).send(result.error.details[0].message);
        return;
    }
    updateFence(req, res);
});        

const updateFence = async (req, res) => {
    let fieldsToUpdate = {
        make: req.body.make,
        model: req.body.model,
        year: req.body.year,
        type: req.body.type,
        features: req.body.features.split(","),
    };

    if (req.file) {
        fieldsToUpdate.img = "images/" + req.file.filename;
    }

    const result = await Fence.updateOne({ _id: req.params.id }, fieldsToUpdate);
    const fence = await Fence.findById(req.params.id);
    res.send(fence);
};

app.delete("/api/fences/:id", upload.single("img"), (req, res) => {
    removeFence(res, req.params.id);
});

const removeFence = async (res, id) => {
    const fence = await Fence.findByIdAndDelete(id);
    res.send(fence);
  };

const validateFence = (fence) => {
    const schema = Joi.object({
        _id: Joi.allow(""),
        make: Joi.string().required(),
        model: Joi.string().required(),
        year: Joi.number().integer().required(),
        type: Joi.string().required(),
        features: Joi.allow(""),
    });

    return schema.validate(fence);
};

app.listen(3000, () => {
    console.log("Running");
});