var fs = require('fs');
var path = require('path');
const logger = require('../_common/utils/logger.js');
const dl = require('request-progress');
var ProgressBar = require('progress');
var http = require('http');


module.exports = {
	playing:false,
	_playing:false, // internal delay flag
	_player:null,
	_ref:null,
	BINPATH:null,
	init:function(){
		
		var pIsmpvAvailable = new Promise((resolve,reject) =>
		{
			if(!fs.existsSync(module.exports.BINPATH+'/mpv.exe')){
				logger.warn('Unable to find mpv.exe !');
				logger.warn('Received path was : '+module.exports.BINPATH);
				//logger.warn('Please download it from http://mpv.io and place mpv.exe in '+module.exports.BINPATH);
				logger.warn('Attempting to download it from Shelter...')

				var mpvFile = fs.createWriteStream(module.exports.BINPATH+'/mpvtemp.exe');
				var req = http.request({
				host: 'toyundamugen.shelter.moe',
				port: 80,
				path: '/mpv.exe'
				});
				
				req.on('response', function(res){
					var len = parseInt(res.headers['content-length'], 10);
					
					console.log();
					var bar = new ProgressBar('  Downloading mpv [:bar] :percent :etas', {
						complete: '=',
						incomplete: ' ',
						width: 40,
						total: len
					});
					
					res.on('data', function (chunk) {
						bar.tick(chunk.length);
					});
					
					res.on('end', function () {
						console.log('\n');
						fs.rename(module.exports.BINPATH+'/mpvtemp.exe',
								  module.exports.BINPATH+'/mpv.exe',
								  function(err) {
									  if (err) {
										  logger.error('Unable to rename downloaded file : '+err)
										  reject();
									  } else {
										  logger.info('Downloaded mpv.')						
										  resolve();
									  }
									}
						)						
					});
					res.pipe(mpvFile);
				});			
				req.on('error',function(err){
					reject(err);
				})	
				req.end();
			} else {
				resolve();
			}
		})

		Promise.all([pIsmpvAvailable]).then(function()
		{
			var mpvAPI = require('node-mpv');
			module.exports._player = new mpvAPI({
				audio_only: false,
				binary: path.join(module.exports.BINPATH,'mpv.exe'),
				socket: '\\\\.\\pipe\\mpvsocket',
				time_update: 1,
				verbose: false,
				debug: false,
			},
			[
				//"--fullscreen",
				"--no-border",
				"--keep-open=yes",
				"--idle=yes",
				"--fps=60",
				"--screen=1",
			]);

			module.exports._player.on('statuschange',function(status){
				if(module.exports._playing && status && status.filename && status.filename.match(/__blank__/))
				{
					// immediate switch to Playing = False to avoid multiple trigger
					module.exports.playing = false;
					module.exports._playing = false;
					module.exports._player.pause();
					module.exports.onEnd(module.exports._ref);
					module.exports._ref = null;
				}
			});
			logger.info('Player is READY.')
		})
		.catch(function(err) {
			logger.error('Player is NOT READY : '+err);
			process.exit();
		});
	},
	play: function(video,subtitle,reference){
		module.exports.playing = true;
		if(fs.existsSync(video)){
			logger.info('Playing : '+video);
			module.exports._ref = reference;
			module.exports._player.loadFile(video);
			module.exports._player.volume(70);
			module.exports._player.play();
			// video may need some delay to play
			setTimeout(function(){
				module.exports._playing = true;
				if(subtitle)
				{
					if(fs.existsSync(subtitle)){
						logger.info('subtitle : '+subtitle);
						module.exports._player.addSubtitles(subtitle);//, flag, title, lang)
					}
					else
					{
						logger.error('Can not find subtitle '+subtitle)
					}
				}
				else
				{
					logger.info('No subtitles');
				}
				module.exports._player.loadFile(path.join(__dirname,'assets/__blank__.png'),'append');
			},500);
		}
		else {
			module.exports.playing = false;
			logger.error('Can not find video '+video)
		}
	},
	stop:function()
	{
		module.exports._player.loadFile(path.join(__dirname,'assets/__blank__.png'));
	},
	pause: function(){
		console.log(module.exports._player);
		module.exports._player.pause();
	},
	resume: function(){
		module.exports._player.play();
	},
	onEnd:function(ref){
		// événement émis pour quitter l'application
		logger.error('_player/index.js :: onEnd not set')
	},
};