var express = require('express');
var app = express();

var Crawler = require("crawler");
var url = require('url');
var _ = require('underscore');

// Prettify JSON.
app.set('json spaces', 1);

app.set('port', (process.env.PORT || 5000));

app.get('/', function(request, response) {
  response.send('Hello!');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/username/:username', function(request, response) {

	var responseToClient = response;

	var c = new Crawler({
	    maxConnections : 10,
	    // This will be called for each crawled page
	    callback : function (error, res, done) {
	        if(error){
	            console.log(error);
	        }
					else {
	            var $ = res.$;
							var scripts = $('script');

							// Get the content of the script tag.
							var scriptContent = $('body > script').map((i, x) => x.children[0]).get(0);

							if ( scriptContent ) {

								// Some cleanup.
								var scraped = scriptContent.data;
								scraped = scraped.replace('window._sharedData = ', '');
								scraped = scraped.replace(/;/g,'');

								var json = JSON.parse(scraped);

								// Get the user specific data that we want to return.
								var jsonToReturn = json.entry_data.ProfilePage[0].user;
								// Images
								// json.entry_data.ProfilePage[0].user.media.nodes

								// Return JSON to client.
								responseToClient.json(jsonToReturn);
							}

	        }
	        done();
	    }
	});

	var url = 'https://www.instagram.com/'+request.params.username;
	c.queue(url);
})
