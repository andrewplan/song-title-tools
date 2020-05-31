require( 'dotenv' ).config();
const axios = require( 'axios' );
const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const app = express();
const port = 4000;

const get7DaysLaterUnix = () => {
    const weekMs = 604800000;
    const result = (new Date(Date.now()).getTime() + weekMs);
    return result;
}

const dueDate = get7DaysLaterUnix();

app.use( bodyParser.json() );
app.post('/', async (req, res) => {
    const {
        name, content
    } = req.body;
    const {
        CLICKUP_LIST_ID
        , CLICKUP_API_KEY
        , CLICKUP_ASSIGNEE
    } = process.env;

    const options = {
        method: 'post'
        , url: `https://api.clickup.com/api/v2/list/${CLICKUP_LIST_ID}/task`
        , headers: {
            "Authorization": CLICKUP_API_KEY
            , "Content-Type": "application/json"
        }
        , data: {
            name,
            content,
            "assignees": [
                CLICKUP_ASSIGNEE
            ],
            "status": "Splurge",
            "due_date": dueDate,
            "due_date_time": false,
            "notify_all": true
        }
    };

    let result;
    try {
        result = await axios(options)
        const { id, url } = result.data
        console.log(`Script succeeded! ClickUp ID ${id} ${url}`);
        return res.status( 201 ).json( result.data );
    }
    catch ( err ) {
        console.error(err);
        console.error(`Script failed, see above error. ${err.message}`);
        return res.status( 400 ).json( {
            message: err.message
        } )
    }
})

app.listen( port, () => console.log( `Listening on ${ port }` ) );