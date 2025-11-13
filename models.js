const mongoose = require('mongoose');
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
                return /^\d{4}$/.test(v) || !isNaN(new Date(v));
            },
            message: props => `${props.value} is not a valid year or date string`
        },
        required: true
    },
    death_date: {
        type: Date,
        validate: {
            validator: function(v){
                if (v) {
                    const birthDate = new Date(this.birth_date);
                    if (isNaN(birthDate.getTime())) { 
                        return true;
                    }
                    return v.getTime() >= birthDate.getTime();
                }
                return true;    
            },
            message: 'Death date must be after the birth date.'
        }  
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
                return /^\d{4}$/.test(v) || !isNaN(new Date(v));
            },
            message: props => `${props.value} is not a valid year or date string`
        },
        required: true
    },
    death_date: {
        type: Date,
        validate: {
            validator: function(v){
                if (v) {
                    const birthDate = new Date(this.birth_date);
                    if (isNaN(birthDate.getTime())) { 
                        return true;
                    }
                    return v.getTime() >= birthDate.getTime();
                }
                return true;    
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
        minlength: 6,
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [
            /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
            'Please enter a valid email address.'
        ]
    },
    password: {
        type: String,
        minlength: 10
    },
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    birth_date: {
        type: Date,
        required: true
    },
    favorite_movies: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie'
        }],
        default: []
     }
});

let Movie = mongoose.model('Movie', movieSchema); 
let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module. exports.User = User;