const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const { Schema } = mongoose;

const genreSchema = new Schema(
  {
    genreName: {
      type: String,
      required: true,
    },
    genreDescription: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const castSchema = new Schema(
  {
    castName: {
      type: String,
      required: true,
    },
    castBio: {
      type: String,
    },
    birthDate: {
      type: String,
      validate: {
        validator: function (v) {
          const yearOnly = /^\d{4}$/.test(v);
          const fullDate = /^\d{4}-\d{2}-\d{2}$/.test(v);

          return yearOnly || (fullDate && !isNaN(new Date(v)));
        },
        message: (props) =>
          `${props.value} must be in YYYY or YYYY-MM-DD format.`,
      },
      required: true,
    },
    deathDate: {
      type: Date,
      validate: {
        validator: function (v) {
          if (!v) {
            return true;
          }
          const birthDate = new Date(this.birthDate);

          if (isNaN(birthDate.valueOf())) {
            return true;
          }
          return v >= birthDate;
        },
      },
      message: "Death date must be after the birth date.",
    },
  },
  { _id: false },
);

const directorSchema = new Schema(
  {
    directorName: {
      type: String,
      required: true,
    },
    directorBio: {
      type: String,
    },
    birthDate: {
      type: String,
      validate: {
        validator: function (v) {
          const yearOnly = /^\d{4}$/.test(v);
          const fullDate = /^\d{4}-\d{2}-\d{2}$/.test(v);

          return yearOnly || (fullDate && !isNaN(new Date(v)));
        },
        message: (props) =>
          `${props.value} must be in YYYY or YYYY-MM-DD format.`,
      },
      required: true,
    },
    deathDate: {
      type: Date,
      validate: {
        validator: function (v) {
          if (!v) {
            return true;
          }
          const birthDate = new Date(this.birthDate);

          if (isNaN(birthDate.valueOf())) {
            return true;
          }
          return v >= birthDate;
        },
        message: "Death date must be after the birth date.",
      },
    },
  },
  { _id: false },
);

const movieSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  summary: {
    type: String,
    required: true,
  },
  genres: {
    type: [genreSchema],
    required: true,
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: "A movie must have at least one genre.",
    },
  },
  cast: {
    type: [castSchema],
    required: true,
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: "A movie must have at least one actor.",
    },
  },
  directors: {
    type: [directorSchema],
    required: true,
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: "A movie must have at least one director.",
    },
  },
  releaseDate: {
    type: Date,
  },
  imagePath: {
    type: String,
  },
  featured: {
    type: Boolean,
  },
});

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 6,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: (v) => {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address.`,
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 10,
    select: false,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },

  birthDate: {
    type: Date,
  },

  favoriteMovies: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
      },
    ],
    default: [],
  },
});

userSchema.statics.hashPassword = (password) => {
  return bcryptjs.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
  return bcryptjs.compareSync(password, this.password);
};

let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
