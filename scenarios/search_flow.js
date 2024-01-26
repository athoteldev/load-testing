import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
    stages: [
        { duration: '30s', target: 50 },
        { duration: '1m30s', target: 50 },
        { duration: '30s', target: 20 },
        { duration: '1m30s', target: 50 },
        { duration: '20s', target: 10 },
    ],
}

export default function () {
    const channelId = 'ts-live-public-channel'
    const accountId = 'ts-srcttiopu'

    const session = http.get(
        `https://api.ath-staging.com/api/context?channelId=${channelId}&accountId=${accountId}`
    )

    const sessionKey = JSON.parse(session.body).sessionKey

    const res = http.post(
        'https://api.ath-staging.com/api/hotels/search/init',
        JSON.stringify({
            culture: 'en-us',
            currency: 'EUR',
            checkIn: '10/19/2022',
            checkOut: '10/21/2022',
            rooms: [{ adults: 2, children: 0, childAges: [] }],
            countryOfResidence: 'PT',
            nationality: 'PT',
            locationId: null,
            fullName: 'New York',
            channelId: null,
            GeoCode: { lat: 40.75668, long: -73.98647 },
        }),
        {
            headers: {
                'user-session-key': sessionKey,
                'Content-Type': 'application/json',
            },
        }
    )

    check(res, { 'status was 200': (r) => r.status == 200 })
    sleep(1)
}
