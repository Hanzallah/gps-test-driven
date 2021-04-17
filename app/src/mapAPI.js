
const request = (options, headers) => {
    const defaults = { headers: headers };
    options = Object.assign({}, defaults, options);

    return fetch(options.url, options)
        .then(response =>
            response.json().then(json => {
                if (!response.ok) {
                    return Promise.reject(json);
                }
                return json;
            })
        );
};

export function getNearestCity(latitude, longitude) {

    const headers = new Headers({
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
        "X-RapidAPI-Key": "42354ecc0bmsha4ac95ac88742f2p151cf3jsn6ca37e578c8b"
    });

    return request({
        url: "https://wft-geo-db.p.rapidapi.com/v1/geo/locations/" + latitude + "%2B" + longitude + "/nearbyCities?limit=10&types=CITY&radius=100000",
        method: 'GET'
    }, headers);
}

export function reverseGeocode(latitude, longitude) {
    return request({
        url: "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" + latitude + "&longitude=" + longitude + "&localityLanguage=en",
        method: 'GET'
    });
}

export function getAltitude(latitude, longitude) {
    return request({
        url: "https://elevation-api.io/api/elevation?points=(" + latitude + "," + longitude + "&key=foieI5u43929GMrj-33K-35docCav2",
        method: 'GET'
    });
}



