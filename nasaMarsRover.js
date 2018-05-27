var express = require('express');

var credentials = require('./credentials.js');
var bodyParser = require('body-parser');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var request = require('request');

app.engine('handlebars', handlebars.engine);
app.use(express.static('public'));
app.set('view engine', 'handlebars');
// app.set('port', 1244);
var http = require('http');
var port = process.env.port || 1337;
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended: true})); 

app.get('/', function(req,res){
	var context = {};
	context.manifests = [];
	request('https://api.nasa.gov/mars-photos/api/v1/manifests/curiosity?api_key=' + credentials.nasaKey, curiosityManifest);
	
	function curiosityManifest(err, response, body){
		if(!err && response.statusCode < 400){
		  var newManifest = (JSON.parse(body)).photo_manifest;
		  context.manifests.push(newManifest);
		  request('https://api.nasa.gov/mars-photos/api/v1/manifests/opportunity?api_key=' + credentials.nasaKey, opportunityManifest);
		  
		  function opportunityManifest(err, response, body){
			if(!err && response.statusCode < 400){
			  var newManifest = (JSON.parse(body)).photo_manifest;
			  context.manifests.push(newManifest);
			  request('https://api.nasa.gov/mars-photos/api/v1/manifests/spirit?api_key=' + credentials.nasaKey, spiritManifest);
			  
			  	function spiritManifest(err, response, body){
					if(!err && response.statusCode < 400){
					  var newManifest = (JSON.parse(body)).photo_manifest;
					  context.manifests.push(newManifest);
					  res.render('home',context);
					} 
					  else {
					  console.log(err);
					  console.log(response.statusCode);
					}
				}
			} 
			  else {
			  console.log(err);
			  console.log(response.statusCode);
			}
	}
		} 
		  else {
		  console.log(err);
		  console.log(response.statusCode);
		}
	}
	

});

app.get('/curiosity',function(req,res){
  var context = {};
  request('https://api.nasa.gov/mars-photos/api/v1/manifests/curiosity?api_key=' + credentials.nasaKey, getManifest);

  function getManifest(err, response, body){
    if(!err && response.statusCode < 400){
      context.manifest = JSON.parse(body);
	  context.sol = context.manifest.photo_manifest.max_sol;
	  context.date = context.manifest.photo_manifest.max_date;
	  context.name = context.manifest.photo_manifest.name;
      request('https://api.nasa.gov/mars-photos/api/v1/rovers/' + context.name + '/photos?sol=' + context.sol + '&api_key=' + credentials.nasaKey, getPhotos);
	} 
      else {
      console.log(err);
      console.log(response.statusCode);
    }
  }

  function getPhotos(err, response, body){
    if(!err && response.statusCode < 400){
	  context.photoResponse = JSON.parse(body);
	  context.photos = [];
	  context.photoResponse.photos.forEach(function(element) {
	  context.photos.push(element);
	});
      res.render('curiosity',context);
    }else{
      console.log(err);
      console.log(response.statusCode);
    }
  }
});

app.post('/curiosity', function(req,res){
	var context = {};
	context.name = 'curiosity';
	context.camera = req.body.camera;
	context.date = req.body.date;
	context.sol = req.body.martian_sol;
	
	if (context.camera == ""){
		if (context.sol != ""){
			request('https://api.nasa.gov/mars-photos/api/v1/rovers/' + context.name + '/photos?sol=' 
			+ context.sol + '&api_key=' + credentials.nasaKey, getPhotos);
		}
		else{
			request('https://api.nasa.gov/mars-photos/api/v1/rovers/' + context.name + '/photos?earth_date=' 
			+ context.date + '&api_key=' + credentials.nasaKey, getPhotos);
		}
	}
	else{
		if (context.sol != ""){
			request('https://api.nasa.gov/mars-photos/api/v1/rovers/' + context.name + '/photos?sol=' 
			+ context.sol + '&camera=' + context.camera + '&api_key=' + credentials.nasaKey, getPhotos);
		}
		else{
			request('https://api.nasa.gov/mars-photos/api/v1/rovers/' + context.name + '/photos?earth_date=' 
			+ context.date + '&camera=' + context.camera + '&api_key=' + credentials.nasaKey, getPhotos);
		}
	}

	function getPhotos(err, response, body){
		if(!err && response.statusCode < 400){
		  context.photoResponse = JSON.parse(body);
		  context.photos = [];
		  context.photoResponse.photos.forEach(function(element) {
		  context.photos.push(element);
		  context.date = element.earth_date;
		  context.sol = element.sol;
			});
		  if (context.photos.length == 0){
			  context.no_image = "No image avaliable for " + context.camera.toUpperCase() + " on " + context.date + ".";
		  }
		  else{
			  context.no_image = "";
		  }
		  console.log(context.camera);
		  console.log(context.date);
		  res.render(context.name,context);
		}else{
		  console.log(err);
		  console.log(response.statusCode);
		}
	}
});

app.get('/opportunity',function(req,res){
  var context = {};
  request('https://api.nasa.gov/mars-photos/api/v1/manifests/opportunity?api_key=' + credentials.nasaKey, getManifest);

  function getManifest(err, response, body){
    if(!err && response.statusCode < 400){
      context.manifest = JSON.parse(body);
	  context.sol = context.manifest.photo_manifest.max_sol;
	  context.date = context.manifest.photo_manifest.max_date;
	  context.name = context.manifest.photo_manifest.name;
      request('https://api.nasa.gov/mars-photos/api/v1/rovers/' + context.name + '/photos?sol=' + context.sol + '&api_key=' + credentials.nasaKey, getPhotos)
	} 
      else {
      console.log(err);
      console.log(response.statusCode);
    }
  }

  function getPhotos(err, response, body){
    if(!err && response.statusCode < 400){
	  context.photoResponse = JSON.parse(body);
	  context.photos = [];
	  context.photoResponse.photos.forEach(function(element) {
	  context.photos.push(element);
		});
      res.render('opportunity',context);
    }else{
      console.log(err);
      console.log(response.statusCode);
    }
  }
});

