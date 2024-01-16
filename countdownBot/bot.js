const {TwitterApi} = require("twitter-api-v2");
const client = require("./config/client");
const cron = require("node-cron");
const path = require("path");
const fs = require('fs');
const { Configuration, OpenAIApi } = require("openai");
const { parse } = require("csv-parse");
const { join } = require("path");
const { debug } = require("console");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const tweet = async (text, imgUrl) => {
    try{
        
        const mediaId = await client.v1.uploadMedia(path.join(__dirname, imgUrl));
        
        const tweet = await client.v2.tweet({
            text,
            media: {media_ids: [mediaId]}
        });
        console.log("success!");

    }catch (error){
        console.log(error);
    }
};

// const replyTweet = async (text, imgUrl) => {
//   try{
//       const result = await client.v2.get('tweets/search/recent', { query: 'tarot deck', max_results: 40 }).then();
//       console.log(result.data);

//       const mediaId = await client.v1.uploadMedia(path.join(__dirname, imgUrl));
      
//       for (let i = 0; i < result.data.length; i++) {
//         try {
//           await client.v2.reply(text, result.data[i].id, {media: { media_ids: [mediaId] }});
//           console.log("success!");
//         }
//         catch(err) {
//           console.log(err);
//         }
//       }

//   }catch (error){
//       console.log(error);
//   }
// };

var Cards = [];
function LoadData (){
    fs.createReadStream("tables/Minor Arcana.csv")
      .pipe(parse({ delimiter: ",", from_line: 2 }))
      .on("data", function (row) {
        if(row[9] == 1 && row[10].length > 10){
            Cards.push({
                Suite:row[0],
                Number:row[1],
                Card:row[2],
                Sign:row[3],
                Sign_ASCII:row[4],
                Planet:row[5],
                Degrees:row[6],
                Sephiroth:row[7],
                Word:row[8],
                Done:row[9],
                Text:row[10]
            });
            var n = Cards.length-1;
            console.log(Cards[n].Suite);
            console.log(Cards[n].Number);
            console.log(Cards[n].Word);
            console.log(Cards[n].Text);   
             }

      }).on('end',function() {
        //do something with csvData
        var card = Math.floor(Math.random() * Cards.length);
        console.log(Cards[card].Suite);
        console.log(Cards[card].Number);
        console.log(Cards[card].Word);
        console.log(Cards[card].Text);

        console.log("=============");
        GetGPTHaiku(Cards[card]);
        setInterval(() => {
          GetGPTHaiku(Cards[card]);
        }, 1000 * 60 * 60);

      });




}

async function GetGPTHaiku(card){
    const completion = await openai.createCompletion({
        model: "text-davinci-003",
        //prompt: "Instruction: Write a short tweet starting with a haiku poem of the following tarot card. Do not name card. Do not say hiku.  Card:"+ card.Text,
        prompt: "Given that the" + card.Number + " of " + card.Suite + "is described as: " + card.Text + " Write a short tweet starting with a haiku of the above card. Do not name the card. Do not use the word hiku.",
        temperature: 0.5, 
        max_tokens: 50
      });
      var text = completion.data.choices[0].text;
      console.log(text);
      var imgUrl = "../images/JPEG/"+card.Suite.toLowerCase() +"_"+ card.Number + ".png";
      if(text.length < 270) text += " #CypherMash";
      if(text.length < 270) text += " #Cypherscape";

      tweet(text,imgUrl);
      //replyTweet(text, imgUrl)
}


console.log("Started the servert!!!");
LoadData();




