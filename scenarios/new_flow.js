import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
    stages: [
        { duration: '30s', target: 10 },
        { duration: '30s', target: 10 },
        { duration: '30s', target: 50 },
        { duration: '30s', target: 10 },
        { duration: '20s', target: 10 },
    ],
}

let errorFile = open('errors.csv', 'rw');

let statusFile = open('status.csv', 'rw');


export default function () {

    const locations = {
        'New York': 472764,
        'Rome': 118347
    }

    const location = 'Rome';

    let headers = {
        'content-type': 'application/json'
    }

    let res = http.get('https://athotel.com/api/channel/encrypt?channel=rf1', { headers: headers })
    check(res, {
        'status was 200': (r) => {
            
            if(r.status == 200) {
                // statusFile.write(`${new Date().toISOString()},${r.error}\n`);
                return 1
            } else {
                // console.log('error', r)
                // errorFile.write(`${new Date().toISOString()},${r.error}\n`);
                return 0
            }
        }
    })
    
    let channelId = encodeURIComponent('oifc2q1AguR7E4XojBARuw==')

    

    res = http.get(`https://api.ath-prod.com/api/context?secureContext=${channelId}`, { headers: headers })
    check(res, {
        'status was 200': (r) => {
            if(r.status == 200) {
                // statusFile.write(`${new Date().toISOString()},${r.error}\n`);
                return 1
            } else {
                console.log('error context', r)
                // errorFile.write(`${new Date().toISOString()},${r.error}\n`);
                return 0
            }
        }
    })
    let sessionKey = JSON.parse(res.body).sessionKey
    headers['user-session-key'] = sessionKey

    let data = {
        currency: "EUR",
        checkIn: "02/22/2024",
        checkOut: "02/24/2024",
        rooms: [{ adults: 2, children: 0, childAges: [] }],
        countryOfResidence: "UA",
        nationality: "UA",
        culture: "en-us",
        fullName: location,
        channelId: channelId,//channelId,
        sortId: "SortINR"
    }

    res = http.post(`https://api.ath-prod.com/Hotels/searchInfo/${locations[location]}`, JSON.stringify(data), { headers: headers })
    check(res, {
        'status was 200': (r) => {
            
            if(r.status == 200) {
                // statusFile.write(`${new Date().toISOString()},${r.error}\n`);
                return 1
            } else {
                console.log('error', r)
                // errorFile.write(`${new Date().toISOString()},${r.error}\n`);
                return 0
            }
        }
    })

    // console.log(JSON.parse(res.body))

    let searchId = JSON.parse(res.body).searchId

    console.log('search', searchId)


    headers['searchId'] = searchId

    res = http.post(`https://api.ath-prod.com/Hotels/search/${searchId}?page=1`, '{}', { headers: headers })
    check(res, {
        'status was 200': (r) => {
            
            if(r.status == 200) {
                
                // statusFile.write(`${new Date().toISOString()},${r.error}\n`);
                return 1
            } else {
                console.log('error', r)
                // errorFile.write(`${new Date().toISOString()},${r.error}\n`);
                return 0
            }
        }
    })

    sleep(1)
}