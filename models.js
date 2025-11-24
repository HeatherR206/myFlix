const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;

const genreSchema = new Schema({
    genre_name: {
        type: String,
        required: true
    },
    genre_description: {
        type: String,
        required: true
    }
}, { _id: false });

const actorSchema = new Schema({
    actor_name: {
        type: String,
        required: true
    },
    actor_bio: {
        type: String
    },
    birth_date: {
        type: String,
        validate: {
            validator: function(v) {
                const yearOnly = /^\d{4}$/.test(v);
                const fullDate = /^\d{4}-\d{2}-\d{2}$/.test(v);
                
                return yearOnly || (fullDate && !isNaN(new Date(v))); 
            },
            message: props => `${props.value} must be in YYYY or YYYY-MM-DD format.`
        },
        required: true
    },
    death_date: {
        type: Date,
        validate: {
            validator: function(v){
                if (!v) {
                    return true;
                }
                const birthDate = new Date(this.birth_date);

                if (isNaN(birthDate.valueOf())) { 
                    return true;
                }
                return v >= birthDate;
            }                  
        },
            message: 'Death date must be after the birth date.'  
    },
}, { _id: false });

const directorSchema = new Schema({
    director_name: {
        type: String,
        required: true
    },
    bio: {
        type: String
    },
    birth_date: {
        type: String,
        validate: {
            validator: function(v) {
                const yearOnly = /^\d{4}$/.test(v);
                const fullDate = /^\d{4}-\d{2}-\d{2}$/.test(v);
                
                return yearOnly || (fullDate && !isNaN(new Date(v))); 
            },
            message: props => `${props.value} must be in YYYY or YYYY-MM-DD format.`
        },
        required: true
    },
    death_date: {
        type: Date,
        validate: {
            validator: function(v){
                if (!v) {
                    return true;
                }
                const birthDate = new Date(this.birth_date);

                if (isNaN(birthDate.valueOf())) { 
                    return true;
                }
                return v >= birthDate;  
            },
            message: 'Death date must be after the birth date.'
        }  
    },
}, { _id: false });

const movieSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    summary: {
        type: String,
        required: true
    },
    genres: {
        type: [genreSchema],
        required: true,
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'A movie must have at least one genre.'
        }
    },
    actors: {
        type: [actorSchema],
        required: true,
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'A movie must have at least one actor.'
        }
    },
    directors: {
        type: [directorSchema],
        required: true,
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'A movie must have at least one director.'
        }
    },   
    release_date: {
        type: Date
    },
    image_path: {
        type: String
    },
    featured: {
        type: Boolean
    }
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
            message: props => `${props.value} is not a valid email address.`
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 10,
        select: false
    },
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },

    birth_date: {
        type: Date,
    },

    favorite_movies: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie'
        }],
        default: []
     }
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

// userSchema.pre('save', async function(next) {
//     const user = this;
//     if (user.isModified('password')) {
//         const salt = await bcrypt.genSalt(10);
//         user.password = await bcrypt.hash(user.password, salt);    
//     }
//     next();
// });

// userSchema.methods.comparePassword = function(candidatePassword) {
//     return bcrypt.compare(candidatePassword, this.password);
// };


let Movie = mongoose.model('Movie', movieSchema); 
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;