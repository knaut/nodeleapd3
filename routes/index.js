
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index', { title: 'Node + Leap + D3', scripts: ['javascripts/leap.js',
  																'javascripts/vendor/js/jquery-1.9.1.js',
  																'javascripts/vendor/js/jquery-ui-1.10.3.custom.js',
  																'javascripts/vendor/js/d3.js',
  																'javascripts/ui.js',
  																'javascripts/main4.js'] 
	});
};