app.post('/opportunity', function(req,res){
	var context = {};
	context.name = 'opportunity';
	context.camera = req.body.camera;
	context.date = req.body.date;
	context.sol = req.body.martian_sol;
	
	if (context.camera == ""){
		if (context.sol != ""){
			request('https://api.nasa.gov/mars-photos/api/v1/rovers/' + context.name + '/photos?sol=' 
			+ context.sol + '&api_key=' + credentials.nasaKey, getPhotos);
		}
		else{
			request('https://api.nasa.gov/mars-photos/api/v1/rovers/' + context.name + '/photos?earth_date=' 
			+ context.date + '&api_key=' + credentials.nasaKey, getPhotos);
		}
	}
	else{
		if (context.sol != ""){
			request('https://api.nasa.gov/mars-photos/api/v1/rovers/' + context.name + '/photos?sol=' 
			+ context.sol + '&camera=' + context.camera + '&api_key=' + credentials.nasaKey, getPhotos);
		}
		else{
			request('https://api.nasa.gov/mars-photos/api/v1/rovers/' + context.name + '/photos?earth_date=' 
			+ context.date + '&camera=' + context.camera + '&api_key=' + credentials.nasaKey, getPhotos);
		}
	}

	function getPhotos(err, response, body){
		if(!err && response.statusCode < 400){
		  context.photoResponse = JSON.parse(body);
		  context.photos = [];
		  context.photoResponse.photos.forEach(function(element) {
		  context.photos.push(element);
		  context.date = element.earth_date;
		  context.sol = element.sol;
			});
		  if (context.photos.length == 0){
			  context.no_image = "No image avaliable for " + context.camera.toUpperCase() + " on " + context.date + ".";
		  }
		  else{
			  context.no_image = "";
		  }
		  console.log(context.camera);
		  console.log(context.date);
		  res.render(context.name,context);
		}else{
		  console.log(err);
		  console.log(response.statusCode);
		}
	}
});


app.get('/spirit',function(req,res){
  var context = {};
  request('https://api.nasa.gov/mars-photos/api/v1/manifests/spirit?api_key=' + credentials.nasaKey, getManifest);

  function getManifest(err, response, body){
    if(!err && response.statusCode < 400){
      context.manifest = JSON.parse(body);
	  context.sol = context.manifest.photo_manifest.max_sol;
	  context.date = context.manifest.photo_manifest.max_date;
	  context.name = context.manifest.photo_manifest.name;
      request('https://api.nasa.gov/mars-photos/api/v1/rovers/' + context.name + '/photos?sol=' + context.sol + '&api_key=' + credentials.nasaKey, getPhotos)
	} 
      else {
      console.log(err);
      console.log(response.statusCode);
    }
  }

  function getPhotos(err, response, body){
    if(!err && response.statusCode < 400){
	  context.photoResponse = JSON.parse(body);
	  context.photos = [];
	  context.photoResponse.photos.forEach(function(element) {
	  context.photos.push(element);
		});
      res.render('spirit',context);
    }else{
      console.log(err);
      console.log(response.statusCode);
    }
  }
});

app.post('/spirit', function(req,res){
	var context = {};
	context.name = 'spirit';
	context.camera = req.body.camera;
	context.date = req.body.date;
	context.sol = req.body.martian_sol;
	
	if (context.camera == ""){
		if (context.sol != ""){
			request('https://api.nasa.gov/mars-photos/api/v1/rovers/' + context.name + '/photos?sol=' 
			+ context.sol + '&api_key=' + credentials.nasaKey, getPhotos);
		}
		else{
			request('https://api.nasa.gov/mars-photos/api/v1/rovers/' + context.name + '/photos?earth_date=' 
			+ context.date + '&api_key=' + credentials.nasaKey, getPhotos);
		}
	}
	else{
		if (context.sol != ""){
			request('https://api.nasa.gov/mars-photos/api/v1/rovers/' + context.name + '/photos?sol=' 
			+ context.sol + '&camera=' + context.camera + '&api_key=' + credentials.nasaKey, getPhotos);
		}
		else{
			request('https://api.nasa.gov/mars-photos/api/v1/rovers/' + context.name + '/photos?earth_date=' 
			+ context.date + '&camera=' + context.camera + '&api_key=' + credentials.nasaKey, getPhotos);
		}
	}

	function getPhotos(err, response, body){
		if(!err && response.statusCode < 400){
		  context.photoResponse = JSON.parse(body);
		  context.photos = [];
		  context.photoResponse.photos.forEach(function(element) {
		  context.photos.push(element);
		  context.date = element.earth_date;
		  context.sol = element.sol;
			});
		  if (context.photos.length == 0){
			  context.no_image = "No image avaliable for " + context.camera.toUpperCase() + " on " + context.date + ".";
		  }
		  else{
			  context.no_image = "";
		  }
		  console.log(context.camera);
		  console.log(context.date);
		  res.render(context.name,context);
		}else{
		  console.log(err);
		  console.log(response.statusCode);
		}
	}
});

app.get('/aboutme', function(req,res){
  res.render('aboutme');
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

/* app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
}); */

app.listen(port);