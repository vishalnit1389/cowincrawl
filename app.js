const https = require('https')
let today = new Date();
let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
let yyyy = today.getFullYear();

today = dd+'-'+mm+'-'+yyyy;
function findAllDistrictsInState(stateId) {
    const districtOptions = {
        hostname: 'cdn-api.co-vin.in',
        path: `/api/v2/admin/location/districts/${stateId}`,
        method: 'GET'
    }
    const req = https.request(districtOptions, res => {
        var data;
        res.on("data", function(chunk) {
            if (!data) {
                data = chunk;
            } else {
                data += chunk;
            }
        });

        res.on("end", () => {
            const json =  JSON.parse(data);
            json.districts.forEach(district => {
                findSlotState(district);
            })
        })
    });

    req.on('error', error => {
        console.error(error)
    })

    req.end()
}

function findSlotState(district) {

    const options = {
        hostname: 'cdn-api.co-vin.in',
        path: `/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${district.district_id}&date=${today}`,
        method: 'GET'
    }

    const req = https.request(options, res => {
        var data;
        res.on("data", function(chunk) {
            if (!data) {
                data = chunk;
            } else {
                data += chunk;
            }
        });

        res.on("end", function() {
            const json =  JSON.parse(data);
            json.centers.forEach(center => {

                center.sessions.forEach(session => {
                    const sessionString = JSON.stringify(session);
                    const detail = JSON.parse(sessionString);
                    if (detail.min_age_limit < 45 && detail.available_capacity > 0 && center.fee_type !== 'Free') {
                        console.log('CENTER NAME '+center.name+' District '+district.district_name+' fee :'+center.fee_type+' slots '+center.sessions.length);
                        //console.log(JSON.stringify(center.sessions));
                        console.log('AVAILABLE');
                    }
                });
            });
        });
    });

    req.on('error', error => {
        console.error(error)
    })

    req.end()
}


function findSlotInNoida() {
    const noida = {
        district_id: 650,
        district_name: 'Noida'
    };
    findSlotState(noida);
}

// Uncomment for noida
//findSlotInNoida()

//Uncomment for Delhi

//findAllDistrictsInState(9);

function findInIndia() {
    for (let i = 1; i <= 36; i++) {
        findAllDistrictsInState(i);
    }
}

findInIndia();