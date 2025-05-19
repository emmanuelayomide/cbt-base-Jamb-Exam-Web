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
    const getState =  "https://nigerian-states-and-lga.vercel.app/";
    let getInformation = await axios.get(getState);
    
  
        const stateDetails = getInformation.data;
     const stateNames = stateDetails.map(state => state.name);
    console.log(stateNames)
    console.log(stateDetails.length)
             res.render("registeruser3.ejs", {
            infoMessage :"Section 2 of (3) is Completed",
            stateNames: stateNames
         
        })
  
      
    } catch(err){
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
// the list of the schools
const nigeriaSchoolsNamesUniversities ={
  "universities": [
    { "name": "Abubakar Tafawa Balewa University", "location": "Bauchi State", "ownership": "Federal" },
    { "name": "Alex Ekwueme Federal University Ndufu-Alike", "location": "Ebonyi State", "ownership": "Federal" },
    { "name": "Bayero University Kano", "location": "Kano State", "ownership": "Federal" },
    { "name": "Benue State University", "location": "Makurdi", "ownership": "State" },
    { "name": "Federal University, Birnin Kebbi", "location": "Kebbi State", "ownership": "Federal" },
    { "name": "Federal University, Dutse", "location": "Jigawa State", "ownership": "Federal" },
    { "name": "Federal University, Dutsin-Ma", "location": "Katsina State", "ownership": "Federal" },
    { "name": "Federal University, Gashua", "location": "Yobe State", "ownership": "Federal" },
    { "name": "Federal University, Gusau", "location": "Zamfara State", "ownership": "Federal" },
    { "name": "Federal University, Kashere", "location": "Gombe State", "ownership": "Federal" },
    { "name": "Federal University, Lafia", "location": "Nasarawa State", "ownership": "Federal" },
    { "name": "Federal University, Lokoja", "location": "Kogi State", "ownership": "Federal" },
    { "name": "Federal University, Otuoke", "location": "Bayelsa State", "ownership": "Federal" },
    { "name": "Federal University, Oye-Ekiti", "location": "Ekiti State", "ownership": "Federal" },
    { "name": "Federal University, Wukari", "location": "Taraba State", "ownership": "Federal" },
    { "name": "Federal University of Agriculture, Abeokuta", "location": "Ogun State", "ownership": "Federal" },
    { "name": "Federal University of Agriculture, Makurdi", "location": "Benue State", "ownership": "Federal" },
    { "name": "Federal University of Petroleum Resources, Effurun", "location": "Delta State", "ownership": "Federal" },
    { "name": "Michael Okpara University of Agriculture, Umudike", "location": "Abia State", "ownership": "Federal" },
    { "name": "Modibbo Adama University of Technology, Yola", "location": "Adamawa State", "ownership": "Federal" },
    { "name": "National Open University of Nigeria", "location": "Lagos State (with centers nationwide)", "ownership": "Federal" },
    { "name": "Nnamdi Azikiwe University", "location": "Awka, Anambra State", "ownership": "Federal" },
    { "name": "Northwest University Kano", "location": "Kano State", "ownership": "State" },
    { "name": "Obafemi Awolowo University", "location": "Ile-Ife, Osun State", "ownership": "Federal" },
    { "name": "The University of Abuja", "location": "Federal Capital Territory, Abuja", "ownership": "Federal" },
    { "name": "The University of Calabar", "location": "Cross River State", "ownership": "Federal" },
    { "name": "The University of Ibadan", "location": "Oyo State", "ownership": "Federal" },
    { "name": "The University of Ilorin", "location": "Kwara State", "ownership": "Federal" },
    { "name": "The University of Jos", "location": "Plateau State", "ownership": "Federal" },
    { "name": "The University of Lagos", "location": "Lagos State", "ownership": "Federal" },
    { "name": "The University of Maiduguri", "location": "Borno State", "ownership": "Federal" },
    { "name": "The University of Nigeria, Nsukka", "location": "Enugu State", "ownership": "Federal" },
    { "name": "The University of Port Harcourt", "location": "Rivers State", "ownership": "Federal" },
    { "name": "Usumanu Danfodiyo University, Sokoto", "location": "Sokoto State", "ownership": "Federal" },
    { "name": "Abia State University", "location": "Uturu", "ownership": "State" },
    { "name": "Adamawa State University", "location": "Mubi", "ownership": "State" },
    { "name": "Adekunle Ajasin University", "location": "Akungba-Akoko, Ondo State", "ownership": "State" },
    { "name": "Akwa Ibom State University", "location": "Ikot Akpaden", "ownership": "State" },
    { "name": "Ambrose Alli University", "location": "Ekpoma, Edo State", "ownership": "State" },
    { "name": "Bauchi State University", "location": "Gadau", "ownership": "State" },
    { "name": "Cross River University of Technology", "location": "Calabar", "ownership": "State" },
    { "name": "Delta State University", "location": "Abraka", "ownership": "State" },
    { "name": "Ebonyi State University", "location": "Abakaliki", "ownership": "State" },
    { "name": "Edo State University", "location": "Uzairue", "ownership": "State" },
    { "name": "Enugu State University of Science and Technology", "location": "Enugu", "ownership": "State" },
    { "name": "Gombe State University", "location": "Gombe State", "ownership": "State" },
    { "name": "Ibrahim Badamasi Babangida University", "location": "Lapai, Niger State", "ownership": "State" },
    { "name": "Ignatius Ajuru University of Education", "location": "Port Harcourt, Rivers State", "ownership": "State" },
    { "name": "Imo State University", "location": "Owerri", "ownership": "State" },
    { "name": "Kaduna State University", "location": "Kaduna State", "ownership": "State" },
    { "name": "Kano University of Science and Technology, Wudil", "location": "Kano State", "ownership": "State" },
    { "name": "Kebbi State University of Science and Technology, Aliero", "location": "Kebbi State", "ownership": "State" },
    { "name": "Kogi State University", "location": "Anyigba, Kogi State", "ownership": "State" },
    { "name": "Kwara State University", "location": "Malete, Kwara State", "ownership": "State" },
    { "name": "Lagos State University", "location": "Ojo, Lagos State", "ownership": "State" },
    { "name": "Nasarawa State University", "location": "Keffi, Nasarawa State", "ownership": "State" },
    { "name": "Niger Delta University", "location": "Wilberforce Island, Bayelsa State", "ownership": "State" },
    { "name": "Ogun State University (Olabisi Onabanjo University)", "location": "Ago-Iwoye, Ogun State", "ownership": "State" },
    { "name": "Ondo State University of Science and Technology", "location": "Okitipupa, Ondo State", "ownership": "State" },
    { "name": "Osun State University", "location": "Osogbo, Osun State", "ownership": "State" },
    { "name": "Plateau State University", "location": "Bokkos, Plateau State", "ownership": "State" },
    { "name": "Rivers State University", "location": "Port Harcourt, Rivers State", "ownership": "State" },
    { "name": "Sokoto State University", "location": "Sokoto State", "ownership": "State" },
    { "name": "Taraba State University", "location": "Jalingo, Taraba State", "ownership": "State" },
    { "name": "Yobe State University", "location": "Damaturu, Yobe State", "ownership": "State" },
    { "name": "Achievers University", "location": "Owo, Ondo State", "ownership": "Private" },
    { "name": "Adeleke University", "location": "Ede, Osun State", "ownership": "Private" },
    { "name": "Afe Babalola University", "location": "Ado-Ekiti, Ekiti State", "ownership": "Private" },
    { "name": "Ajayi Crowther University", "location": "Oyo, Oyo State", "ownership": "Private" },
    { "name": "Al-Hikmah University", "location": "Ilorin, Kwara State", "ownership": "Private" },
    { "name": "American University of Nigeria", "location": "Yola, Adamawa State", "ownership": "Private" },
    { "name": "Augustine University", "location": "Ilara-Epe, Lagos State", "ownership": "Private" },
    { "name": "Babcock University", "location": "Ilishan-Remo, Ogun State", "ownership": "Private" },
    { "name": "Baze University", "location": "Abuja, Federal Capital Territory", "ownership": "Private" },
    { "name": "Bells University of Technology", "location": "Ota, Ogun State", "ownership": "Private" },
    { "name": "Benson Idahosa University", "location": "Benin City, Edo State", "ownership": "Private" },
    { "name": "Bingham University", "location": "Karu, Nasarawa State", "ownership": "Private" },
    { "name": "Bowen University", "location": "Iwo, Osun State", "ownership": "Private" },
    { "name": "Caleb University", "location": "Imota-Lagos, Lagos State", "ownership": "Private" },
    { "name": "Caritas University", "location": "Amorji-Nike, Enugu State", "ownership": "Private" },
    { "name": "Chrisland University", "location": "Abeokuta, Ogun State", "ownership": "Private" },
    { "name": "Crawford University", "location": "Igbesa, Ogun State", "ownership": "Private" },
    { "name": "Crescent University", "location": "Abeokuta, Ogun State", "ownership": "Private" },
    { "name": "Covenant University", "location": "Ota, Ogun State", "ownership": "Private" },
    { "name": "Elizade University", "location": "Ilara-Mokin, Ondo State", "ownership": "Private" },
    { "name": "Evangel University", "location": "Akaeze, Ebonyi State", "ownership": "Private" },
    { "name": "Fountain University", "location": "Osogbo, Osun State", "ownership": "Private" },
    { "name": "Godfrey Okoye University", "location": "Enugu, Enugu State", "ownership": "Private" },
    { "name": "Gregory University", "location": "Uturu, Abia State", "ownership": "Private" },
    { "name": "Hallmark University", "location": "Ijebu-Itele, Ogun State", "ownership": "Private" },
    { "name": "Hezekiah University", "location": "Umudi, Imo State", "ownership": "Private" },
    { "name": "Igbinedion University", "location": "Okada, Edo State", "ownership": "Private" },
    { "name": "Joseph Ayo Babalola University", "location": "Ikeji-Arakeji, Osun State", "ownership": "Private" },
    { "name": "Landmark University", "location": "Omu-Aran, Kwara State", "ownership": "Private" },
    { "name": "Lead City University", "location": "Ibadan, Oyo State", "ownership": "Private" },
    { "name": "Madonna University", "location": "Okija, Anambra State", "ownership": "Private" },
    { "name": "McPherson University", "location": "Seriki Sotayo, Ogun State", "ownership": "Private" },
    { "name": "Mountain Top University", "location": "Makogi/Oba Ofada Road, Ogun State", "ownership": "Private" },
    { "name": "Nigerian Turkish Nile University", "location": "Abuja, Federal Capital Territory", "ownership": "Private" },
    { "name": "Novena University", "location": "Ogume, Delta State", "ownership": "Private" },
    { "name": "Obong University", "location": "Obong Ntak, Akwa Ibom State", "ownership": "Private" },
    { "name": "Oduduwa University", "location": "Ile-Ife, Osun State", "ownership": "Private" },
    { "name": "Pan-Atlantic University", "location": "Lagos State", "ownership": "Private" },
    { "name": "Paul University", "location": "Awka, Anambra State", "ownership": "Private" },
    { "name": "Redeemer's University", "location": "Ede, Osun State", "ownership": "Private" },
    { "name": "Renaissance University", "location": "Enugu, Enugu State", "ownership": "Private" },
    { "name": "Rhema University", "location": "Obeama/Asa, Rivers State", "ownership": "Private" },
    { "name": "Salem University", "location": "Lokoja, Kogi State", "ownership": "Private" },
    { "name": "Samuel Adegboyega University", "location": "Ogwa, Edo State", "ownership": "Private" },
    { "name": "Southwestern University", "location": "Okun Owa, Ogun State", "ownership": "Private" },
    { "name": "Spiritan University", "location": "Nneochi, Abia State", "ownership": "Private" },
    { "name": "Tansian University", "location": "Umunya, Anambra State", "ownership": "Private" },
    { "name": "The American University of Nigeria", "location": "Yola, Adamawa State", "ownership": "Private" },
    { "name": "The University of Mkar", "location": "Gboko, Benue State", "ownership": "Private" },
    { "name": "Thomas Adewumi University", "location": "Oko-Irese, Kwara State", "ownership": "Private" },
    { "name": "Trinity University", "location": "Yaba, Lagos State", "ownership": "Private" },
    { "name": "University of Africa", "location": "Toru-Orua, Bayelsa State", "ownership": "Private" },
    { "name": "Veritas University", "location": "Abuja, Federal Capital Territory", "ownership": "Private" },
    { "name": "Wellspring University", "location": "Irhirhi-Ogbanu, Edo State", "ownership": "Private" }
  ]
}


const nigeriaSchoolsNamespolytechnics = { "polytechnics": [
    { "name": "Auchi Polytechnic", "location": "Auchi, Edo State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Ado-Ekiti", "location": "Ado-Ekiti, Ekiti State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Bauchi", "location": "Bauchi, Bauchi State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Bida", "location": "Bida, Niger State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Birnin Kebbi", "location": "Birnin Kebbi, Kebbi State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Damaturu", "location": "Damaturu, Yobe State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Daura", "location": "Daura, Katsina State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Ede", "location": "Ede, Osun State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Ekowe", "location": "Ekowe, Bayelsa State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Gasau", "location": "Gasau, Zamfara State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Hedejia", "location": "Hedejia, Jigawa State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Idah", "location": "Idah, Kogi State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Ilaro", "location": "Ilaro, Ogun State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Ile-Oluji", "location": "Ile-Oluji, Ondo State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Kaura Namoda", "location": "Kaura Namoda, Zamfara State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Kazaure", "location": "Kazaure, Jigawa State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Kebbi", "location": "Kebbi, Kebbi State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Kogi", "location": "Kogi, Kogi State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Konduga", "location": "Konduga, Borno State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Mubi", "location": "Mubi, Adamawa State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Nasarawa", "location": "Nasarawa, Nasarawa State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Nekede, Owerri", "location": "Owerri, Imo State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Offa", "location": "Offa, Kwara State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Oko", "location": "Oko, Anambra State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Orogun", "location": "Orogun, Delta State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Ukana", "location": "Ukana, Akwa Ibom State", "ownership": "Federal" },
    { "name": "Federal Polytechnic, Ugep, Cross River State", "location": "Ugep, Cross River State", "ownership": "Federal" },
    { "name": "Hussaini Adamu Federal Polytechnic, Kazaure", "location": "Kazaure, Jigawa State", "ownership": "Federal" },
    { "name": "Kaduna Polytechnic", "location": "Kaduna, Kaduna State", "ownership": "Federal" },
    { "name": "National Institute for Construction Technology and Management, Uromi", "location": "Uromi, Edo State", "ownership": "Federal" },
    { "name": "Yaba College of Technology", "location": "Yaba, Lagos State", "ownership": "Federal" },
    { "name": "Abia State Polytechnic", "location": "Aba, Abia State", "ownership": "State" },
    { "name": "Abraham Adesanya Polytechnic", "location": "Ijebu-Igbo, Ogun State", "ownership": "State" },
    { "name": "Adamawa State Polytechnic", "location": "Yola, Adamawa State", "ownership": "State" },
    { "name": "Akwa Ibom State Polytechnic", "location": "Ikot Osurua, Akwa Ibom State", "ownership": "State" },
    { "name": "Anambra State Polytechnic, Mgbakwu", "location": "Mgbakwu, Anambra State", "ownership": "State" },
    { "name": "Bayelsa State Polytechnic, Aleibiri", "location": "Aleibiri, Bayelsa State", "ownership": "State" },
    { "name": "Benue State Polytechnic, Ugbokolo", "location": "Ugbokolo, Benue State", "ownership": "State" },
    { "name": "Borno State Polytechnic, Maiduguri", "location": "Maiduguri, Borno State", "ownership": "State" },
    { "name": "College of Agriculture and Animal Science, Bakura", "location": "Bakura, Zamfara State", "ownership": "State" },
    { "name": "Delta State Polytechnic, Ogwashi-Uku", "location": "Ogwashi-Uku, Delta State", "ownership": "State" },
    { "name": "Delta State Polytechnic, Otefe-Oghara", "location": "Otefe-Oghara, Delta State", "ownership": "State" },
    { "name": "Ebonyi State Polytechnic, Ohodo", "location": "Ohodo, Ebonyi State", "ownership": "State" },
    { "name": "Edo State Polytechnic, Usen", "location": "Usen, Edo State", "ownership": "State" },
    { "name": "Enugu State Polytechnic, Iwollo", "location": "Iwollo, Enugu State", "ownership": "State" },
    { "name": "Gateway ICT Polytechnic, Saapade", "location": "Saapade, Ogun State", "ownership": "State" },
    { "name": "Gateway Polytechnic, Igbesa", "location": "Igbesa, Ogun State", "ownership": "State" },
    { "name": "Gombe State Polytechnic, Bajoga", "location": "Bajoga, Gombe State", "ownership": "State" },
    { "name": "Imo State Polytechnic, Umuagwo, Ohaji", "location": "Umuagwo, Ohaji, Imo State", "ownership": "State" },
    { "name": "Jigawa State Polytechnic, Dutse", "location": "Dutse, Jigawa State", "ownership": "State" },
    { "name": "Kano State Polytechnic", "location": "Kano, Kano State", "ownership": "State" },
    { "name": "Katsina State Polytechnic", "location": "Katsina, Katsina State", "ownership": "State" },
    { "name": "Kogi State Polytechnic, Lokoja", "location": "Lokoja, Kogi State", "ownership": "State" },
    { "name": "Kwara State Polytechnic, Ilorin", "location": "Ilorin, Kwara State", "ownership": "State" },
    { "name": "Lagos State Polytechnic, Ikorodu", "location": "Ikorodu, Lagos State", "ownership": "State" },
    { "name": "Nasarawa State Polytechnic, Lafia", "location": "Lafia, Nasarawa State", "ownership": "State" },
    { "name": "Niger State Polytechnic, Zungeru", "location": "Zungeru, Niger State", "ownership": "State" },
    { "name": "Ogun State Institute of Technology, Igbesa", "location": "Igbesa, Ogun State", "ownership": "State" },
    { "name": "Ondo State Polytechnic, Owo", "location": "Owo, Ondo State", "ownership": "State" },
    { "name": "Osun State College of Technology, Esa-Oke", "location": "Esa-Oke, Osun State", "ownership": "State" },
    { "name": "Oyo State College of Agriculture and Technology, Igboora", "location": "Igboora, Oyo State", "ownership": "State" },
    { "name": "Plateau State Polytechnic, Barkin Ladi", "location": "Barkin Ladi, Plateau State", "ownership": "State" },
    { "name": "Rivers State Polytechnic, Bori", "location": "Bori, Rivers State", "ownership": "State" },
    { "name": "Rufus Giwa Polytechnic, Owo", "location": "Owo, Ondo State", "ownership": "State" },
    { "name": "Shehu Shagari College of Education, Sokoto", "location": "Sokoto, Sokoto State", "ownership": "State" },
    { "name": "Sokoto State Polytechnic", "location": "Sokoto, Sokoto State", "ownership": "State" },
    { "name": "Taraba State Polytechnic, Jalingo", "location": "Jalingo, Taraba State", "ownership": "State" },
    { "name": "The Polytechnic, Ibadan", "location": "Ibadan, Oyo State", "ownership": "State" },
    { "name": "Yobe State Polytechnic, Geidam", "location": "Geidam, Yobe State", "ownership": "State" },
    { "name": "Zamfara State College of Arts and Science, Gusau", "location": "Gusau, Zamfara State", "ownership": "State" },
    { "name": "Abia State College of Health Sciences and Management Technology", "location": "Aba, Abia State", "ownership": "Private" },
    { "name": "Best Legacy Polytechnic", "location": "Ota, Ogun State", "ownership": "Private" },
    { "name": "Calvary Polytechnic", "location": "Owa-Oyibu, Delta State", "ownership": "Private" },
    { "name": "Covenant Polytechnic", "location": "Ota, Ogun State", "ownership": "Private" },
    { "name": "Eastern Polytechnic", "location": "Port Harcourt, Rivers State", "ownership": "Private" },
    { "name": "Fidei Polytechnic", "location": "Gboko, Benue State", "ownership": "Private" },
    { "name": "Grace Polytechnic", "location": "Surulere, Lagos State", "ownership": "Private" },
    { "name": "I-TEK Polytechnic", "location": "Sango Ota, Ogun State", "ownership": "Private" },
    { "name": "Ibadan City Polytechnic", "location": "Ibadan, Oyo State", "ownership": "Private" },
    { "name": "IMT College of Technology", "location": "Enugu, Enugu State", "ownership": "Private" },
    { "name": "Institute of Management and Technology", "location": "Enugu, Enugu State", "ownership": "Private" },
    { "name": "Interlink Polytechnic", "location": "Ijebu-Jesa, Osun State", "ownership": "Private" },
    { "name": "Kings Polytechnic", "location": "Sango Ota, Ogun State", "ownership": "Private" },
    { "name": "Lighthouse Polytechnic", "location": "Evbuobanosa, Edo State", "ownership": "Private" },
    { "name": "Madonna Polytechnic", "location": "Okija, Anambra State", "ownership": "Private" },
    { "name": "Marist Polytechnic", "location": "Umuchigbo Iji-Nike, Enugu State", "ownership": "Private" },
    { "name": "Merit Polytechnic", "location": "Lagos State", "ownership": "Private" },
    { "name": "Michael Otedola College of Primary Education", "location": "Noforija, Epe, Lagos State", "ownership": "Private" },
    { "name": "Moshood Abiola Polytechnic", "location": "Abeokuta, Ogun State", "ownership": "Private" },
    { "name": "Nadama Advanced Polytechnic", "location": "Kaduna, Kaduna State", "ownership": "Private" },
    { "name": "Nigerian Army Institute of Technology and Environmental Studies (NAITES)", "location": "Biu, Borno State", "ownership": "Private" },
    { "name": "Nigerian College of Accountancy", "location": "Jos, Plateau State", "ownership": "Private" },
    { "name": "Ofada Polytechnic", "location": "Ofada, Ogun State", "ownership": "Private" },
    { "name": "Our Saviour Institute of Science, Agriculture & Technology (OSISATECH) Polytechnic", "location": "Enugu, Enugu State", "ownership": "Private" },
    { "name": "Prime Polytechnic", "location": "Jida-Bassa, Kogi State", "ownership": "Private" },
    { "name": "Ronik Polytechnic", "location": "Ejigbo, Lagos State", "ownership": "Private" },
    { "name": "Temple Gate Polytechnic", "location": "Aba, Abia State", "ownership": "Private" },
    { "name": "The Polytechnic, Imesi-Ile", "location": "Imesi-Ile, Osun State", "ownership": "Private" },
    { "name": "Tower Polytechnic", "location": "Ibadan, Oyo State", "ownership": "Private" },
    { "name": "Trinity Polytechnic", "location": "Uyo, Akwa Ibom State", "ownership": "Private" },
    { "name": "Universal College of Technology", "location": "Ile-Ife, Osun State", "ownership": "Private" },
    { "name": "Wolex Polytechnic", "location": "Iwo, Osun State", "ownership": "Private" }
  ]
}
    
const nigeriaSchoolsNamesCollge = {
  "colleges": [
    { "name": "Adeyemi College of Education", "location": "Ondo, Ondo State", "ownership": "Federal" },
    { "name": "Alvan Ikoku Federal College of Education", "location": "Owerri, Imo State", "ownership": "Federal" },
    { "name": "Federal College of Education, Abeokuta", "location": "Abeokuta, Ogun State", "ownership": "Federal" },
    { "name": "Federal College of Education, Bichi", "location": "Bichi, Kano State", "ownership": "Federal" },
    { "name": "Federal College of Education, Eha-Amufu", "location": "Eha-Amufu, Enugu State", "ownership": "Federal" },
    { "name": "Federal College of Education, Gombe", "location": "Gombe, Gombe State", "ownership": "Federal" },
    { "name": "Federal College of Education, Gusau", "location": "Gusau, Zamfara State", "ownership": "Federal" },
    { "name": "Federal College of Education, Jalingo", "location": "Jalingo, Taraba State", "ownership": "Federal" },
    { "name": "Federal College of Education, Katsina", "location": "Katsina, Katsina State", "ownership": "Federal" },
    { "name": "Federal College of Education, Kontagora", "location": "Kontagora, Niger State", "ownership": "Federal" },
    { "name": "Federal College of Education, Kwara", "location": "Ilorin, Kwara State", "ownership": "Federal" },
    { "name": "Federal College of Education, Lafia", "location": "Lafia, Nasarawa State", "ownership": "Federal" },
    { "name": "Federal College of Education, Lokoja", "location": "Lokoja, Kogi State", "ownership": "Federal" },
    { "name": "Federal College of Education, Okene", "location": "Okene, Kogi State", "ownership": "Federal" },
    { "name": "Federal College of Education (Special), Oyo", "location": "Oyo, Oyo State", "ownership": "Federal" },
    { "name": "Federal College of Education (Technical), Akoka", "location": "Akoka, Lagos State", "ownership": "Federal" },
    { "name": "Federal College of Education (Technical), Asaba", "location": "Asaba, Delta State", "ownership": "Federal" },
    { "name": "Federal College of Education (Technical), Bichi", "location": "Bichi, Kano State", "ownership": "Federal" },
    { "name": "Federal College of Education (Technical), Gombe", "location": "Gombe, Gombe State", "ownership": "Federal" },
    { "name": "Federal College of Education (Technical), Gusau", "location": "Gusau, Zamfara State", "ownership": "Federal" },
    { "name": "Federal College of Education (Technical), Kabuga", "location": "Kabuga, Kano State", "ownership": "Federal" },
    { "name": "Federal College of Education (Technical), Omoku", "location": "Omoku, Rivers State", "ownership": "Federal" },
    { "name": "Federal College of Education (Technical), Potiskum", "location": "Potiskum, Yobe State", "ownership": "Federal" },
    { "name": "Federal College of Education (Technical), Yaba", "location": "Yaba, Lagos State", "ownership": "Federal" },
    { "name": "College of Education, Agbor", "location": "Agbor, Delta State", "ownership": "State" },
    { "name": "College of Education, Akwanga", "location": "Akwanga, Nasarawa State", "ownership": "State" },
    { "name": "College of Education, Ankpa", "location": "Ankpa, Kogi State", "ownership": "State" },
    { "name": "College of Education, Azare", "location": "Azare, Bauchi State", "ownership": "State" },
    { "name": "College of Education, Bama", "location": "Bama, Borno State", "ownership": "State" },
    { "name": "College of Education, Ekiadolor-Benin", "location": "Ekiadolor-Benin, Edo State", "ownership": "State" },
    { "name": "College of Education, Erinle", "location": "Erinle, Osun State", "ownership": "State" },
    { "name": "College of Education, Gindiri", "location": "Gindiri, Plateau State", "ownership": "State" },
    { "name": "College of Education, Gboko", "location": "Gboko, Benue State", "ownership": "State" },
    { "name": "College of Education, Gumel", "location": "Gumel, Jigawa State", "ownership": "State" },
    { "name": "College of Education, Hama Ali Maigoro", "location": "Lafia, Nasarawa State", "ownership": "State" },
    { "name": "College of Education, Ikere-Ekiti", "location": "Ikere-Ekiti, Ekiti State", "ownership": "State" },
    { "name": "College of Education, Ila-Orangun", "location": "Ila-Orangun, Osun State", "ownership": "State" },
    { "name": "College of Education, Katsina-Ala", "location": "Katsina-Ala, Benue State", "ownership": "State" },
    { "name": "College of Education, Kano", "location": "Kano, Kano State", "ownership": "State" },
    { "name": "College of Education, Maiduguri", "location": "Maiduguri, Borno State", "ownership": "State" },
    { "name": "College of Education, Minna", "location": "Minna, Niger State", "ownership": "State" },
    { "name": "College of Education, Mubi", "location": "Mubi, Adamawa State", "ownership": "State" },
    { "name": "College of Education, Nsukka", "location": "Nsukka, Enugu State", "ownership": "State" },
    { "name": "College of Education, Obudu", "location": "Obudu, Cross River State", "ownership": "State" },
    { "name": "College of Education, Oju", "location": "Oju, Benue State", "ownership": "State" },
    { "name": "College of Education, Oro", "location": "Oro, Kwara State", "ownership": "State" },
    { "name": "College of Education, Potiskum", "location": "Potiskum, Yobe State", "ownership": "State" },
    { "name": "College of Education, Sokoto", "location": "Sokoto, Sokoto State", "ownership": "State" },
    { "name": "College of Education, Warri", "location": "Warri, Delta State", "ownership": "State" },
    { "name": "College of Education, Waka-Biu", "location": "Waka-Biu, Borno State", "ownership": "State" },
    { "name": "College of Education, Zing", "location": "Zing, Taraba State", "ownership": "State" },
    { "name": "Delta State College of Education, Mosogar", "location": "Mosogar, Delta State", "ownership": "State" },
    { "name": "Ebonyi State College of Education, Ikwo", "location": "Ikwo, Ebonyi State", "ownership": "State" },
    { "name": "Enugu State College of Education (Technical)", "location": "Enugu, Enugu State", "ownership": "State" },
    { "name": "Gombe State College of Education, Billiri", "location": "Billiri, Gombe State", "ownership": "State" },
    { "name": "Imo State College of Education, Ihitte Uboma", "location": "Ihitte Uboma, Imo State", "ownership": "State" },
    { "name": "Jigawa State College of Education, Dutse", "location": "Dutse, Jigawa State", "ownership": "State" },
    { "name": "Kano State College of Education, Kumbotso", "location": "Kumbotso, Kano State", "ownership": "State" },
    { "name": "Kogi State College of Education, Anyigba", "location": "Anyigba, Kogi State", "ownership": "State" },
    { "name": "Kwara State College of Education, Lafiagi", "location": "Lafiagi, Kwara State", "ownership": "State" },
    { "name": "Lagos State College of Education, Ijanikin", "location": "Ijanikin, Lagos State", "ownership": "State" },
    { "name": "Nasarawa State College of Education, Akwanga", "location": "Akwanga, Nasarawa State", "ownership": "State" },
    { "name": "Niger State College of Education, Minna", "location": "Minna, Niger State", "ownership": "State" },
    { "name": "Ogun State College of Education, Ijebu-Ode", "location": "Ijebu-Ode, Ogun State", "ownership": "State" },
    { "name": "Ondo State College of Education, Ikere", "location": "Ikere, Ondo State", "ownership": "State" },
    { "name": "Osun State College of Education, Ilesa", "location": "Ilesa, Osun State", "ownership": "State" },
    { "name": "Oyo State College of Education, Lanlate", "location": "Lanlate, Oyo State", "ownership": "State" },
    { "name": "Plateau State College of Education, Gindiri", "location": "Gindiri, Plateau State", "ownership": "State" },
    { "name": "Rivers State College of Education, Rumuolumeni", "location": "Rumuolumeni, Rivers State", "ownership": "State" },
    { "name": "Sokoto State College of Education, Sokoto", "location": "Sokoto, Sokoto State", "ownership": "State" },
    { "name": "Taraba State College of Education, Jalingo", "location": "Jalingo, Taraba State", "ownership": "State" },
    { "name": "Yobe State College of Education, Gashua", "location": "Gashua, Yobe State", "ownership": "State" },
    { "name": "Zamfara State College of Education, Maru", "location": "Maru, Zamfara State", "ownership": "State" },
    { "name": "Ansar-Ud-Deen College of Education, Isolo", "location": "Isolo, Lagos State", "ownership": "Private" },
    { "name": "Babcock University Teaching Practice Secondary School", "location": "Ilishan-Remo, Ogun State", "ownership": "Private" },
    { "name": "Calvary College of Education", "location": "Owa-Oyibu, Delta State", "ownership": "Private" },
    { "name": "ECWA College of Education, Jos", "location": "Jos, Plateau State", "ownership": "Private" },
    { "name": "FCE Katsina-Ala (Affiliated to University of Calabar)", "location": "Katsina-Ala, Benue State", "ownership": "Private" },
    { "name": "Ibadan City College of Education", "location": "Ibadan, Oyo State", "ownership": "Private" },
    { "name": "Immanuel College of Education", "location": "Ibadan, Oyo State", "ownership": "Private" },
    { "name": "Jigawa State College of Islamic and Legal Studies, Ringim", "location": "Ringim, Jigawa State", "ownership": "Private" },
    { "name": "Kaduna State College of Education, Kafanchan", "location": "Kafanchan, Kaduna State", "ownership": "Private" },
    { "name": "Kashim Ibrahim College of Education", "location": "Maiduguri, Borno State", "ownership": "Private" },
    { "name": "Lagos City College of Education", "location": "Yaba, Lagos State", "ownership": "Private" },
    { "name": "Michael Otedola College of Primary Education", "location": "Noforija, Epe, Lagos State", "ownership": "Private" },
    { "name": "Muslim College of Education", "location": "Kano, Kano State", "ownership": "Private" },
    { "name": "Nwafor Orizu College of Education, Nsugbe (Affiliated to University of Nigeria, Nsukka)", "location": "Nsugbe, Anambra State", "ownership": "Private" },
    { "name": "Peaceland College of Education", "location": "Enugu, Enugu State", "ownership": "Private" },
    { "name": "Riversdale College of Education", "location": "Ibadan, Oyo State", "ownership": "Private" },
    { "name": "St. Augustine's College of Education, Akoka", "location": "Akoka, Lagos State", "ownership": "Private" },
    { "name": "St. Peter's College of Education, Afaha Nsit", "location": "Afaha Nsit, Akwa Ibom State", "ownership": "Private" },
    { "name": "The College of Education, Epe", "location": "Epe, Lagos State", "ownership": "Private" },
    { "name": "The College of Education, Nsukka (Private)", "location": "Nsukka, Enugu State", "ownership": "Private" }
  ]
}
const uniList= nigeriaSchoolsNamesUniversities.universities;
const polyList = nigeriaSchoolsNamespolytechnics.polytechnics;
const collgeList = nigeriaSchoolsNamesCollge.colleges;

// the courses offered by the schools

const universitycourses = [
    "Accounting", "Agricultural Economics", "Agricultural Engineering", "Agricultural Extension",
    "Agronomy", "Anatomy", "Animal Science", "Architecture", "Biochemistry", "Biological Science",
    "Biology", "Biotechnology", "Biomedical Engineering", "Botany", "Business Administration",
    "Business Education", "Chemical Engineering", "Chemistry", "Christian Religious Studies",
    "Civil Engineering", "Computer Engineering", "Computer Science", "Criminology and Security Studies",
    "Crop Science", "Cybersecurity", "Data Science", "Dentistry", "Economics", "Education and Biology",
    "Education and Chemistry", "Education and Economics", "Education and English", "Education and Mathematics",
    "Education and Physics", "Education and Political Science", "Educational Management",
    "Educational Technology", "Electrical/Electronics Engineering", "English Language", "Entrepreneurship",
    "Environmental Engineering", "Environmental Management", "Estate Management", "Fine and Applied Arts",
    "Fisheries", "Food Science and Technology", "Forestry and Wildlife", "French", "Geography", "Geology",
    "Guidance and Counselling", "Hausa", "History and International Studies", "Human Anatomy",
    "Human Nutrition and Dietetics", "Human Physiology", "Industrial Chemistry",
    "Industrial Relations and Personnel Management", "Information Systems", "Information Technology",
    "Insurance", "International Relations", "Islamic Studies", "Journalism", "Law",
    "Library and Information Science", "Linguistics", "Marine Biology", "Marketing",
    "Mass Communication", "Mathematics", "Mechanical Engineering", "Mechatronics Engineering",
    "Medical Laboratory Science", "Medicine and Surgery", "Metallurgical and Materials Engineering",
    "Microbiology", "Music", "Nursing", "Nutrition and Dietetics", "Optometry",
    "Peace and Conflict Resolution", "Petroleum Engineering", "Pharmacy", "Philosophy",
    "Physical and Health Education", "Physics", "Physiology", "Political Science", "Psychology",
    "Public Administration", "Public Health", "Quantity Surveying", "Radiography", "Religious Studies",
    "Social Work", "Sociology", "Software Engineering", "Soil Science", "Special Education", "Statistics",
    "Surveying and Geoinformatics", "Taxation", "Theatre Arts", "Tourism and Hospitality Management",
    "Urban and Regional Planning", "Veterinary Medicine", "Yoruba", "Zoology"
]

const polytechniccourses = [
    "Accountancy", "Agricultural Engineering Technology", "Agricultural Technology",
    "Architectural Technology", "Art and Design", "Banking and Finance", "Building Technology",
    "Business Administration and Management", "Chemical Engineering Technology", "Computer Engineering",
    "Computer Science", "Electrical/Electronics Engineering", "Estate Management and Valuation",
    "Food Technology", "Foundry Engineering Technology", "Glass/Ceramics Technology", "Hospitality Management",
    "Insurance", "Leisure and Tourism Management", "Library and Information Science",
    "Local Government Studies", "Marketing", "Mass Communication", "Mechanical Engineering Technology",
    "Mechatronics Engineering", "Metallurgical Engineering Technology", "Mineral Resources Engineering",
    "Nutrition and Dietetics", "Office Technology and Management", "Petroleum Engineering Technology",
    "Public Administration", "Quantity Surveying", "Science Laboratory Technology",
    "Social Development", "Statistics", "Surveying and Geo-Informatics", "Textile Technology",
    "Urban and Regional Planning", "Welding and Fabrication Technology"
]

const collegecourses = [
    "Agricultural Science Education", "Biology Education", "Business Education",
    "Chemistry Education", "Christian Religious Studies Education", "Computer Education",
    "Early Childhood Care Education", "Economics Education", "English Education",
    "Fine and Applied Arts Education", "French Education", "Geography Education", "Guidance and Counselling",
    "Hausa Education", "Home Economics Education", "Igbo Education", "Integrated Science Education",
    "Islamic Studies Education", "Mathematics Education", "Music Education", "Physical and Health Education",
    "Physics Education", "Political Science Education", "Primary Education Studies", "Social Studies Education",
    "Technical Education", "Theatre Arts Education", "Yoruba Education"
]

console.log(universitycourses)
res.render("registeruser4.ejs", {
    infoMessage :"Section 3 of (3)About to be Completed",
    stateOfOrigin: getSateOfOrigin.data,
    localGvt: lga,
    uniNames: uniList,
    polyNames: polyList,
    collegeNames: collgeList,
    universitycourses: universitycourses,
    polytechniccourses: polytechniccourses,
    collegecourses: collegecourses
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

// last form data collected

app.post("/thirdregistration4", async (req, res)=>{



let backExamCode =[
  "IC","BC","DA","MG","BB","LO","ZA","KT","PN","UJ","XR","YQ","HV","WL","EF","TD"
]
let selectRandomCode = Math.floor( Math.random()*backExamCode.length)
console.log(selectRandomCode)
let genrateRandomNumber = Math.floor(Math.random()*987654321) + 4873425;
console.log("the generated random Number is" + genrateRandomNumber )
let registerUserExamNumber = (genrateRandomNumber +backExamCode[selectRandomCode])
console.log(registerUserExamNumber)

const firstChoice = req.body["firstChoice"]
const uniChoosen = req.body["firstChoiceSchool"]
const secondChoice = req.body["secondchoice"]
const polyChoosen = req.body["secondChoiceSchool"]
const thirdChoice = req.body["thirdchoice"]
const collegeChoosen = req.body["thirdChoiceSchool"]
const localGvt = req.body["localGvArea"]

//   inserting the data into the database
try{
//      TEXT,
//  TEXT,
//  TEXT,
//  TEXT,
//  TEXT,
//  TEXT,
 const userId = parseInt ( req.session.idNumber);

 const userlastInfo = await db.query("INSERT INTO info4 (studentId, firstChoice, firstSchool, secondChoice, secondSchool, thirdChoice, thirdSchool, localGvArea) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *",
    [userId, firstChoice, uniChoosen, secondChoice, polyChoosen, thirdChoice, collegeChoosen, localGvt]
 )
console.log(userlastInfo.rows[0])

res.render("usersSlip.ejs")
} catch(err){
    console.log(err.message);
    res.render("index.ejs", {
        infoMessage:  "An Error Occured While Registering The Candidate, Please Try Again Later"
    });
}



console.log("the first choice is " + firstChoice)
console.log("the second choice is " + secondChoice)
console.log("the third choice is " + thirdChoice)       
console.log("the first choice school is " + uniChoosen)
console.log("the second choice school is " + polyChoosen)
console.log("the third choice school is " + collegeChoosen)
console.log("the local government area is " + localGvt)




})

app.listen(port, (req, res)=>{
    console.log(`Server is running on port ${port}`);
})

