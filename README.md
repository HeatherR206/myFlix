# 🎞️  myFlix Movie API Repository

The myFlix API is a [**RESTful API**](https://restfulapi.net/) powered by **JavaScript** running on the **Node.js runtime environment (RTE)** and utilizing **Express** to handle routing and middleware.     


## **URLs**

**Live API URL: https://my-flix-movies-0d84af3d4373.herokuapp.com/**    

**Heroku Git URL: https://git.heroku.com/my-flix-movies.git**  

**GitHub repo URL: https://github.com/HeatherR206/myFlix.git**

**Local URL: http://localhost:8080/movies**


## **TECHNICAL SPECS**

- **RESTful API** architecture utilizing the **Node.js runtime environment (RTE)**

- **Express.js** framework: server-side routing and handling

- **MongoDB Atlas**, a cloud-based NoSQL database, with **Mongoose** schema-based data modeling logic

- **JSON objects:** the data format returned for all HTTP request responses.

- **Heroku:** host for API deployment

- **Passport** authentication for password validation and **JSON Web Tokens (JWT)** for user authorization.

- **Data Security:**
    - **CORS:** manages all domain origin access
    - **express-validator:** endpoint data validation (middleware)
    - **bcrypt:** password hashing (middleware)
    - **environment variables:** securely manages sensitive configuration data

- **Morgan:** logging middleware

- **Postman:** testing and debugging endpoints

## **SET UP**

1. Determine hosting sites for your API and database.

2. Clone myFlix repository

3. Install **MongoDB Atlas** (for cloud-based server) or **MongoDB Community Server** (for local server)

4. **Install Dependencies** in your **project's root directory**.   
*If bulk installing dependencies, separate each with a space*

```
   npm install --save <dependency_name>
``` 

## **API ENDPOINTS**

| HTTP <br> Request | Endpoint | Example | Description |
|-------------------|----------|---------|---|------------|
| **GET** | `/movies` | `/movies` | Get all movies |
| **GET** | `/movies/:title` | `/movies/Die%20Hard` | Get a single movie by title |
| **GET** | `/genres/:genreName` | `/genres/Comedy` | Get genre info by name |
| **GET** | `/directors/:directorName` | `/directors/Rob%20Reiner` | Get director data by name |
| **POST** | `/users` | `/users` | Register a new user |
| **POST** | `/users/:username/movies/:movieId` | `/users/testuser/movies/65561b8dc9510166299d6d3e` | Add movie to user's "Favorite Movies" |
| **POST** | `/login` | `/login` | Generates required JWT token to access database |
| **PUT** | `/users/:username` | `/users/sampleuser` | Update user profile by username |
| **DELETE** | `/users/:username/movies/:movieId` | `/users/testuser/movies/65561b8dc9510166299d6d3e` | Remove movie from user's "Favorite Movies" |
| **DELETE** | `/users/:username` | `/users/sampleuser` | Remove a registered user by username|


### **TOKEN-BASED AUTHENTICATION**

- All endpoints, with the exception of `POST /login` and `POST /users`, require a valid **JSON Web Token (JWT)** to access the database
- A unique token is obtained with a successful login 
- Add the token to your request header (Key : Value):     
 
```
    Authorization : Bearer <user_token>   
```
      
    

## **EXAMPLE REQUESTS**

**Response Body: `POST /users`**

```json
    {
        "username": "Jane_Doe525",      // Required
        "password": "myS3cur3P@ss!",    // Required
        "email": "jane@example.com",    // Required
        "first_name": "Jane"            // Optional
    }
```    

**HTTP JavaScript: `POST /users`**

```js

    app.post('/users', async (req, res) => {
        try { 
            // Checks if username already exists (a Mongoose validation check) 
            let user = await Users.findOne({ username: req.body.username });

            if (user) {
                return res.status(400).send(req.body.username + 'already exists');
            }
            // Mongoose schema validation automatically checks for 'name', 'password', 
            // and 'email' as defined by 'required: true' in the User Schema.  
            let newUser = await Users.create({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                birth_date: req.body.birth_date,
            // favorite_movies will default to [] if defined in the Schema
                favorite_movies: req.body.favorite_movies 
            });
            
            res.status(201).json(newUser);
        
        } catch (error) { 
        // Mongoose validation errors or other DB errors
            console.error(error);
            res.status(500).send('Error: ' + error);
        }
    });

```    

## **EXAMPLE RESPONSES**

**✅ Response Success: `GET /directors/:directorName`**

```json

    {
        "director_name": "Peter Doe",
        "bio": "A brief biography of the director.",
        "birth_date": "1973-11-09", 
    }

```

**❌ Response Error: `GET /directors/:directorName`**
```
    message: "Error: no data in the database for this Director: Muhammad Ali."
```

