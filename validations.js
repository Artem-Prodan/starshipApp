//validations.js 

import { body } from "express-validator";

export const loginValidation = [
    body("email", "Wrong email format.").isEmail(),
    body("password", "Password must not be less than 5 characters.").isLength({min: 5}),
];

export const registerValidation = [
    body("email", "Wrong email format.").isEmail(),
    body("password", "Password must not be less than 5 characters.").isLength({min: 5}),
    body("nickName", "Nickname must not be less than 2 characters.").isLength({min: 2}),
];

//note CRUD validation

export const noteCreateValidation = [
  body("title")
    .optional({ nullable: true })
    .isString()
    .withMessage("Title must be a string"),

  body("imageUrl")
    .optional({ nullable: true })
    .isString()
    .withMessage("Wrong image link"),

  body("genre")
    .optional({ nullable: true })
    .isString()
    .withMessage("Enter title genre"),

  body("director")
    .optional({ nullable: true })
    .isString()
    .withMessage("Enter director name"),

  body("releaseYear")
    .optional({ nullable: true })
    .isString()
    .withMessage("Enter release year"),

  body("giveRating")
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 5 })
    .custom(value => {
      if (value % 0.5 !== 0) {
        throw new Error("Rating must be in 0.5 increments");
      }
      return true;
    }),

  body("comment")
    .optional({ nullable: true })
    .isString()
    .withMessage("Write a personal comment"),

  body("isFavorite")
    .optional({ nullable: true })
    .isBoolean()
    .withMessage("isFavorite must be boolean"),

  body("isWatchlisted")
    .optional({ nullable: true })
    .isBoolean()
    .withMessage("isWatchlisted must be boolean"),

  body("folderId")
    .optional({ nullable: true })
    .isInt()
    .withMessage("folderId must be an integer"),
];


export const noteUpdateValidation = [
  body("title").optional().isString(),
  body("imageUrl").optional().isString(),
  body("genre").optional().isString(),
  body("director").optional().isString(),
  body("releaseYear").optional().isString(),
  body("giveRating")
    .optional()
    .isFloat({ min: 0, max: 5 })
    .custom(value => {
      if (value % 0.5 !== 0) {
        throw new Error("Rating must be in 0.5 increments");
      }
      return true;
    }),
  body("comment").optional().isString(),
  body("isFavorite").optional().isBoolean(),
  body("isWatchlisted").optional().isBoolean(),
  body("folderId")
    .optional({ nullable: true })
    .custom(val => val === null || Number.isInteger(val))
    .withMessage("folderId must be an integer or null"),
];
