//index.js


import express from "express";
import multer from "multer";
import cors from "cors";


import {userController, noteController, folderController} from "./CONTROLLERS/contExports.js";
import {checkAuth, handleValidationErrors} from "./utils/utilsExports.js";
import {registerValidation, loginValidation, noteCreateValidation, noteUpdateValidation} from "./validations.js";


const app = express();

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, "uploads");
    },
    filename: (_, file, cb) => {
        const ext = file.originalname.split('.').pop();
        const safeName = Date.now() + '-' + file.originalname
          .replace(/\s+/g, '_')  
          .replace(/[^\w.-]/g, '') 
          .slice(0, 40);          

        cb(null, safeName);
    },
});


const upload = multer({storage});


app.use(cors());

app.use(express.json());
app.use(`/uploads`, express.static("uploads"));

//authorization
app.post("/auth/login", loginValidation, handleValidationErrors, userController.login);
//registration
app.post("/auth/register", registerValidation, handleValidationErrors, userController.register);
//get me
app.get("/auth/me", checkAuth, userController.getMe);
//update user
app.patch("/auth/me", checkAuth, userController.updateUser);



app.post("/uploads", checkAuth, upload.single("image"), (req, res) => {
    res.json({
        url: `/uploads/${req.file.filename}`,
    });
});





//note CRUD
app.get("/notes", checkAuth, noteController.getAll);
app.get("/notes/:mynote", checkAuth, noteController.getOne);
app.get("/notes/favorites", checkAuth, noteController.getFavorites);
app.get("/notes/watchlist", checkAuth, noteController.getWatchlist);

app.post("/notes", checkAuth, noteCreateValidation, handleValidationErrors, noteController.create);
app.delete("/notes/:mynote", checkAuth, noteController.remove);
app.patch("/notes/:mynote", checkAuth, noteUpdateValidation, handleValidationErrors, noteController.update);



// FOLDER API
app.get("/folders", checkAuth, folderController.getAll);
app.post("/folders", checkAuth, folderController.create);
app.get("/folders/:id/notes", checkAuth, folderController.getNotes);
app.delete("/folders/:id", checkAuth, folderController.remove);



app.listen(4000, (err)=>{
    if (err){
        return console.log(err);
    }
    console.log("Server OK");
});
