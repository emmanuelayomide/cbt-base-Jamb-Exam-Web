import express from 'express';
const app = express();
const port = 3000;
import bodyParser from 'body-parser';
import pg from 'pg';
import env from 'dotenv';
import session from 'express-session';
import axios from 'axios';  
import bcrypt from "bcryptjs";


app.use(session({ 
    secret:"emmm",
    resave: false,
    saveUninitialized: true
}))
// using the pubic file styles and images
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
env.config();

const db = new pg.Client({
user:process.env.mYUser,
host:process.env.mYHost,  
database: process.env.mYDatabase,
password:process.env.mYPassword,
port:process.env.mYPort
})

db.connect();
app.get("/", (req, res)=>{
    res.render("index.ejs")
})


// access The exam page
app.get("/accessExam", (req, res)=>{
    res.render("login.ejs")
})


// Register Diffrent Candidates
app.get("/registerCandidate", (req, res)=>{
    res.render("registeruser1.ejs")
})

// getting the userDate Through the First Form 

app.post("/firstregistration1", async (req, res)=>{
 const firstname = req.body["profileName"];
 const lastname= req.body["surName"];
 const email = req.body["registerMail"];

 try{ 
 const checkMail = await db.query("SELECT * FROM info1 WHERE mail = $1",
     [email]);
     console.log(checkMail.rows) 
     if(checkMail.rows.length > 0){
         res.render("index.ejs", {
            infoMessage: "The email Provided is already registered With a Candidate, Use a Valid Email Address For Security Reasons"
         });

     } else{
        const approved = await db.query("INSERT INTO info1 (firstname, lastname, mail) VALUES ($1, $2, $3) RETURNING *",
        [firstname, lastname, email]);
console.log(approved.rows) // Rendering the users Data
const idNumber = approved.rows[0].id;
req.session.idNumber = idNumber;
        console.log("the id for this user is", idNumber)


res.render("registeruser2.ejs", {
    infoMessage :"Section 1 of (3) is Completed", 
})
     }
 } catch(err){
    console.log(err.message);
    res.render("index.ejs", {
        infoMessage: "An Error Occured While Registering The Candidate, Please Try Again Later"
    });

 }

})

// The second registration info Data collected 

app.post("/secondregistration2", async (req, res)=>{
    const dob  = req.body["date"]
    const gender  = req.body["gender"]
    const address = req.body["registerAddess"]
    const phoneNumber = req.body["phoneNUmber"]



   console.log(dob)
   console.log(gender)
   console.log(address)
    console.log(phoneNumber)

    try{
    const userId = parseInt ( req.session.idNumber);
        const addAnotherInfo = await db.query("INSERT INTO info2(studentId, dates, gender, phoneNumber, address) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [userId, dob, gender, address, phoneNumber]
        )
// ........................
 try{
    const getState = "https://nigerian-states-and-lga.vercel.app/";
    let GetInformation = await axios.get(getState);
    const stateDetails = GetInformation.data;
     const stateNames = stateDetails.map(state => state.name);
    console.log(stateNames)
    console.log(stateDetails.length)

        res.render("registeruser3.ejs", {
            infoMessage :"Section 2 of (3) is Completed",
            stateNames: stateNames
         
        })
        console.log(stateNames)

    }catch(err){
        console.log(err.message);
        res.render("index.ejs", {
            infoMessage:  "An Error Occured While Registering The Candidate, Please Try Again Later"
        });

    }



        // ............................
        console.log(addAnotherInfo.rows[0]) // Rendering the users Data
      
        } catch(err){
            console.log(err.message);
            res.render("index.ejs", {
                infoMessage:  "An Error Occured While Registering The Candidate, Please Try Again Later"
            });
        }

})
app.get('/texting', async (req, res) => {
   res.render("registeruser4.ejs")
  });

// The third registration info Data collected
app.post("/thirdregistration3", async (req, res)=>{
const username = req.body["username"];
const password = req.body["password"];
const state = req.body["state"]
const stateName = req.session.state;
console.log(stateName);
// 
console.log(typeof password)
console.log(username)
console.log(password)
console.log(state)
let backExamCode =[
  "IC","BC","DA","MG","BB","LO","ZA","KT","PN","UJ","XR","YQ","HV","WL","EF","TD"
]
let selectRandomCode = Math.floor( Math.random()*backExamCode.length)
console.log(selectRandomCode)
let genrateRandomNumber = Math.floor(Math.random()*987654321) + 4873425;
console.log("the generated random Number is" + genrateRandomNumber )
let registerUserExamNumber = (genrateRandomNumber +backExamCode[selectRandomCode])
console.log(registerUserExamNumber)
const saltRound=10;
// res.render("registeruser4.ejs");
try{
 bcrypt.hash(password, saltRound, async (err, hash)=>{
    if(err){
console.log(err.message, "error in hashing the password")
    } else{
const hashedPassword = hash;
 const userId = parseInt ( req.session.idNumber);
 console.log("the id for this user is in the last form is", userId)
console.log("the hashed password is", hashedPassword)
 await db.query("INSERT INTO info3 (studentId, username, passwords, stateorigin) VALUES ($1, $2, $3, $4) RETURNING *",
        [userId, username, hashedPassword, state]
    ) 

    // get the state Of Origin for the Selected State
    try{
const getSateOfOrigin = await axios.get(`https://nigerian-states-and-lga.vercel.app/state/?name=${state}`)  ;
console.log(getSateOfOrigin.data)
const lga = getSateOfOrigin.data.lgas;
console.log('the lga is', lga)
res.render("registeruser4.ejs", {
    infoMessage :"Section 3 of (3)About to be Completed",
    stateOfOrigin: getSateOfOrigin.data,
    registerUserExamNumber: registerUserExamNumber,
    localGvt: lga,
})
    } catch(err){
        console.log(err.message);
        res.render("index.ejs", {
            infoMessage:  "An Error Occured While Registering The Candidate, Please Try Again Later"
        });
    }
    }
    
})
  
}catch(err){
    console.log(err.message);
    res.render("index.ejs", {
        infoMessage:  "An Error Occured While Registering The Candidate, Please Try Again Later"
    });
}
 

})


app.listen(port, (req, res)=>{
    console.log(`Server is running on port ${port}`);
})