let cheerio = require('cheerio'),
    https = require('./request'),
    url = 'http://www.wblivesurf.com/',
    Request = new https.request({ url: url, contentType: 'text/html' }),
    logoCount = 0,
    body = {};

exports.handler = (event, context, callback) => {

    Request.promise()
        .then(response => {
            let $ = cheerio.load(response);

            //Get the date of the report
            $('.date').filter(function () {
                let date = $(this).text().split('/');
                body.date = date[1].trim();
            });

            //Get the time of the report
            $('.time').filter(function () {
                let time = $(this).text().split('/');
                body.time = time[0].trim();
            });

            //Get the report description
            $('#wbMainReport .item').each(function (i, elem) {
                $('.date', $(this)).remove();
                $('h3', $(this)).remove();
                $('.time', $(this)).remove();
                body.desc = $(this).text().split(":").pop().trim();
            });

            //Get the logos
            $('.current div').each(function (i, elem) {

                if (this.attribs.class == 'ratingCell half') {
                    logoCount += 0.5;
                }
                else if (this.attribs.class == 'ratingCell') {
                    logoCount += 1;
                }

                body.logoCount = logoCount;

            }).attr('class');

            //Get other information
            $('p', '#wbMainRating').each(function (i, elem) {

                let info = $(this).text().split(':');

                switch (info[0]) {
                    case 'Swell Size':
                        body.size = info[1].trim();
                        break;
                    case 'Water Surface':
                        body.surface = info[1].trim();
                        break;
                    case 'Water Temp':
                        body.waterTemp = info[1].trim();
                        break;
                    case 'Wind':
                        body.wind = info[1].trim();
                        break;
                    case 'High Tide':
                        body.highTide = `${info[1]}:${info[2]}:${info[3]}`.trim();
                        break;
                    case 'Low Tide':
                        body.lowTide = `${info[1]}:${info[2]}:${info[3]}`.trim();
                        break;
                    case 'Sunrise':
                        body.sunrise = `${info[1]}:${info[2]}:${info[3]}`.trim();
                        break;
                    case 'Sunset':
                        body.sunset = `${info[1]}:${info[2]}:${info[3]}`.trim();
                        break;
                }

            });

            callback(null, body);

        })
        .catch(err => {
            callback(null, err);
        });

}